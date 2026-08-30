# Network Rules

This repository is the shared source of truth for the complete routing rule
layer used by Clash Verge and Shadowrocket. It does not store a complete client
profile.

Nodes, subscriptions, proxy groups, WARP identities, DNS settings, and other
transport configuration stay on each device. Repository rules only select one
of three policies:

- `DIRECT`: connect directly
- `REJECT`: block the request
- ordinary proxy: use the client's existing default proxy policy

No rule depends on a subscription name, a specific node, or WARP.

## Personal rule sets

| File | Policy | Rules |
| --- | --- | ---: |
| `rules/direct.list` | `DIRECT` | 58 |
| `rules/reject.list` | `REJECT` | 114 |
| `rules/proxy.list` | ordinary proxy | 130 |
| `rules/shadowrocket-force-remote-dns.list` | Shadowrocket proxy overrides | 11 |

The first three lists contain classical match expressions supported by both
clients: `DOMAIN`, `DOMAIN-SUFFIX`, `DOMAIN-KEYWORD`, and `IP-CIDR`. Exact
duplicates are removed and entries are sorted so changes remain reviewable.

Shadowrocket's original rules use its client-specific `force-remote-dns`
modifier on 11 of the 130 proxy matches. Those 11 matches are repeated in the
Shadowrocket override list and placed before the common proxy list; the
Shadowrocket template adds the modifier to that `RULE-SET` reference. The common
list omits the unsupported modifier so Mihomo can parse the same rule matches.

## Shared rule order

Both client templates replace the complete existing rule layer in this order:

1. personal direct rules -> `DIRECT`
2. personal reject rules -> `REJECT`
3. Blackmatrix7 OpenAI rules -> ordinary proxy
4. Blackmatrix7 Claude rules -> ordinary proxy
5. Broker rules -> ordinary proxy
6. personal proxy rules -> ordinary proxy
7. Blackmatrix7 China classical rules -> `DIRECT`
8. Blackmatrix7 China domain rules -> `DIRECT`
9. China GeoIP -> `DIRECT`
10. everything else -> ordinary proxy

Clash additionally puts `GEOIP,LAN,DIRECT,no-resolve` first. Shadowrocket's four
private IPv4 ranges are already part of `direct.list`; its 11 DNS overrides are
evaluated before the application and common proxy lists.

The Clash template uses the subscription's existing terminal `MATCH` or `FINAL`
policy as the ordinary proxy policy. The Shadowrocket template uses its existing
`PROXY` policy. Neither template creates a proxy group.

## Apply to clients

### Clash Verge

`templates/clash-verge-script.js` is the Clash rendering of the authoritative
rule layer. Merge that logic into the device's existing global extension script,
preserving machine-local proxy and WARP definitions. The script replaces
`config.rules` instead of retaining subscription rules, while leaving existing
proxy groups unchanged.

### Shadowrocket

Replace only the existing `[Rule]` section with
`templates/shadowrocket.conf`. Keep all other sections on the device unchanged.

## Updating rules

- Add, remove, or edit personal entries in the matching file under `rules/`.
- If one of the 11 Shadowrocket DNS overrides changes, update both its common
  match in `proxy.list` and its match in the override list.
- Keep each list unique and sorted, then update its count in this README.
- When changing a third-party rule source, update the corresponding URL in both
  client templates in the same change.
- After a push, changes to `rules/*.list` are picked up when each client's remote
  rule sets refresh. Clash providers request updates every 24 hours;
  Shadowrocket controls its own refresh timing.
- Changes to rule order, policy, or third-party URLs modify the templates, not
  the already-installed configuration. Reapply the changed template to each
  affected client.
- Treat both client templates as authoritative renderings of this repository and
  review their source order together to prevent drift.
- Review the diff before committing. Applying or publishing repository changes
  is a separate step from editing live client configuration.

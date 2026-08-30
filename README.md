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
| `rules/direct.list` | `DIRECT` | 0 |
| `rules/reject.list` | `REJECT` | 0 |
| `rules/proxy.list` | ordinary proxy | 0 |
| `rules/shadowrocket-force-remote-dns.list` | Shadowrocket proxy overrides | 10 |

The first three lists contain classical match expressions supported by both
clients: `DOMAIN`, `DOMAIN-SUFFIX`, `DOMAIN-KEYWORD`, and `IP-CIDR`. Exact
duplicates are removed and entries are sorted so changes remain reviewable. They
remain valid rule-set entry points when they contain no rules.

Shadowrocket's separate legacy list keeps 10 client-specific
`force-remote-dns` overrides. The Shadowrocket template adds that modifier to
the corresponding `RULE-SET` reference. Clash does not load this list.

## Online rule sets

The templates reference maintained upstream files directly rather than copying
their contents into this repository:

- Blackmatrix7 AdvertisingLite -> `REJECT`
- Blackmatrix7 OpenAI and Claude -> ordinary proxy
- Arthur-vx Broker -> ordinary proxy
- Blackmatrix7 China classical and domain rules -> `DIRECT`

Clash and Shadowrocket download these sources themselves. GitHub hosts the
personal lists, the Shadowrocket DNS override list, and the client templates.

## Shared rule order

Both client templates replace the complete existing rule layer in this order:

1. client-specific LAN bypass -> `DIRECT`
2. personal direct rules -> `DIRECT`
3. personal reject rules -> `REJECT`
4. Blackmatrix7 AdvertisingLite -> `REJECT`
5. Blackmatrix7 OpenAI rules -> ordinary proxy
6. Blackmatrix7 Claude rules -> ordinary proxy
7. Broker rules -> ordinary proxy
8. personal proxy rules -> ordinary proxy
9. Blackmatrix7 China classical rules -> `DIRECT`
10. Blackmatrix7 China domain rules -> `DIRECT`
11. China GeoIP -> `DIRECT`
12. everything else -> ordinary proxy

Clash implements the first step with `GEOIP,LAN,DIRECT,no-resolve`.
Shadowrocket keeps the IPv4 loopback range and three RFC 1918 private ranges
directly in its template. Its 10 DNS overrides are evaluated after reject rules
and before the application and common proxy lists.

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
- Edit `shadowrocket-force-remote-dns.list` only when a domain needs
  Shadowrocket's client-specific DNS behavior.
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

# Network Rules

Shared routing rule sets for Mihomo and Shadowrocket.

## Rule sets

- `rules/direct.list`: bypass proxies
- `rules/proxy.list`: use the regular proxy policy
- `rules/reject.list`: reject matching traffic

Each file contains match expressions only. Client-specific policies are assigned
when the rule set is referenced by Mihomo or Shadowrocket.

The shared files use plain-text rules supported by both clients:

- `DOMAIN`
- `DOMAIN-SUFFIX`
- `DOMAIN-KEYWORD`

The templates use abstract policy names only. Concrete proxy providers, node
names, subscription URLs, credentials, and transport dependencies stay in local
client configuration and are not stored in this repository.

Example:

```text
DOMAIN,api.example.com
DOMAIN-SUFFIX,example.com
DOMAIN-KEYWORD,example
```

## Client templates

- `templates/clash-verge-script.js`: merge the shared rule providers and
  abstract route groups into an existing Clash Verge global extension script
- `templates/shadowrocket.conf`: merge the shared rule sets and abstract route
  groups into an existing Shadowrocket configuration

Both templates define `ROUTE-PROXY` for the regular proxy policy and `ROUTE-AI`
for AI traffic. Replace the local policy placeholders before use. Rules never
reference a subscription group, node, or WARP transport directly.

Do not replace an existing Clash Verge `Script.js` with the template. Merge its
shared-routing logic into the existing script so machine-local outbounds remain
intact. The Shadowrocket file is a configuration fragment, not a complete
importable profile.

Application providers come directly from Blackmatrix7 in the client-specific
format required by each client.

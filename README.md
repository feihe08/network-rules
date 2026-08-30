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

Proxy providers, policy groups, node names, subscription URLs, credentials, and
transport dependencies stay in client-specific configuration and are not stored
in this repository.

Example:

```text
DOMAIN,api.example.com
DOMAIN-SUFFIX,example.com
DOMAIN-KEYWORD,example
```

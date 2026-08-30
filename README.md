# Network Rules

Shared routing rule sets for Mihomo and Shadowrocket.

## Rule sets

- `rules/direct.list`: bypass proxies
- `rules/proxy.list`: use the regular proxy policy
- `rules/warp.list`: use the WARP policy
- `rules/reject.list`: reject matching traffic

Each file contains match expressions only. Client-specific policies are assigned
when the rule set is referenced by Mihomo or Shadowrocket.

Example:

```text
DOMAIN,api.example.com
DOMAIN-SUFFIX,example.com
DOMAIN-KEYWORD,example
```

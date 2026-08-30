const ROUTE_PROXY = "ROUTE-PROXY";
const ROUTE_AI = "ROUTE-AI";

// Replace these values while merging this template into the local Script.js.
const REGULAR_PROXY_POLICY = "REPLACE_WITH_REGULAR_PROXY_POLICY";
const AI_EXIT_POLICY = "REPLACE_WITH_AI_EXIT_POLICY";

const ruleProviders = {
  "personal-direct": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/direct.list",
    path: "./ruleset/personal-direct.list",
    interval: 86400,
    proxy: ROUTE_PROXY,
  },
  "personal-reject": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/reject.list",
    path: "./ruleset/personal-reject.list",
    interval: 86400,
    proxy: ROUTE_PROXY,
  },
  "blackmatrix-openai": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI_No_Resolve.yaml",
    path: "./ruleset/blackmatrix-openai.yaml",
    interval: 86400,
    proxy: ROUTE_PROXY,
  },
  "blackmatrix-claude": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml",
    path: "./ruleset/blackmatrix-claude.yaml",
    interval: 86400,
    proxy: ROUTE_PROXY,
  },
  "personal-proxy": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/proxy.list",
    path: "./ruleset/personal-proxy.list",
    interval: 86400,
    proxy: ROUTE_PROXY,
  },
};

const sharedRules = [
  "RULE-SET,personal-direct,DIRECT",
  "RULE-SET,personal-reject,REJECT",
  `RULE-SET,blackmatrix-openai,${ROUTE_AI}`,
  `RULE-SET,blackmatrix-claude,${ROUTE_AI}`,
  `RULE-SET,personal-proxy,${ROUTE_PROXY}`,
];

function main(config) {
  const existingGroups = Array.isArray(config["proxy-groups"])
    ? config["proxy-groups"]
    : [];
  const routeGroupNames = new Set([ROUTE_PROXY, ROUTE_AI]);

  config["proxy-groups"] = [
    ...existingGroups.filter((group) => !routeGroupNames.has(group.name)),
    {
      name: ROUTE_PROXY,
      type: "select",
      proxies: [REGULAR_PROXY_POLICY],
    },
    {
      name: ROUTE_AI,
      type: "select",
      proxies: [ROUTE_PROXY, AI_EXIT_POLICY],
    },
  ];

  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    ...ruleProviders,
  };

  const sharedProviderNames = new Set(Object.keys(ruleProviders));
  const existingRules = Array.isArray(config.rules) ? config.rules : [];
  const retainedRules = existingRules.filter((rule) => {
    const [type, provider] = rule.split(",");
    return type !== "RULE-SET" || !sharedProviderNames.has(provider);
  });

  config.rules = [...sharedRules, ...retainedRules];
  return config;
}

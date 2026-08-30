const ruleProviders = {
  "personal-direct": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/direct.list",
    path: "./ruleset/personal-direct.list",
    interval: 86400,
  },
  "personal-reject": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/reject.list",
    path: "./ruleset/personal-reject.list",
    interval: 86400,
  },
  "blackmatrix-advertising-lite": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/AdvertisingLite/AdvertisingLite_Classical.yaml",
    path: "./ruleset/blackmatrix-advertising-lite.yaml",
    interval: 86400,
  },
  "blackmatrix-openai": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI_No_Resolve.yaml",
    path: "./ruleset/blackmatrix-openai.yaml",
    interval: 86400,
  },
  "blackmatrix-claude": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml",
    path: "./ruleset/blackmatrix-claude.yaml",
    interval: 86400,
  },
  broker: {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/Arthur-vx/broker-rules/main/rule/Clash/Broker/Broker.yaml",
    path: "./ruleset/broker.yaml",
    interval: 86400,
  },
  "personal-proxy": {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/feihe08/network-rules/main/rules/proxy.list",
    path: "./ruleset/personal-proxy.list",
    interval: 86400,
  },
  "blackmatrix-china": {
    type: "http",
    behavior: "classical",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/China/China.yaml",
    path: "./ruleset/blackmatrix-china.yaml",
    interval: 86400,
  },
  "blackmatrix-china-domain": {
    type: "http",
    behavior: "domain",
    format: "yaml",
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/China/China_Domain.yaml",
    path: "./ruleset/blackmatrix-china-domain.yaml",
    interval: 86400,
  },
};

function resolveRegularProxyPolicy(config, profileName) {
  const outboundNames = new Set([
    ...(config["proxy-groups"] || []).map((group) => group.name),
    ...(config.proxies || []).map((proxy) => proxy.name),
  ]);
  const rules = Array.isArray(config.rules) ? config.rules : [];

  for (let index = rules.length - 1; index >= 0; index -= 1) {
    const rule = rules[index];

    if (typeof rule !== "string") {
      continue;
    }

    const [type, policy] = rule.split(",").map((part) => part.trim());
    if ((type === "MATCH" || type === "FINAL") && outboundNames.has(policy)) {
      return policy;
    }
  }

  throw new Error(`Regular proxy policy not found for profile: ${profileName}`);
}

function buildRules(regularProxyPolicy) {
  return [
    "GEOIP,LAN,DIRECT,no-resolve",
    "RULE-SET,personal-direct,DIRECT",
    "RULE-SET,personal-reject,REJECT",
    "RULE-SET,blackmatrix-advertising-lite,REJECT",
    `RULE-SET,blackmatrix-openai,${regularProxyPolicy}`,
    `RULE-SET,blackmatrix-claude,${regularProxyPolicy}`,
    `RULE-SET,broker,${regularProxyPolicy}`,
    `RULE-SET,personal-proxy,${regularProxyPolicy}`,
    "RULE-SET,blackmatrix-china,DIRECT,no-resolve",
    "RULE-SET,blackmatrix-china-domain,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",
    `MATCH,${regularProxyPolicy}`,
  ];
}

function main(config, profileName) {
  const regularProxyPolicy = resolveRegularProxyPolicy(config, profileName);
  const configuredRuleProviders = Object.fromEntries(
    Object.entries(ruleProviders).map(([name, provider]) => [
      name,
      { ...provider, proxy: regularProxyPolicy },
    ]),
  );

  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    ...configuredRuleProviders,
  };
  config.rules = buildRules(regularProxyPolicy);

  return config;
}

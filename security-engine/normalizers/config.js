export default function normalizeConfig(configText) {
  const lines = configText.split("\n");

  const secrets = lines.filter((line) =>
    /key|secret|token|password/i.test(line)
  );

  return {
    type: "config",
    secrets,
    secretCount: secrets.length,
  };
}

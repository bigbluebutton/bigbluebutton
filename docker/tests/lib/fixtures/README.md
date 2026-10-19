# Fixtures for test-entrypoint-lib.sh

Protected: part of the helper's interface tests. Values are the project fixtures
(`bbb.example.com`, `203.0.113.10`, documentation ranges), never real data.

- `envsubst/`, `gomplate/`: the same templates in both candidate syntaxes. Only braced
  upper-case names (`${BBB_DOMAIN}`) are project variables; nginx variables such as `$host`
  must pass through unchanged. `basic.expected` is the expected output for either tool.
- `yaml/`: Tier 3 override merge. Maps merge deeply, arrays are replaced, as upstream documents
  for settings.yml overrides (docs/docs/administration/configuration-files.md).

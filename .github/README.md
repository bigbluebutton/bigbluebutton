# .github

This directory contains GitHub Actions workflows and related configuration files.

## ci-tested-plugins.json

Defines the list of official BigBlueButton plugins that are cloned, built, and tested as part of the automated CI pipeline (`workflows/automated-tests.yml`).

Each entry has the following fields:

| Field | Description |
|---|---|
| `name` | Plugin identifier, used to name build artifacts and test directories |
| `repo` | GitHub repository (`owner/repo`) to clone the plugin from |
| `ref` | Branch, tag, or commit ref to check out |
| `servePath` | Path under `/var/www/bigbluebutton-default/` where built assets are deployed. Note: nginx maps `/plugins/` URLs to `/var/www/bigbluebutton-default/assets/`, so use `assets/plugins/<name>` to serve at `/plugins/<name>/` |
| `flakyTests` | Optional list of test names to skip in CI (merged with the plugin repo's own `flaky-tests.txt`) |

To add a new official plugin to CI testing, add an entry to this file following the same structure. To mark a test as flaky without touching the plugin repo, add it to that plugin's `flakyTests` list using the format `Test Suite › Test Spec`.

### Example

```json
[
  {
    "name": "plugin-pick-random-user",
    "repo": "bigbluebutton/bbb-plugin-pick-random-user",
    "ref": "v0.0.x",
    "servePath": "assets/plugins/pick-random-user-plugin",
    "flakyTests": [
      "My Suite › should do something when button is clicked",
      "Another Suite › should handle edge case correctly"
    ]
  }
]
```

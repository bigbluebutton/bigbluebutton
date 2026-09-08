# CI-tested official plugins

`ci-tested-plugins.json` defines the list of official BigBlueButton plugins that are downloaded, built, and tested as part of the automated CI pipeline (`workflows/automated-tests.yml`).

Each entry has the following fields:

| Field | Description |
|---|---|
| `name` | Plugin identifier, used to name build artifacts and test directories |
| `repo` | GitHub repository (`owner/repo`) to clone the plugin from |
| `ref` | Git ref to download. Must be a **concrete** ref — a released tag (`v0.0.10`) or a commit SHA. It is passed straight to `https://github.com/<repo>/archive/<ref>.tar.gz`, so a ref that does not literally exist makes CI fail with a 404 |
| `servePath` | Path under `/var/www/bigbluebutton-default/` where built assets are deployed. Note: nginx maps `/plugins/` URLs to `/var/www/bigbluebutton-default/assets/`, so use `assets/plugins/<name>` to serve at `/plugins/<name>/` |
| `flakyTests` | Optional list of test names to skip in CI (merged with the plugin repo's own `flaky-tests.txt`) |

To add a new official plugin to CI testing, add an entry to this file following the same structure. To mark a test as flaky without touching the plugin repo, add it to that plugin's `flakyTests` list using the format `Test Suite › Test Spec` (the separator is U+203A `›`, the same one Playwright uses in its test titles).

Prefer pinning `ref` to a released tag rather than a branch: a branch moves under CI, so a green run on one commit says nothing about the next one, and a failure can no longer be reproduced from the config alone. Bump the tag deliberately when a new plugin release is out.

### Example

```json
[
  {
    "name": "plugin-pick-random-user",
    "repo": "bigbluebutton/bbb-plugin-pick-random-user",
    "ref": "v0.0.10",
    "servePath": "assets/plugins/pick-random-user-plugin",
    "flakyTests": [
      "My Suite › should do something when button is clicked",
      "Another Suite › should handle edge case correctly"
    ]
  }
]
```

## How the plugins are run

Plugins are independent of one another — each suite injects only its own manifest URL and creates meetings with random IDs — so each one's full pipeline (download → `npm ci` → `build-bundle` → deploy → Playwright run) is treated as a single unit, and several units run concurrently in one job. Adding a plugin to the JSON is therefore the only thing needed; nothing else has to be touched.

The behaviour is tuned through job-level env vars in `workflows/automated-tests.yml`:

| Variable | Default | Effect |
|---|---|---|
| `PLUGIN_PARALLELISM` | `2` | How many plugins are processed at once. All plugins share one BBB instance and one runner, and each plugin's Playwright config uses a single worker under CI, so raising this trades wall-clock for contention. Set to `1` to process one plugin at a time |
| `PLUGIN_TIMEOUT_MINUTES` | `15` | Wall-clock cap on one plugin's whole pipeline. A plugin that exceeds it is reported as a failure (exit 124) and the others carry on |
| `PLUGIN_BUDGET_BASE_MINUTES` | `10` | Fixed slack in the step timeout, on top of the per-wave budget |

The step timeout is **not** a fixed number: it is computed before the step runs, so adding plugins can't silently walk CI into a timeout. Plugins run `PLUGIN_PARALLELISM` at a time, so cost scales with the number of waves rather than the raw count:

```
waves   = ceil(plugin_count / PLUGIN_PARALLELISM)
timeout = PLUGIN_BUDGET_BASE_MINUTES + waves * PLUGIN_TIMEOUT_MINUTES
```

Budgeting a full `PLUGIN_TIMEOUT_MINUTES` per wave guarantees the step can never be killed before every plugin has had its own cap — so a red build always points at a specific plugin instead of at the step timeout. With the defaults: 1 plugin → 25 min, 3 plugins → 40 min, 10 plugins → 85 min. These are ceilings, not expected runtimes; a healthy plugin pipeline takes a few minutes.

Per-plugin output is buffered and replayed as a collapsible group at the end of the step, so concurrent runs don't interleave in the CI log.

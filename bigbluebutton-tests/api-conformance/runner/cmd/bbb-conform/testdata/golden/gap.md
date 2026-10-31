# Gap matrix

| Endpoint | fake-web | fake-api |
|---|---|---|
| [create](#create) | 2/2 | 0/2 |
| [getMeetingInfo](#getmeetinginfo) | 1/1 | 0/1 |
| [getMeetings](#getmeetings) | 9/9 | 8/9 |
| [version](#version) | 1/1 | 0/1 |

## create

| Case | fake-web | fake-api |
|---|---|---|
| `create.smoke.lifecycle` | PASS | [XFAIL](https://example.com/issues/2) |
| `create.smoke.side-effects` | PASS | XFAIL |

- `create.smoke.lifecycle` on fake-api: create answers returnCode, and end isn't implemented (step 1 (line 8): returncode: expected "SUCCESS", got nothing)
- `create.smoke.side-effects` on fake-api: create answers returnCode, and end isn't implemented (step 1 (line 8): returncode: expected "SUCCESS", got nothing)

## getMeetingInfo

| Case | fake-web | fake-api |
|---|---|---|
| `getMeetingInfo.smoke.json-error` | PASS | XFAIL |

- `getMeetingInfo.smoke.json-error` on fake-api: errors are always XML (step 1 (line 7): format: expected json, got xml)

## getMeetings

| Case | fake-web | fake-api |
|---|---|---|
| `getMeetings.smoke.checksum-accepted-first` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-middle` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-sha1` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-sha256` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-sha384` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-sha512` | PASS | PASS |
| `getMeetings.smoke.checksum-accepted-uppercase` | PASS | XFAIL |
| `getMeetings.smoke.checksum-rejected-duplicate` | PASS | PASS |
| `getMeetings.smoke.checksum-rejected-wrong` | PASS | PASS |

- `getMeetings.smoke.checksum-accepted-uppercase` on fake-api: checksums are compared case-sensitively (step 1 (line 15): returncode: expected "SUCCESS", got "FAILED")

## version

| Case | fake-web | fake-api |
|---|---|---|
| `version.smoke.fields` | PASS | XFAIL |

- `version.smoke.fields` on fake-api: the version endpoint isn't served (step 1 (line 7): returncode: expected "SUCCESS", got a text response has no returncode field)

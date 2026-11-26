# bbb-web coverage

The suite reached 42.9% of the methods in scope and 84.3% of their branches, and 86.5% of the lines in their packages (JaCoCo's count, generated code included).

- Methods not reached: 4 (triaged: 3; untriaged: 1)
- Generated methods ignored: 1

| Package | Methods | Lines | Branches | Untriaged |
|---|---|---|---|---|
| `org.bigbluebutton.api` | 1/4 (25.0%) | 9/14 (64.3%) | 3/4 (75.0%) | 1 |
| `org.bigbluebutton.api2.domain` | 1/1 (100.0%) | 1/1 (100.0%) | 0/0 (100.0%) | 0 |
| `org.bigbluebutton.web.controllers` | 1/2 (50.0%) | 80/89 (89.9%) | 40/47 (85.1%) | 0 |
| **Total** | 3/7 (42.9%) | 90/104 (86.5%) | 43/51 (84.3%) | 1 |

## Below the baseline

| Package | Baseline | Now |
|---|---|---|
| `org.bigbluebutton.api` | 3/4 (75.0%) | 1/4 (25.0%) |

---
org.bigbluebutton.api.MeetingService#log(Ljava/lang/String;I)V line 700

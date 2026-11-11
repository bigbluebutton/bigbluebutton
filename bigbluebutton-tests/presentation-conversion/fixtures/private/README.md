# Private fixtures

Presentations shared with the maintainers privately (by reporters who could not publish their files) are meant to
live in a separate private repository with the same layout: one `<id>.yaml` manifest per file, as described in
`../README.md`, plus the file itself. Everything here except this README is ignored by git.

The tier is not wired in phase 1: CI checks nothing out here and holds no key for that repository, because anyone who
can see a run can download what it uploads. The HTML and JSON reports carry the rendered slides as attachments, and
a bless run uploads the goldens it writes. A local run includes the manifests placed here, at any depth, only when
`PC_TIERS` names `private`, for example `PC_TIERS=private bin/run-pass.sh defaults`.

Goldens kept with the private fixtures, failure messages redacted so they do not quote a file's content, and a
separate report are phase 2 work, tracked in #26139. `bin/collect-evidence.sh` already never copies the server output
of a private fixture into `evidence/`.

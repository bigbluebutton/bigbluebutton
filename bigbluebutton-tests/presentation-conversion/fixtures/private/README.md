# Private fixtures

Presentations shared with the maintainers privately (by reporters who could not publish their files) live in a
separate private repository with the same layout: one `<id>.yaml` manifest per file, as described in
`../README.md`, plus the file itself.

CI checks that repository out into `fixtures/private/repo/` when the `PRESENTATION_FIXTURES_DEPLOY_KEY` secret is
available, and skips the tier with a notice otherwise (for example on pull requests from forks). Locally, clone it
into the same place. Everything here except this README is ignored by git.

Results of private fixtures are reported by fixture id only, and `bin/collect-evidence.sh` never copies their
server output into the CI artifacts.

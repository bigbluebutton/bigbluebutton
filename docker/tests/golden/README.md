# Golden-file tests

`run-golden.sh` renders each image's configuration with `--render-only` and the
fixture env, and compares it with the committed `expected/` tree; `--parity` also compares with
the bare-metal reference (`docker/tests/parity/`) under an allowlist of intended differences, each with a reason.
`test-golden.sh` and `selftest-image/` are the protected interface tests.

`test-expectations.sh` (protected) adds the per-image `expectations.yaml` check: values
that must appear in rendered files, entrypoint failures that must happen (missing variable,
newline in a value), and rendering under an arbitrary UID. A case's `expectations.yaml` is
written before its image; the byte-level `expected/` tree and `parity.yaml` are written with the
image and reviewed.

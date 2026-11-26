#!/bin/bash

# TODO: revert to the upstream tag (v5.5.0 or later) once bbb-playback PR #367
# (fix multiline notes regex + whiteboard image rendering) is merged and a new
# tag is cut.
git clone --branch fix/whiteboard-image-render --depth 1 https://github.com/imdt-claudiop/bbb-playback bbb-playback

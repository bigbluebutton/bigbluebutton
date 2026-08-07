#!/bin/bash

# TODO: revert to upstream tag once bbb-playback PR #367 (fix multiline notes
# regex + whiteboard image rendering) is merged and a new tag is cut.
git clone --branch fix/whiteboard-image-render --depth 1 https://github.com/imdt-claudiop/bbb-playback bbb-playback

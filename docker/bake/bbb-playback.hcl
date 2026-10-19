# The player of the presentation recording format, served on port 8080 (compose service
# `playback`, profile `recording`; the edge nginx proxies /playback/presentation/2.3 to it).
# Built from the release bbb-playback.placeholder.sh pins: tag v5.4.8, fetched by its commit.
target "_playback-tags" {
    tags = bbb_image_tags("playback")
}

target "playback" {
    inherits = ["_playback-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/bbb-playback"
    contexts = {
        packages = "./build/packages-template"
        # bbb-playback v5.4.8
        bbb-playback = "https://github.com/bigbluebutton/bbb-playback.git#1e3b6c202d2a6e285db45e7f7a9e21b77309e686"
    }
    args = {
        # `git rev-parse --short HEAD` of that commit, as the package build sets it
        BBB_PLAYBACK_BUILD = "1e3b6c2"
    }
}

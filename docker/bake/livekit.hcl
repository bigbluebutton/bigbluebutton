target "_livekit-tags" {
    tags = bbb_image_tags("livekit")
}

target "livekit" {
    inherits = ["_livekit-tags", "docker-metadata-action", "_entrypoint-lib"]
    # yq for TARGETARCH from bbb-yq-go (amd64 and arm64).
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/livekit"
    contexts = {
        bbb-livekit = "./build/packages-template/bbb-livekit"
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

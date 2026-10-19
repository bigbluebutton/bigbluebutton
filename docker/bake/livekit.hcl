target "_livekit-tags" {
    tags = bbb_image_tags("livekit")
}

target "livekit" {
    inherits = ["_livekit-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only: upstream's yq checksum file (build/packages-template/bbb-yq-go) covers amd64 only
    # (docker/livekit/Dockerfile, TARGETARCH check).
    platforms = ["linux/amd64"]
    context = "./docker/livekit"
    contexts = {
        bbb-livekit = "./build/packages-template/bbb-livekit"
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

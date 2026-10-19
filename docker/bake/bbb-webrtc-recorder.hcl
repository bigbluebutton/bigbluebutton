target "_bbb-webrtc-recorder-tags" {
    tags = bbb_image_tags("webrtc-recorder")
}

target "bbb-webrtc-recorder" {
    inherits = ["_bbb-webrtc-recorder-tags", "docker-metadata-action", "_entrypoint-lib"]
    # Upstream's image (the base) is published for amd64 and arm64; yq for TARGETARCH from
    # bbb-yq-go (amd64 and arm64).
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/bbb-webrtc-recorder"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

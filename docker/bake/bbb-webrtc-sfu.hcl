target "_bbb-webrtc-sfu-tags" {
    tags = bbb_image_tags("webrtc-sfu")
}

target "bbb-webrtc-sfu" {
    inherits = ["_bbb-webrtc-sfu-tags", "docker-metadata-action", "_entrypoint-lib"]
    # Upstream's image (the base) is published for amd64 and arm64; the layer adds no binaries.
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/bbb-webrtc-sfu"
}

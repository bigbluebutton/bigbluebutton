target "_shared-notes-tags" {
    tags = bbb_image_tags("shared-notes")
}

target "shared-notes" {
    inherits = ["_shared-notes-tags", "docker-metadata-action", "_entrypoint-lib"]
    # yq for TARGETARCH from bbb-yq-go (amd64 and arm64).
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./bbb-shared-notes-server"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

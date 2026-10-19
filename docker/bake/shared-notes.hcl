target "_shared-notes-tags" {
    tags = bbb_image_tags("shared-notes")
}

target "shared-notes" {
    inherits = ["_shared-notes-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only: upstream's yq checksum file (build/packages-template/bbb-yq-go) covers amd64 only
    # (bbb-shared-notes-server/Dockerfile, TARGETARCH check).
    platforms = ["linux/amd64"]
    context = "./bbb-shared-notes-server"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

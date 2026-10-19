target "_export-annotations-tags" {
    tags = bbb_image_tags("export-annotations")
}

target "export-annotations" {
    inherits = ["_export-annotations-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only: upstream's yq checksum file (build/packages-template/bbb-yq-go) covers amd64 only
    # (bbb-export-annotations/Dockerfile, TARGETARCH check).
    platforms = ["linux/amd64"]
    context = "./bbb-export-annotations"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
        # the package's fonts and bbb-web's blank slide, as the packages ship them
        fonts = "./build/packages-template/bbb-export-annotations/fonts"
        slides = "./bigbluebutton-config/slides"
    }
}

target "_graphql-middleware-tags" {
    tags = bbb_image_tags("graphql-middleware")
}

target "graphql-middleware" {
    inherits = ["_graphql-middleware-tags", "docker-metadata-action", "_entrypoint-lib"]
    # The config stage runs on BUILDPLATFORM and needs yq for BUILDARCH; bbb-yq-go covers
    # amd64 and arm64 (build/packages-template/bbb-yq-go).
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./bbb-graphql-middleware"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

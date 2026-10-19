target "_graphql-middleware-tags" {
    tags = bbb_image_tags("graphql-middleware")
}

target "graphql-middleware" {
    inherits = ["_graphql-middleware-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only in CI: the config stage runs on the build platform and needs upstream's yq,
    # whose checksum file (build/packages-template/bbb-yq-go) covers amd64 only. Cross-building
    # arm64 on an amd64 host works; CI builds every platform natively.
    platforms = ["linux/amd64"]
    context = "./bbb-graphql-middleware"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

target "_graphql-server-tags" {
    tags = bbb_image_tags("graphql-server")
}

target "graphql-server" {
    inherits = ["_graphql-server-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only: the iMDT graphql-engine binary is x86-64 only (bbb-graphql-server/Dockerfile,
    # TARGETARCH check), as in upstream's package.
    platforms = ["linux/amd64"]
    context = "./bbb-graphql-server"
    contexts = {
        graphql-server-pkg = "./build/packages-template/bbb-graphql-server"
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
    }
}

target "_graphql-actions-tags" {
    tags = bbb_image_tags("graphql-actions")
}

target "graphql-actions" {
    inherits = ["_graphql-actions-tags", "docker-metadata-action"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./bbb-graphql-actions"
}

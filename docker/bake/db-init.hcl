target "_db-init-tags" {
    tags = bbb_image_tags("db-init")
}

target "db-init" {
    inherits = ["_db-init-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/db-init"
    contexts = {
        graphql-server = "./bbb-graphql-server"
        shared-notes-server = "./bbb-shared-notes-server"
    }
}

target "_coturn-tags" {
    tags = bbb_image_tags("coturn")
}

target "coturn" {
    inherits = ["_coturn-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context  = "./docker/coturn"
}

target "_certbot-tags" {
    tags = bbb_image_tags("certbot")
}

target "certbot" {
    inherits = ["_certbot-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/certbot"
}

target "_haproxy-tags" {
    tags = bbb_image_tags("haproxy")
}

target "haproxy" {
    inherits = ["_haproxy-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/haproxy"
}

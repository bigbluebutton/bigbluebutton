target "_nginx-tags" {
    tags = bbb_image_tags("nginx")
}

target "nginx" {
    inherits = ["_nginx-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/nginx"
    contexts = {
        packages = "./build/packages-template"
        bigbluebutton-web = "./bigbluebutton-web"
        learning-dashboard = "./bbb-learning-dashboard"
        rap-presentation = "./record-and-playback/presentation/scripts"
        bigbluebutton-config = "./bigbluebutton-config"
    }
}

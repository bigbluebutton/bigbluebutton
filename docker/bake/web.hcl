target "_web-tags" {
    tags = bbb_image_tags("web")
}

target "web" {
    inherits = ["_web-tags", "docker-metadata-action"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./bigbluebutton-web"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-web = "target:bbb-common-web"
        bbb-web-package = "./build/packages-template/bbb-web"
        slides = "./bigbluebutton-config/slides"
        html5-client = "target:html5-client"
    }
}

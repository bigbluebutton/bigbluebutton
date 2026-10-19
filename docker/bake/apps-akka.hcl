# akka-apps: built on bbb-common-message (build stage) and the Java base (runtime, which
# already contains the entrypoint helper). html5-client: the built client, whose settings.yml
# (with the build identifier and release) akka-apps reads and hands to clients.
target "_apps-akka-tags" {
    tags = bbb_image_tags("apps-akka")
}

target "apps-akka" {
    inherits = ["_apps-akka-tags", "docker-metadata-action"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./akka-bbb-apps"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
        html5-client = "target:html5-client"
    }
}

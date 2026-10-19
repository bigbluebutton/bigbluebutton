target "_record-and-playback-tags" {
    tags = bbb_image_tags("record-and-playback")
}

target "record-and-playback" {
    inherits = ["_record-and-playback-tags", "docker-metadata-action"]
    # amd64 only: the Dockerfile downloads the amd64 builds of dockerize and yq.
    platforms = ["linux/amd64"]
    context = "./record-and-playback"
    contexts = {
        bigbluebutton-config = "./bigbluebutton-config"
    }
}

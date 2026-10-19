target "_record-and-playback-tags" {
    tags = bbb_image_tags("record-and-playback")
}

target "record-and-playback" {
    inherits = ["_record-and-playback-tags", "docker-metadata-action", "_entrypoint-lib"]
    # amd64 only: mkclean (bbb-mkclean, which the rap scripts run after encoding audio and video)
    # builds only for x86_64: its coremake has no 64-bit ARM Linux configuration, and upstream's
    # build.sh installs the gcc_linux_x64 build. bbb-presentation-video's prebuilt package is
    # architecture all, the rest comes from Ubuntu.
    platforms = ["linux/amd64"]
    context = "./record-and-playback"
    contexts = {
        bbb-yq-go = "./build/packages-template/bbb-yq-go"
        bbb-mkclean = "./build/packages-template/bbb-mkclean"
        # bbb-record, bigbluebutton-release and the daily cleanup script of bbb-config
        bigbluebutton-config = "./bigbluebutton-config"
        # the ImageMagick policy that bbb-install writes (bbb-web ships the same file)
        bbb-web-docker = "./bigbluebutton-web/docker"
        # bbb-web's default bigbluebutton.properties, read by the analytics callback
        bbb-web-conf = "./bigbluebutton-web/grails-app/conf"
    }
}

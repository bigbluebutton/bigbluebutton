target "docker-metadata-action" {}

target "_java-base" {
    context = "./docker/java-base"
}

target "bbb-common-message" {
    context = "./bbb-common-message"
}

target "apps-akka" {
    inherits = ["docker-metadata-action"]
    context = "./akka-bbb-apps"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
        html5-config = "./bigbluebutton-html5/private/config"
    }
}

target "bbb-common-web" {
    context = "./bbb-common-web"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
    }
}

target "web" {
    inherits = ["docker-metadata-action"]
    context = "./bigbluebutton-web"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-web = "target:bbb-common-web"
        slides = "./bigbluebutton-config/slides"
    }
}

target "html5-client" {
    inherits = ["docker-metadata-action"]
    context = "./bigbluebutton-html5"
    contexts = {
        client-build = "./build/packages-template/bbb-html5"
    }
}

target "learning-dashboard" {
      inherits = ["docker-metadata-action"]
      context = "./bbb-learning-dashboard"
}

target "graphql-actions" {
      inherits = ["docker-metadata-action"]
      context = "./bbb-graphql-actions"
}

target "graphql-middleware" {
      inherits = ["docker-metadata-action"]
      context = "./bbb-graphql-middleware"
}

target "graphql-server" {
      inherits = ["docker-metadata-action"]
      context = "./bbb-graphql-server"
}

target "export-annotations" {
      inherits = ["docker-metadata-action"]
      context = "./bbb-export-annotations"
}

target "etherpad" {
      inherits = ["docker-metadata-action"]
      context = "./docker/etherpad"
}

target "record-and-playback" {
    inherits = ["docker-metadata-action"]
    context = "./record-and-playback"
    contexts = {
        bigbluebutton-config = "./bigbluebutton-config"
    }
}

target "nginx" {
      inherits = ["docker-metadata-action"]
      dockerfile = "./docker/nginx/Dockerfile"
      context = "."
}

group "default" {
  targets = ["apps-akka", "html5-client", "learning-dashboard", "graphql-actions", "graphql-middleware", "graphql-server", "export-annotations", "etherpad", "web", "record-and-playback", "nginx"]
}

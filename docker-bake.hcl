target "docker-metadata-action" {}

target "_java-base" {
    context = "./docker/java-base"
}

target "bbb-common-message" {
    context = "./bbb-common-message"
}

target "akka-bbb-apps" {
    inherits = ["docker-metadata-action"]
    context = "./akka-bbb-apps"
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
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

group "default" {
  targets = ["akka-bbb-apps", "html5-client", "learning-dashboard", "graphql-actions", "graphql-middleware", "graphql-server", "export-annotations", "etherpad", "web"]
}

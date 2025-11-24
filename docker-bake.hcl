target "docker-metadata-action" {}

target "_java-base" {
    context = "./docker/java-base"
}

target "bbb-common-message" {
    context = "./bbb-common-message"
}

target "akka-bbb-apps" {
    inherits = ["docker-metadata-action"]
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
    }
}

target "html5-client" {
      inherits = ["docker-metadata-action"]
}

target "learning-dashboard" {
      inherits = ["docker-metadata-action"]
}

target "graphql-actions" {
      inherits = ["docker-metadata-action"]
}

target "graphql-middleware" {
      inherits = ["docker-metadata-action"]
}

target "graphql-server" {
      inherits = ["docker-metadata-action"]
}

target "export-annotations" {
      inherits = ["docker-metadata-action"]
}

target "etherpad" {
      inherits = ["docker-metadata-action"]
}

group "default" {
  targets = ["akka-bbb-apps", "html5-client", "learning-dashboard", "graphql-actions", "graphql-middleware", "graphql-server", "export-annotations", "etherpad"]
}
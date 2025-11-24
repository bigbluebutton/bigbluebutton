variable "TAG" {
    default = "latest"
}

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
    tags = ["bigbluebutton/akka-bbb-apps:${TAG}"]
    contexts = {
        java-base = "target:_java-base"
        bbb-common-message = "target:bbb-common-message"
    }
}

target "html5-client" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/html5-client:${TAG}"]
      context = "./bigbluebutton-html5"
}

target "learning-dashboard" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/learning-dashboard:${TAG}"]
      context = "./bbb-learning-dashboard"
}

target "graphql-actions" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/graphql-actions:${TAG}"]
      context = "./bbb-graphql-actions"
}

target "graphql-middleware" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/graphql-middleware:${TAG}"]
      context = "./bbb-graphql-middleware"
}

target "graphql-server" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/graphql-server:${TAG}"]
      context = "./bbb-graphql-server"
}

target "export-annotations" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/export-annotations:${TAG}"]
      context = "./bbb-export-annotations"
}

target "etherpad" {
      inherits = ["docker-metadata-action"]
      tags = ["bigbluebutton/bbb-etherpad:${TAG}"]
      context = "./docker/etherpad"
}

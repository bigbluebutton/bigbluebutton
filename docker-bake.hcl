variable "TAG" {
  default = "latest"
}

target "_java-base" {
  context = "./docker/java-base"
}

target "bbb-common-message" {
  context = "./bbb-common-message"
}

target "akka-bbb-apps" {
  context = "./akka-bbb-apps"
  tags = ["bigbluebutton/akka-bbb-apps:${TAG}"]
  contexts = {
      java-base = "target:_java-base"
      bbb-common-message = "target:bbb-common-message"
    }
}

target "html5-client" {
  tags = ["bigbluebutton/html5-client:${TAG}"]
  context = "./bigbluebutton-html5"
}

target "learning-dashboard" {
  tags = ["bigbluebutton/learning-dashboard:${TAG}"]
  context = "./bbb-learning-dashboard"
}

target "graphql-actions" {
  tags = ["bigbluebutton/graphql-actions:${TAG}"]
  context = "./bbb-graphql-actions"
}

target "graphql-middleware" {
  tags = ["bigbluebutton/graphql-middleware:${TAG}"]
  context = "./bbb-graphql-middleware"
}

target "graphql-server" {
  tags = ["bigbluebutton/graphql-server:${TAG}"]
  context = "./bbb-graphql-server"
}

target "export-annotations" {
  tags = ["bigbluebutton/export-annotations:${TAG}"]
  context = "./bbb-export-annotations"
}

target "etherpad" {
  tags = ["bigbluebutton/bbb-etherpad:${TAG}"]
  context = "./docker/etherpad"
}

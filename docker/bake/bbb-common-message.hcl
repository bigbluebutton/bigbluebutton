# Build stage only (never pushed): bbb-common-message published to the local Maven and Ivy
# repositories, with sbt and JDK 21. Used as the named context `bbb-common-message` by
# apps-akka (docker/bake/apps-akka.hcl) and bbb-common-web (docker/bake/bbb-common-web.hcl).
target "bbb-common-message" {
    context = "./bbb-common-message"
}

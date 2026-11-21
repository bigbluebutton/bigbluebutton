# Images of BigBlueButton. Build them all with `docker buildx bake`; see docker/README.md.

variable "BBB_IMAGE_REGISTRY" {
  default = "ghcr.io/bigbluebutton/bigbluebutton"
}

variable "BBB_IMAGE_TAG" {
  default = "latest"
}

# Build id of the HTML5 client (About dialog and ?v= cache buster), as COMMIT_DATE in build/setup.sh
variable "CLIENT_BUILD" {
  default = "0"
}

function "tags" {
  params = [name]
  result = ["${BBB_IMAGE_REGISTRY}/bbb-${name}:${BBB_IMAGE_TAG}"]
}

# Every image and base builds for both platforms, except where a target says otherwise
target "_image" {
  platforms = ["linux/amd64", "linux/arm64"]
  labels    = { "org.opencontainers.image.source" = "https://github.com/bigbluebutton/bigbluebutton" }
}

group "default" {
  targets = [
    "apps-akka", "web", "html5-client", "learning-dashboard",
    "graphql-actions", "graphql-middleware", "graphql-server",
    "export-annotations", "shared-notes-server", "record-and-playback", "nginx",
    "webrtc-sfu", "webrtc-recorder", "webhooks", "playback",
  ]
}

# Shared build bases, used as named contexts and not published
target "_java-base" {
  inherits = ["_image"]
  context  = "./docker/java-base"
}

target "_bbb-common-message" {
  inherits = ["_image"]
  context  = "./bbb-common-message"
}

target "_bbb-common-web" {
  inherits = ["_image"]
  context  = "./bbb-common-web"
  contexts = { bbb-common-message = "target:_bbb-common-message" }
}

target "apps-akka" {
  inherits = ["_image"]
  tags     = tags("apps-akka")
  context  = "./akka-bbb-apps"
  args     = { CLIENT_BUILD = CLIENT_BUILD }
  contexts = {
    java-base          = "target:_java-base"
    bbb-common-message = "target:_bbb-common-message"
    html5-config       = "./bigbluebutton-html5/private/config"
  }
}

target "web" {
  inherits = ["_image"]
  tags     = tags("web")
  context  = "./bigbluebutton-web"
  args     = { CLIENT_BUILD = CLIENT_BUILD }
  contexts = {
    java-base      = "target:_java-base"
    bbb-common-web = "target:_bbb-common-web"
    slides         = "./bigbluebutton-config/slides"
    html5-config   = "./bigbluebutton-html5/private/config"
  }
}

target "html5-client" {
  inherits = ["_image"]
  tags     = tags("html5-client")
  context  = "./bigbluebutton-html5"
  contexts = { client-build = "./build/packages-template/bbb-html5" }
  args     = { CLIENT_BUILD = CLIENT_BUILD }
}

target "learning-dashboard" {
  inherits = ["_image"]
  tags     = tags("learning-dashboard")
  context  = "./bbb-learning-dashboard"
}

target "graphql-actions" {
  inherits = ["_image"]
  tags     = tags("graphql-actions")
  context  = "./bbb-graphql-actions"
}

target "graphql-middleware" {
  inherits = ["_image"]
  tags     = tags("graphql-middleware")
  context  = "./bbb-graphql-middleware"
}

target "graphql-server" {
  inherits = ["_image"]
  tags     = tags("graphql-server")
  context  = "./bbb-graphql-server"
}

target "export-annotations" {
  inherits = ["_image"]
  tags     = tags("export-annotations")
  context  = "./bbb-export-annotations"
  contexts = {
    fonts  = "./build/packages-template/bbb-export-annotations/fonts"
    slides = "./bigbluebutton-config/slides"
  }
}

target "shared-notes-server" {
  inherits = ["_image"]
  tags     = tags("shared-notes-server")
  context  = "./bbb-shared-notes-server"
}

# amd64 only: mkclean has no 64-bit ARM build target, and its package is amd64 only too
target "record-and-playback" {
  inherits  = ["_image"]
  platforms = ["linux/amd64"]
  tags      = tags("record-and-playback")
  context   = "./record-and-playback"
  contexts  = {
    bigbluebutton-config = "./bigbluebutton-config"
    bbb-mkclean          = "./build/packages-template/bbb-mkclean"
    placeholders         = "."
  }
}

target "nginx" {
  inherits   = ["_image"]
  tags       = tags("nginx")
  context    = "."
  dockerfile = "docker/nginx/Dockerfile"
}

# External components: their Dockerfiles run <component>.placeholder.sh, the script the package build
# runs to fetch the component, so the image and the package build the same version from one place
target "webrtc-sfu" {
  inherits = ["_image"]
  tags     = tags("webrtc-sfu")
  context  = "./docker/bbb-webrtc-sfu"
  contexts = { placeholders = "." }
}

target "webrtc-recorder" {
  inherits = ["_image"]
  tags     = tags("webrtc-recorder")
  context  = "./docker/bbb-webrtc-recorder"
  contexts = { placeholders = "." }
}

target "webhooks" {
  inherits = ["_image"]
  tags     = tags("webhooks")
  context  = "./docker/bbb-webhooks"
  contexts = { placeholders = "." }
}

target "playback" {
  inherits = ["_image"]
  tags     = tags("playback")
  context  = "./docker/bbb-playback"
  contexts = { placeholders = "." }
}

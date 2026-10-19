# Shared bake definitions. Each image's targets live in their own file, docker/bake/<image>.hcl,
# so image changes do not touch this file. Pass this file first, then all per-image files:
#
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) [TARGET...]
#
# Always pass the files explicitly: without -f, bake also loads docker-compose.yml from the
# repo root and merges its services into the definition. See docker/README.md, "Building".

# Image names as docker-compose.yml uses them: ${BBB_IMAGE_REGISTRY}/bbb-<image>:${BBB_IMAGE_TAG}
# (docker/config-contract.yaml; list in docker/README.md, "Image names"). Local builds are
# tagged localhost/bbb-<image>:4.0.1; run them with BBB_IMAGE_REGISTRY=localhost.
variable "BBB_IMAGE_REGISTRY" {
    default = "localhost"
}
variable "BBB_IMAGE_TAG" {
    default = "4.0.1"
}

# Platforms of the images that build for every architecture (comma-separated). Each image
# target sets `platforms`: amd64-only images list "linux/amd64" with the reason, all others
# use this variable. Empty by default, so local builds are for the host's platform. CI sets
# it to "linux/amd64,linux/arm64" and reads each image's platforms with `bake --print`
# (.github/workflows/build-all-images.yml); docker/README.md, "CI".
variable "BBB_PLATFORMS" {
    default = ""
}

# Tags of one image. An image target inherits a target that sets them before
# docker-metadata-action, so that CI's tags (set there) replace them.
function "bbb_image_tags" {
    params = [name]
    result = ["${BBB_IMAGE_REGISTRY}/bbb-${name}:${BBB_IMAGE_TAG}"]
}

# Overridden in CI by the bake file of docker/metadata-action (tags, labels).
target "docker-metadata-action" {}

# The shared entrypoint helper as the named context `entrypoint-lib` (P3). Image targets
# inherit it; their Dockerfile then uses
#   COPY --from=entrypoint-lib entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
target "_entrypoint-lib" {
    contexts = {
        entrypoint-lib = "./docker/lib"
    }
}

# Java 21 runtime base for the JVM images, used as a named context:
#   contexts = { java-base = "target:_java-base" }
target "_java-base" {
    inherits = ["_entrypoint-lib"]
    context = "./docker/java-base"
}

# Bake does not merge groups across files (the last definition wins), so the group lists every
# image target here, one per line.
group "default" {
    targets = [
        "apps-akka",
        "html5-client",
        "learning-dashboard",
        "graphql-actions",
        "graphql-middleware",
        "graphql-server",
        "export-annotations",
        "web",
        # record-and-playback: not in the default group until the recording stack is reworked
        # (its Dockerfile is still the PR #22894 one on Debian 11; apt fetches 404 in CI, 2026-10-19).
        "nginx",
        "postgres",
        "db-init",
        "coturn",
        "livekit",
        "haproxy",
        "shared-notes",
        "bbb-webrtc-sfu",
        "certbot",
        "setup",
    ]
}

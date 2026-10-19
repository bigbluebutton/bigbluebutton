target "_setup-tags" {
    tags = bbb_image_tags("setup")
}

# The contract and its tools (docker/config-contract.yaml, docker/contract/) as the named
# context `contract`: the image compiles its variable list from them at build time.
target "setup" {
    inherits = ["_setup-tags", "docker-metadata-action", "_entrypoint-lib"]
    platforms = compact(split(",", BBB_PLATFORMS))
    context = "./docker/setup"
    contexts = {
        contract = "./docker"
    }
}

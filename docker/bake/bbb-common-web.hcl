target "bbb-common-web" {
    context = "./bbb-common-web"
    contexts = {
        bbb-common-message = "target:bbb-common-message"
    }
}

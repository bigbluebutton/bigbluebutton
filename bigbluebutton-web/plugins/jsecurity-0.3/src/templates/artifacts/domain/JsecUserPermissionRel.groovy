class @domain.prefix@UserPermissionRel {
    @domain.prefix@User user
    @domain.prefix@Permission permission
    String target
    String actions

    static constraints = {
        target(nullable: true, blank: false)
        actions(nullable: false, blank: false)
    }
}

class @domain.prefix@RolePermissionRel {
    @domain.prefix@Role role
    @domain.prefix@Permission permission
    String target
    String actions

    static constraints = {
        actions(nullable: false, blank: false)
    }
}

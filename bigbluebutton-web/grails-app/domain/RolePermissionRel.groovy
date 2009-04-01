class RolePermissionRel {
    Role role
    Permission permission
    String target
    String actions

    static constraints = {
        actions(nullable: false, blank: false)
    }
}

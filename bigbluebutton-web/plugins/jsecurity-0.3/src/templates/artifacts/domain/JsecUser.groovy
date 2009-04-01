class @domain.prefix@User {
    String username
    String passwordHash

    static constraints = {
        username(nullable: false, blank: false)
    }
}

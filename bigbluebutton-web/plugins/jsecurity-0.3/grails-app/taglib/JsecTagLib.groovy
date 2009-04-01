import org.jsecurity.SecurityUtils

class JsecTagLib {
    static namespace = 'jsec'

    /**
     * This tag only writes its body to the output if the current user
     * is logged in.
     */
    def isLoggedIn = { attrs, body ->
        if (checkAuthenticated()) {
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * is not logged in.
     */
    def isNotLoggedIn = { attrs, body ->
        if (!checkAuthenticated()) {
            out << body()
        }
    }

    /**
     * A synonym for 'isLoggedIn'. This is the same name as used by
     * the standard JSecurity tag library.
     */
    def authenticated = isLoggedIn

    /**
     * A synonym for 'isNotLoggedIn'. This is the same name as used by
     * the standard JSecurity tag library.
     */
    def notAuthenticated = isNotLoggedIn

    /**
     * This tag only writes its body to the output if the current user
     * is either logged in or remembered from a previous session (via
     * the "remember me" cookie).
     */
    def user = { attrs, body ->
        if (SecurityUtils.subject.principal != null) {
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * is neither logged in nor remembered from a previous session (via
     * the "remember me" cookie).
     */
    def notUser = { attrs, body ->
        if (SecurityUtils.subject.principal == null) {
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * is remembered from a previous session (via the "remember me"
     * cookie) but not currently logged in.
     */
    def remembered = { attrs, body ->
        if (SecurityUtils.subject.principal != null && !checkAuthenticated()) {
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * is not remembered from a previous session (via the "remember me"
     * cookie). This is the case if they are a guest user or logged in.
     */
    def notRemembered = { attrs, body ->
        if (SecurityUtils.subject.principal == null || checkAuthenticated()) {
            out << body()
        }
    }

    /**
     * <p>Outputs the string form of the current user's identity. By default
     * this assumes that the subject has only one principal; its string
     * representation is written to the page.</p>
     * Optional attributes:
     * <ul>
     * <li><i>type</i>: Species the type or class of the principal to
     * use</li>
     * <li><i>property</i>: Specifies the name of the property on the
     * principal to use as the string representation, e.g.
     * <code>firstName</code></li>
     * </ul>
     */
    def principal = { attrs ->
        def subject = SecurityUtils.subject

        if (subject != null) {
            // Get the principal to print out.
            def principal
            if (attrs['type']) {
                // A principal of a particular type/class has been
                // requested.
                principal = subject.getPrincipalByType(attrs['type'])
            }
            else {
                principal = subject.principal
            }

            // Now write the principal to the page.
            if (principal != null) {
                // If a 'property' attribute has been specified, then
                // we access the property with the same name on the
                // principal and write that to the page. Otherwise, we
                // just use the string representation of the principal
                // itself.
                if (attrs['property']) {
                    out << principal."${attrs['property']}"
                }
                else {
                    out << principal.toString()
                }
            }
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * has the given role.
     */
    def hasRole = { attrs, body ->
        // Does the user have the required role?
        if (checkRole(attrs)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * does not have the given role.
     */
    def lacksRole = { attrs, body ->
        // Does the user have the required role?
        if (!checkRole(attrs)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * has all the given roles (inversion of lacksAnyRole).
     */
    def hasAllRoles = { attrs, body ->
        // Extract the name of the role from the attributes.
        def inList = attrs['in']
        if (!inList)
            throwTagError('Tag [hasAllRoles] must have [in] attribute.')
        if (SecurityUtils.subject.hasAllRoles(inList)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * has none of the given roles (inversion of hasAllRoles).
     */
    def lacksAnyRole = { attrs, body ->
        // Extract the name of the role from the attributes.
        def inList = attrs['in']
        if (!inList)
            throwTagError('Tag [lacksAnyRole] must have [in] attribute.')
        if (!SecurityUtils.subject.hasAllRoles(inList)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * has any of the given roles (inversion of lacksAllRoles).
     */
    def hasAnyRole = { attrs, body ->
        // Extract the name of the role from the attributes.
        def inList = attrs['in']
        if (!inList)
            throwTagError('Tag [hasAnyRole] must have [in] attribute.')
        if (SecurityUtils.subject.hasRoles(inList).any()) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * doesn't have all of the given roles (inversion of hasAnyRole).
     */
    def lacksAllRoles = { attrs, body ->
        // Extract the name of the role from the attributes.
        def inList = attrs['in']
        if (!inList)
            throwTagError('Tag [lacksAllRoles] must have [in] attribute.')
        if (!SecurityUtils.subject.hasRoles(inList).any()) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * has the given permission.
     */
    def hasPermission = { attrs, body ->
        if (checkPermission(attrs)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * This tag only writes its body to the output if the current user
     * does not have the given permission.
     */
    def lacksPermission = { attrs, body ->
        if (!checkPermission(attrs)) {
            // Output the body text.
            out << body()
        }
    }

    /**
     * Checks whether the current user is authenticated or not. Returns
     * <code>true</code> if the user is authenticated, otherwise
     * <code>false</code>.
     */
    private boolean checkAuthenticated() {
        // Get the user's security context.
        return SecurityUtils.subject.authenticated
    }

    /**
     * Checks whether the current user has the role specified in the
     * given tag attributes. Returns <code>true</code> if the user
     * has the role, otherwise <code>false</code>.
     */
    private boolean checkRole(attrs) {
        // Extract the name of the role from the attributes.
        def roleName = attrs['name']
        def inList = attrs['in']
        if (roleName) {
            // Does the user have the required role?
            return SecurityUtils.subject.hasRole(roleName)
        }
        else if (inList) {
            log.warn ('Use of tags [hasRole/lacksRole] with attribute [in] is deprecated. Use tags [hasAnyRole/lacksAllRoles] instead.')
            boolean[] results = SecurityUtils.subject.hasRoles(inList)
            return results.any()
        }
        else {
            throwTagError('Tag [hasRole] must have one of [name] or [in] attributes.')
        }
    }

    /**
     * Checks whether the current user has the permission specified in
     * the given tag attributes. Returns <code>true</code> if the user
     * has the permission, otherwise <code>false</code>.
     */
    private boolean checkPermission(attrs) {
        def permission
        def permClass = attrs['type']
        if (!permClass) {
            // If 'type' is not set, then the permission itself must
            // be specified.
            permission = attrs['permission']

            if (!permission) {
                throwTagError('Tag [hasPermission] must have either a [type] attribute or a [permission] one.')
            }

            if (!(permission instanceof org.jsecurity.authz.Permission)) {
                throwTagError('Attribute [permission] must be an instance of org.jsecurity.authz.Permission.')
            }
        }
        else {
            // If 'type' is given, then 'actions' must also be set.
            // 'target' defaults to '*'.
            def actions = attrs['actions']
            if (!actions) {
                throwTagError('Tag [hasPermission] must have an [actions] attribute if [type] is used.')
            }

            def target = attrs['target']
            if (!target) target = '*'

            // Create the permission from the information given.
            try {
                def clazz = Class.forName(permClass)
                def constructor = clazz.getConstructor([ String, String ] as Class[])
                permission = constructor.newInstance([ target, actions ] as Object[])
            }
            catch (ClassNotFoundException ex) {
                throwTagError("Cannot find class [${permClass}] from attribute [hasPermission].")
            }
        }

        // Now we have the permission, check whether the user has it.
        return SecurityUtils.subject.isPermitted(permission)
    }
}

import org.jsecurity.SecurityUtils

/**
 * Base class for controllers to provide access control. Controllers
 * no longer need the extend this class as the access control is now
 * handled by Grails filters.
 * @deprecated
 */
abstract class JsecAuthBase {
    def beforeInterceptor = {
        // Check that the current user is authenticated and
        // has permission to access the current action.
        def subject = SecurityUtils.subject

        // Is this action configured for access control?
        if (!roleMap.containsKey(actionName) && !permissionMap.containsKey(actionName) &&
                !roleMap.containsKey('*') && !permissionMap.containsKey('*')) {
            // This action has no access control requirements,
            // so the user does not need to be logged in to
            // access it.
            return true
        }

        // Is the user authenticated?
        if (!subject.authenticated) {
            // Save the original URI that the user is attempting to
            // access.
            session.originalRequestParams = params

            // User is not authenticated, so redirect to the login page.
            redirect(controller: 'auth', action: 'login')
            return false
        }

        // First check any required roles.
        def requiredRoles = roleMap[actionName]
        if (requiredRoles == null) requiredRoles = []
        if (roleMap['*']) {
            // Add any roles that apply to all actions.
            requiredRoles.addAll(roleMap['*'])
        }

        if (!requiredRoles.isEmpty() && !subject.hasAllRoles(requiredRoles)) {
            // User does not have the required roles. Redirect
            // to an error page?
            redirect(controller: 'auth', action: 'unauthorized')
            return false
        }

        // Now check any required permissions.
        def requiredPermissions = permissionMap[actionName]
        if (requiredPermissions == null) requiredPermissions = []
        if (permissionMap['*']) {
            // Add any permission that applies to all actions.
            requiredPermissions.addAll(permissionMap['*'])
        }

        if (!requiredPermissions.isEmpty() && !subject.isPermittedAll(requiredPermissions)) {
            // User does not have the requisite permissions -
            // redirect to an error page?
            redirect(controller: 'auth', action: 'unauthorized')
            return false 
        }

        // User has passed all checks, so they may access the
        // action.
        return true
    }
}

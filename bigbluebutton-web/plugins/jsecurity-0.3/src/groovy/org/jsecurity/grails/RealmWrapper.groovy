/*
 * Copyright 2007 the original author or authors.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jsecurity.grails

import org.apache.commons.logging.LogFactory
import org.jsecurity.authc.AuthenticationException
import org.jsecurity.authc.AuthenticationToken
import org.jsecurity.authz.AuthorizationException
import org.jsecurity.authz.Permission
import org.jsecurity.authz.UnauthorizedException
import org.jsecurity.subject.PrincipalCollection
import org.jsecurity.authc.AuthenticationInfo
import org.jsecurity.authc.SimpleAuthenticationInfo
import org.jsecurity.subject.SimplePrincipalCollection

/**
 * Simple implementation of the JSecurity Realm that wraps a 'Realm'
 * artefact. It is basically an adapter between the Grails world and
 * the JSecurity world.
 * @author Peter Ledbrook
 */
class RealmWrapper extends RealmAdapter {
    private static final LOGGER = LogFactory.getLog('grails.app.realm')

    Object realm
    Class tokenClass

    void setRealm(Object realm) {
        this.realm = realm
    }

    void setTokenClass(Class clazz) {
        this.tokenClass = clazz
    }

    AuthenticationInfo getAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        // If the target realm has an 'authenticate' method, we use
        // that.
        try {
            def account = this.realm.authenticate(authenticationToken)

            if (account instanceof AuthenticationInfo) {
                return account
            }
            else {
                // Create an account to host the returned principals.
                def principals = []
                if (account instanceof Collection) {
                    principals.addAll(account)
                }
                else {
                    principals << account
                }

                return new SimpleAuthenticationInfo(new SimplePrincipalCollection(account, getName()), null)
            }
        }
        catch (MissingMethodException ex) {
            // No authentication performed.
            if (ex.message.indexOf('authenticate') && LOGGER.errorEnabled) {
                LOGGER.error "Unable to authenticate with ${getName()}", ex
            }
            return null
        }
        catch (Exception ex) {
            if (LOGGER.infoEnabled) {
                LOGGER.info "Unable to authenticate with ${getName()} - ${ex.message}"
            }
            if (LOGGER.debugEnabled) {
                LOGGER.debug 'The exception', ex
            }
            throw ex
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.realm.Realm#getName()
     */
    String getName() {
        return this.realm.class.name
    }

    /* (non-Javadoc)
     * @see org.jsecurity.realm.Realm#supports(java.lang.Class)
     */
    boolean supports(AuthenticationToken authenticationToken) {
        if (this.tokenClass) {
            return this.tokenClass.isAssignableFrom(authenticationToken.getClass())
        }
        else {
            return false
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#checkPermission(Object, org.jsecurity.authz.Permission)
     */
    void checkPermission(PrincipalCollection principal, Permission permission) throws AuthorizationException {
        if (!isPermitted(principal, permission)) {
            throw new UnauthorizedException("User '${principal.name}' does not have permission '${permission}'")
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#checkPermissions(Object, java.util.Collection)
     */
    void checkPermissions(PrincipalCollection principal, Collection<Permission> permissions) throws AuthorizationException {
        if (!isPermittedAll(principal, permissions)) {
            throw new UnauthorizedException("User '${principal.name}' does not have the required permissions.")
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#checkRole(Object, java.lang.String)
     */
    void checkRole(PrincipalCollection principal, String role) throws AuthorizationException {
        if (!hasRole(principal, role)) {
            throw new UnauthorizedException("User '${principal.name}' does not have role '${role}'")
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#checkRoles(Object, java.util.Collection)
     */
    void checkRoles(PrincipalCollection principal, Collection<String> roles) throws AuthorizationException {
        if (!hasAllRoles(principal, roles)) {
            throw new UnauthorizedException("User '${principal.name}' does not have all these roles: ${roles}")
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#hasAllRoles(Object, java.util.Collection)
     */
    boolean hasAllRoles(PrincipalCollection principal, Collection<String> roles) {
        // First try the 'hasAllRoles' method on the realm.
        principal = getFirstPrincipal(principal)
        if (this.realm.metaClass.respondsTo(this.realm, "hasAllRoles")) {
            this.realm.hasAllRoles(principal, roles)
        }
        else if (this.realm.metaClass.respondsTo(this.realm, "hasRole")) {
            // No specific method, so just check each role individually
            // until we find one that the principal does not have, or
            // we reach the end of the collection of roles.
            roles.each { role ->
                // It the principal does not have this role, then
                // we can immediately return 'false'.
                if (!this.realm.hasRole(getFirstPrincipal(principal), role)) return false
            }

            // All roles have checked out ok, so the principal has
            // all the given roles.
            return true
        }
        else {
            return false
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#hasRole(Object, java.lang.String)
     */
    boolean hasRole(PrincipalCollection principal, String role) {
        // Try the 'hasRole' method on the realm.
        if (this.realm.metaClass.respondsTo(this.realm, "hasRole")) {
            return this.realm.hasRole(getFirstPrincipal(principal), role)
        }
        else {
            return false
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#hasRoles(Object, java.util.List)
     */
    boolean[] hasRoles(PrincipalCollection principal, List<String> roles) {
        // First try the 'hasRoles' method on the realm.
        principal = getFirstPrincipal(principal)

        if (this.realm.metaClass.respondsTo(this.realm, "hasRoles")) {
            return this.realm.hasRoles(principal, roles)
        }
        else if (this.realm.metaClass.respondsTo(this.realm, "hasRole")) {
            // No specific method, so check each role individually.
            boolean[] retval = new boolean[roles.size()]
            for (int i in 0..<roles.size()) {
                retval[i] = hasRole(principal, roles[i])
            }

            return retval
        }
        else {
            // Can't check roles, so return 'false' for each role
            // requested.
            boolean[] retval = new boolean[roles.size()]
            for (int i in 0..<roles.size()) {
                retval[i] = false;
            }

            return retval
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#isPermitted(Object, org.jsecurity.authz.Permission)
     */
    boolean isPermitted(PrincipalCollection principal, Permission permission) {
        // Try the 'isPermitted' method on the realm.
        if (this.realm.metaClass.respondsTo(this.realm, "isPermitted")) {
            return this.realm.isPermitted(getFirstPrincipal(principal), permission)
        }
        else {
            // Can't check permissions, so simply return 'false'.
            return false
        }
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#isPermitted(Object, java.util.List)
     */
    boolean[] isPermitted(PrincipalCollection principal, List<Permission> permissions) {
        boolean[] retval = new boolean[permissions.size()]

        // Try the 'isPermitted' method on the realm.
        principal = getFirstPrincipal(principal)
        if (this.realm.metaClass.respondsTo(this.realm, "isPermitted")) {
            for (int i in 0..<retval.length) {
                retval[i] = this.realm.isPermitted(principal, permissions[i])
            }
        }
        else {
            // Can't check permissions, so simply return 'false' for
            // all of them.
            for (int i in 0..<retval.length) {
                retval[i] = false
            }
        }

        return retval
    }

    /* (non-Javadoc)
     * @see org.jsecurity.authz.AuthorizationOperations#isPermittedAll(Object, java.util.Collection)
     */
    boolean isPermittedAll(PrincipalCollection principal, Collection<Permission> permissions) {
        // Try the 'isPermittedAll' method on the realm.
        principal = getFirstPrincipal(principal)
        if (this.realm.metaClass.respondsTo(this.realm, "isPermittedAll")) {
            return this.realm.isPermittedAll(principal, permissions)
        }
        else if (this.realm.metaClass.respondsTo(this.realm, "isPermitted")) {
            // No specific method, so just check each permission
            // individually until we find one that the principal
            // does not have, or we reach the end of the collection
            // of roles.
            permissions.each { permission ->
                // It the principal does not have this permission,
                // then we can immediately return 'false'.
                if (!this.realm.isPermitted(principal, permission)) return false
            }

            // All permissions have checked out ok, so the principal has
            // all the given permissions.
            return true
        }
        else {
            return false
        }
    }

    private getFirstPrincipal(PrincipalCollection principal) {
        return principal.asList()[0]
    }
}

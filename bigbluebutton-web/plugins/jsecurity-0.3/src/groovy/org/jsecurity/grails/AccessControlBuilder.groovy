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

/**
 * This is the builder that handles the access control DSL used in
 * controllers to specify role and permission settings.
 */
class AccessControlBuilder {
    private Class controllerClass
    private Map internalPermissionMap = [:]
    private Map internalRoleMap = [:]

    AccessControlBuilder(Class controllerClass) {
        this.controllerClass = controllerClass
    }

    /**
     * Read-only access to the 'permissionMap' property.
     */
    def getPermissionMap() {
        return Collections.unmodifiableMap(this.internalPermissionMap)
    }

    /**
     * Read-only access to the 'roleMap' property.
     */
    def getRoleMap() {
        return Collections.unmodifiableMap(this.internalRoleMap)
    }

    /**
     * Expects a map for an argument.
     */
    def role(args) {
        // TODO Add support for a single argument (which is the role name).
        def roleName = args['name']
        if (!roleName) {
            throw new RuntimeException('The [name] parameter is required when defining a role.')
        }

        if (args['action']) {
            // Single action requires this role.
            addRoleToAction(roleName, args['action'])
        }
        else if (args['only']) {
            // Several actions require this role.
            def actions = args['only']
            actions.each { action ->
                addRoleToAction(roleName, action)
            }
        }
        else {
            // All the actions require this role.
            addRoleToAction(roleName, '*')
        }
    }

    /**
     * Expects a map for an argument.
     */
    def permission(args) {
        def perm = args['perm']
        if (!perm) {
            throw new RuntimeException('The [perm] parameter is required when defining a permission.')
        }

        if (args['action']) {
            // Single action requires this permission.
            addPermissionToAction(perm, args['action'])
        }
        else if (args['only']) {
            // Several actions require this perm.
            def actions = args['only']
            actions.each { action ->
                addPermissionToAction(perm, action)
            }
        }
        else {
            // All the actions require this perm.
            addPermissionToAction(perm, '*')
        }
    }

    private addRoleToAction(role, action) {
        def roleList = internalRoleMap[action]
        if (!roleList) {
            internalRoleMap[action] = [ role ]
        }
        else {
            roleList << role
        }
    }

    private addPermissionToAction(permission, action) {
        def permissionList = internalPermissionMap[action]
        if (!permissionList) {
            internalPermissionMap[action] = [ permission ]
        }
        else {
            permissionList << permission
        }
    }
}

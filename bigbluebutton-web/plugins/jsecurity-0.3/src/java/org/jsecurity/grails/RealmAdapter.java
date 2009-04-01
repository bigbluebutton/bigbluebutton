/*
 * Copyright 2007 Peter Ledbrook.
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
package org.jsecurity.grails;

import org.jsecurity.realm.Realm;
import org.jsecurity.authz.AuthorizationException;
import org.jsecurity.authz.permission.WildcardPermission;
import org.jsecurity.subject.PrincipalCollection;

import java.util.List;
import java.util.ArrayList;

/**
 * Adapter for the RealmWrapper which has problems implementing the
 * "String..." methods under JDK 1.5. So, these methods automatically
 * convert the strings into WildcardPermission instances.
 */
public abstract class RealmAdapter implements Realm {
    public void checkPermission(PrincipalCollection principal, String s) throws AuthorizationException {
        checkPermission(principal, new WildcardPermission(s));
    }

    public void checkPermissions(PrincipalCollection principal, String... strings) throws AuthorizationException {
        checkPermissions(principal, toPermissionList(strings));
    }

    public boolean isPermitted(PrincipalCollection principal, String s) {
        return isPermitted(principal, new WildcardPermission(s));
    }

    public boolean[] isPermitted(PrincipalCollection principal, String... strings) {
        return isPermitted(principal, toPermissionList(strings));
    }

    public boolean isPermittedAll(PrincipalCollection principal, String... strings) {
        return isPermittedAll(principal, toPermissionList(strings));
    }

    /**
     * Converts an array of string permissions into a list of
     * {@link WildcardPermission} instances.
     */
    private List toPermissionList(String[] strings) {
        List permissions = new ArrayList(strings.length);
        for (int i = 0; i < strings.length; i++) {
            permissions.add(new WildcardPermission(strings[i]));
        }

        return permissions;
    }
}

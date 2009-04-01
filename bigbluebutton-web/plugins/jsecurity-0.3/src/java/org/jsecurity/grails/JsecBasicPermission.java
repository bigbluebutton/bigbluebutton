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


import org.jsecurity.authz.Permission;

import java.util.*;

/**
 * A basic permission class that can be used with the default DB realm
 * provided with the plugin.
 */
public class JsecBasicPermission implements Permission {
    public static final String WILDCARD = "*";

    private String target;
    private Set actions;
    private String actionsString;

    /**
     * Creates a new permission with the given actions. <b>Note</b> an
     * action may not have any whitespace in it, or ',' or ';' characters.
     * @param target The permission target. The meaning of 'target' is
     * application dependent, for example it may be a file path, a URL,
     * a controller name, or a component name.
     * @param actions A string of actions separated by ',', ';', or
     * whitespace. For example, 'view,edit', 'create, delete',
     * 'create;    modify', 'view edit' are all valid two-action strings.
     */
    public JsecBasicPermission(String target, String actions) {
        this.target = target;

        // Convert the delimited string of actions into a set.
        this.actions = actionsStringToSet(actions);
    }

    /**
     * Creates a new permission with the given actions.
     * @param target The permission target. The meaning of 'target' is
     * application dependent, for example it may be a file path, a URL,
     * a controller name, or a component name.
     * @param actions A collection of action strings, for example 'view'
     * 'edit', 'create', and 'delete'.
     */
    public JsecBasicPermission(String target, Collection actions) {
        this.target = target;

        // Copy the provided collection of actions.
        this.actions = new HashSet(actions);
    }

    /**
     * Returns an unmodifiable set of this permission's actions.
     */
    public Set getActions() {
        return Collections.unmodifiableSet(this.actions);
    }

    /**
     * Returns this permission's actions as a comma-separated string,
     * for example 'view,create,modify,delete'.
     */
    public String getActionsString() {
        // Delayed initialisation of the actions string.
        if (this.actionsString == null) {
            // Convert the set of actions to a string so that a standard
            // delimiter is always used.
            this.actionsString = actionsToString(this.actions);
        }

        return this.actionsString;
    }

    /**
     * Returns <code>true</code> if this permission implies the given
     * one, otherwise <code>false</code>. This method checks that this
     * permission has the same target as the given permission and a
     * super-set of the actions. The wildcard matches all targets and
     * all actions.
     */
    public boolean implies(Permission p) {
        boolean implies = (p instanceof JsecBasicPermission);

        if (implies) {
            // Check the target strings are the same.
            JsecBasicPermission perm = (JsecBasicPermission) p;
            if (this.target == null) {
                implies = perm.target == null;
            }
            else if (!this.target.equals(WILDCARD)) {
                implies = this.target.equals(perm.target);
            }

            // Now check the actions (unless the current permission
            // includes the wildcard, which means that is implies
            // all other actions).
            if (implies && !this.actions.contains(WILDCARD)) {
                implies = this.actions.containsAll(perm.actions);
            }
        }

        return implies;
    }

    // Custom equals() method.
    public boolean equals(Object obj) {
        if (!(obj instanceof JsecBasicPermission)) {
            return false;
        }

        JsecBasicPermission p = (JsecBasicPermission) obj;
        return (this.target == null ? p.target == null : this.target.equals(p.target)) &&
                this.actions.equals(p.actions);
    }

    // Custom hashCode() method.
    public int hashCode() {
        int result;
        result = (this.target != null ? this.target.hashCode() : 0);
        result = 31 * result + this.actions.hashCode();
        return result;
    }

    /**
     * Converts a delimiter-separated string of actions into a set of
     * actions. Supported delimiters are ',', ';', and whitespace.
     */
    protected Set actionsStringToSet(String actions) {
        return new HashSet(Arrays.asList(actions.split("[,;\\s][\\s]*")));
    }

    /**
     * Converts a collection of actions into a comma-separated string.
     * For example, 'view,edit,create,delete'. Note that there is no
     * whitespace in the resulting string.
     */
    protected String actionsToString(Collection actions) {
        StringBuffer buffer = new StringBuffer(actions.size() * 10);
        for (Iterator iter = actions.iterator(); iter.hasNext();) {
            buffer.append(iter.next()).append(',');
        }

        return buffer.substring(0, buffer.length() - 1);
    }
}

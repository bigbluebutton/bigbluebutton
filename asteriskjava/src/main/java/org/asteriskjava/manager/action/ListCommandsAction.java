/*
 *  Copyright 2004-2007 Stefan Reuter and others
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.manager.action;

/**
 * The ListCommandsAction returns possible commands in the Manager interface.
 * <p>
 * Use the getAttributes method on the ManagerResponse for a map of commands and explanations. 
 * 
 * @see org.asteriskjava.manager.response.ManagerResponse#getAttributes()
 * @author martins
 * @since 0.3
 */
public class ListCommandsAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -2651441681309280764L;

    /**
     * Creates a new ListCommandsAction.
     */
    public ListCommandsAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "ListCommands".
     */
    @Override
   public String getAction()
    {
        return "ListCommands";
    }
}

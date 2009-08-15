/*
 *  Copyright 2004-2006 Stefan Reuter
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
package org.asteriskjava.manager.internal;

import org.asteriskjava.AsteriskVersion;
import org.asteriskjava.manager.action.ManagerAction;


/**
 * Transforms ManagerActions to Strings suitable to be sent to Asterisk.<p>
 * The attributes are determined using reflection.
 * 
 * @author srt
 * @version $Id: ActionBuilder.java 938 2007-12-31 03:23:38Z srt $
 */
interface ActionBuilder
{
    /**
     * Sets the version of the Asterisk server to built the action for.
     * 
     * @param asteriskVersion the version of the target Asterisk server.
     * @since 0.2
     */
    void setTargetVersion(AsteriskVersion targetVersion);

    /**
     * Builds a String suitable to be sent to Asterisk based on the given action object.<p>
     * Asterisk actions consist of an unordered set of key value pairs corresponding to the
     * attributes of the ManagerActions. Key and value are separated by a colon (":"), key value
     * pairs by a CR/NL ("\r\n"). An action is terminated by an empty line ("\r\n\r\n").
     * 
     * @param action the action to transform
     * @return a String representing the given action in an asterisk compatible format
     */
    String buildAction(final ManagerAction action);

    /**
     * Builds a String suitable to be sent to Asterisk based on the given action object.<p>
     * Asterisk actions consist of an unordered set of key value pairs corresponding to the
     * attributes of the ManagerActions. Key and value are separated by a colon (":"), key value
     * pairs by a CR/NL ("\r\n"). An action is terminated by an empty line ("\r\n\r\n").
     * 
     * @param action the action to transform
     * @param internalActionId the internal action id to add
     * @return a String representing the given action in an asterisk compatible format
     */
    String buildAction(final ManagerAction action, final String internalActionId);
}

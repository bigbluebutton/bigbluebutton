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
package org.asteriskjava.manager.action;

import java.io.Serializable;

/**
 * Interface that all Actions that can be sent to the Asterisk server must
 * impement.<p>
 * Instances of this class represent a command sent to Asterisk via Manager API,
 * requesting a particular Action be performed. The number of actions available
 * to the client are determined by the modules presently loaded in the Asterisk
 * engine.<p>
 * There is one conrete subclass of ManagerAction per each supported Asterisk
 * Action.
 * 
 * @author srt
 * @version $Id: ManagerAction.java 938 2007-12-31 03:23:38Z srt $
 */
public interface ManagerAction extends Serializable
{
    /**
     * Returns the name of the action for example "Hangup".
     */
    String getAction();

    /**
     * Returns the action id.
     * 
     * @return the user provied action id.
     */
    String getActionId();

    /**
     * Sets the action id.<p>
     * If the action id is set and sent to the asterisk server any response
     * returned by the Asterisk server will include the same id. This way
     * the action id can be used to track actions and their corresponding
     * responses and response events.<p>
     * Note that Asterisk-Java uses its own internal action id to match 
     * actions with the corresponding responses and events. Though the internal
     * action is never exposed to the application code. So if you want to 
     * handle reponses or response events on your own your application must
     * set a unique action id using this method otherwise the action id of
     * the reponse and response event objects passed to your application
     * will be null.
     * 
     * @param actionId the user provided action id to set.
     * @see org.asteriskjava.manager.response.ManagerResponse#getActionId()
     * @see org.asteriskjava.manager.event.ResponseEvent#getActionId()
     */
    void setActionId(String actionId);

}

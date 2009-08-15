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

import org.asteriskjava.manager.event.AgentsCompleteEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * The AgentsAction requests the state of all agents.<p>
 * For each agent an AgentsEvent is generated. After the state of all agents has been
 * reported an AgentsCompleteEvent is generated.<p>
 * Available since Asterisk 1.2
 * 
 * @see org.asteriskjava.manager.event.AgentsEvent
 * @see org.asteriskjava.manager.event.AgentsCompleteEvent
 * 
 * @author srt
 * @version $Id: AgentsAction.java 1162 2008-09-18 02:39:08Z sprior $
 * @since 0.2
 */
public class AgentsAction extends AbstractManagerAction implements EventGeneratingAction
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = -320228893513973367L;

    /**
     * Creates a new AgentsAction.
     */
    public AgentsAction()
    {
        
    }
    
    /**
     * Returns the name of this action, i.e. "Agents".
     */
    @Override
   public String getAction()
    {
        return "Agents";
    }

   public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return AgentsCompleteEvent.class;
    }
}

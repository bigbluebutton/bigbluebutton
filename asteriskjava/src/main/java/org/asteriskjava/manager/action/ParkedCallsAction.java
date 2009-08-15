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

import org.asteriskjava.manager.event.ParkedCallsCompleteEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * The ParkedCallsAction requests a list of all currently parked calls.<p>
 * For each active channel a ParkedCallEvent is generated. After all parked
 * calls have been reported a ParkedCallsCompleteEvent is generated.
 * 
 * @see org.asteriskjava.manager.event.ParkedCallEvent
 * @see org.asteriskjava.manager.event.ParkedCallsCompleteEvent
 * @author srt
 * @version $Id: ParkedCallsAction.java 1121 2008-08-16 20:54:12Z srt $
 */
public class ParkedCallsAction extends AbstractManagerAction
        implements
            EventGeneratingAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 1859575016378824743L;

    /**
     * Creates a new ParkedCallsAction.
     */
    public ParkedCallsAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "ParkedCalls".
     */
    @Override
   public String getAction()
    {
        return "ParkedCalls";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return ParkedCallsCompleteEvent.class;
    }
}

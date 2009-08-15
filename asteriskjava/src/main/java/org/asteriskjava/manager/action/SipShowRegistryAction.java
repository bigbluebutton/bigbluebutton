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

import org.asteriskjava.manager.event.RegistrationsCompleteEvent;
import org.asteriskjava.manager.event.RegistryEntryEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * Retrieves a list with the details about the SIP registrations.<p>
 * For each registration that is found a RegistryEntryEvent is sent by Asterisk
 * containing the details. When all the registrations have been reported a
 * RegistrationsCompleteEvent is sent.<p>
 * Available since Asterisk 1.6
 *
 * @author Laureano
 * @version $Id: SipShowRegistryAction.java 1163 2008-09-18 02:39:52Z sprior $
 * @see RegistrationsCompleteEvent
 * @see RegistryEntryEvent
 * @since 1.0.0
 */
public class SipShowRegistryAction extends AbstractManagerAction implements EventGeneratingAction
{
    /**
    * 
    */
   private static final long serialVersionUID = -4501597578392156556L;

   /**
     * Creates a new SipShowRegistryAction.
     */
    public SipShowRegistryAction()
    {
    }

    @Override
    public String getAction()
    {
        return "SipShowRegistry";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return RegistrationsCompleteEvent.class;
    }
}

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

import org.asteriskjava.manager.event.VoicemailUserEntryCompleteEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * Retrieves a list of all defined voicemail users.<p>
 * For each user that is found a VoicemailUserEntryEvent event is sent by Asterisk containing
 * the details. When all peers have been reported a VoicemailUserEntryCompleteEvent is
 * sent.<p>
 * It is implemented in <code>apps/app_voicemail.c</code>
 * <p/>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: VoicemailUsersListAction.java 1121 2008-08-16 20:54:12Z srt $
 * @see org.asteriskjava.manager.event.VoicemailUserEntryEvent
 * @see org.asteriskjava.manager.event.VoicemailUserEntryCompleteEvent
 * @since 1.0.0
 */
public class VoicemailUsersListAction extends AbstractManagerAction implements EventGeneratingAction
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;

    /**
     * Creates a new VoicemailUsersListAction.
     */
    public VoicemailUsersListAction()
    {

    }

    @Override
    public String getAction()
    {
        return "VoicemailUsersList";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return VoicemailUserEntryCompleteEvent.class;
    }
}
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
package org.asteriskjava.manager.event;

/**
 * A VoicemailUserEntryCompleteEvent is triggered after the details of all voicemail users has
 * been reported in response to a VoicemailUsersListAction.<p>
 * It is implemented in <code>apps/app_voicemail.c</code>
 * <p>
 * Available since Asterisk 1.6
 *
 * @see VoicemailUserEntryEvent
 * @see org.asteriskjava.manager.action.VoicemailUsersListAction
 * @author srt
 * @version $Id: VoicemailUserEntryCompleteEvent.java 946 2008-01-30 02:52:35Z srt $
 * @since 1.0.0
 */
public class VoicemailUserEntryCompleteEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;

    /**
     * Creates a new instance.
     *
     * @param source
     */
    public VoicemailUserEntryCompleteEvent(Object source)
    {
        super(source);
    }
}
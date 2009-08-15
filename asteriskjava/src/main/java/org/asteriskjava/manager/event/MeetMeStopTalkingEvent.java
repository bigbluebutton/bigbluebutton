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
 * A MeetMeStopTalkingEvent is triggered when a user ends talking in a meet me
 * conference.<p>
 * To enable talker detection you must pass the option 'T' to the MeetMe application.<p>
 * It is implemented in <code>apps/app_meetme.c</code><p>
 * Available only in Asterisk 1.2. Asterisk 1.4 sends a
 * {@link org.asteriskjava.manager.event.MeetMeTalkingEvent} with status set to
 * <code>false</code> instead.
 *
 * @author srt
 * @version $Id: MeetMeStopTalkingEvent.java 1123 2008-08-17 11:26:34Z srt $
 * @see org.asteriskjava.manager.event.MeetMeTalkingEvent
 * @since 0.2
 * @deprecated as of 1.0.0, use {@link org.asteriskjava.manager.event.MeetMeTalkingEvent} instead and check for
 *             {@link MeetMeTalkingEvent#getStatus()}.
 */
public class MeetMeStopTalkingEvent extends MeetMeTalkingEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 1L;

    public MeetMeStopTalkingEvent(Object source)
    {
        super(source);
        this.status = Boolean.FALSE;
    }
}

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
 * A MeetMeTalkingEvent is triggered when a user starts talking in a meet me
 * conference.<p>
 * To enable talker detection you must pass the option 'T' to the MeetMe application.<p>
 * It is implemented in <code>apps/app_meetme.c</code><p>
 * Available since Asterisk 1.2
 * 
 * @see org.asteriskjava.manager.event.MeetMeStopTalkingEvent
 * @author srt
 * @version $Id: MeetMeTalkingEvent.java 1123 2008-08-17 11:26:34Z srt $
 * @since 0.2
 */
public class MeetMeTalkingEvent extends AbstractMeetMeEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = -8554403451985143184L;

    protected Boolean status = Boolean.TRUE;

    public MeetMeTalkingEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns whether the user has started or stopped talking.<p>
     * Until Asterisk 1.2 Asterisk used different events to indicate start
     * and stop: This MeetMeTalkingEvent when the user started talking and the
     * {@link MeetMeStopTalkingEvent} when he stopped. With Asterisk 1.2
     * only this MeetMeTalkingEvent is used with the status property indicating
     * start and stop. For backwards compatibility this property defaults to
     * <code>true</code> so when used with version 1.2 of Asterisk you get
     * <code>true</code>.
     * 
     * @return <code>true</code> if ther user has started talking,
     *         <code>false</code> if the user has stopped talking.
     * @since 0.3
     */
    public Boolean getStatus()
    {
        return status;
    }

    public void setStatus(Boolean status)
    {
        this.status = status;
    }
}

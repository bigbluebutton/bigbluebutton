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
 * A MeetMeMuteEvent is triggered when a user in a MeetMe room is muted or
 * unmuted.<p>
 * It is implemented in <code>apps/app_meetme.c</code><p>
 * Available since Asterisk 1.4.
 * 
 * @author srt
 * @version $Id: MeetMeMuteEvent.java 1057 2008-05-20 00:56:28Z srt $
 */
public class MeetMeMuteEvent extends AbstractMeetMeEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = -8554403451985143184L;

    private Boolean status;

    /**
     * @param source
     */
    public MeetMeMuteEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns whether the user was muted or unmuted.
     * 
     * @return <code>true</code> if ther user was muted,
     *         <code>false</code> if the user was unmuted.
     */
    public Boolean getStatus()
    {
        return status;
    }

    /**
     * Sets whether the user was muted or unmuted.
     * 
     * @param status <code>true</code> if ther user was muted, 
     *               <code>false</code> if the user was unmuted.
     */
    public void setStatus(Boolean status)
    {
        this.status = status;
    }
}

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
 * A MeetMeLeaveEvent is triggered if a channel leaves a MeetMe conference.<p>
 * Channel and unqiueId properties for this event are available since Asterisk 1.0.<p>
 * It is implemented in <code>apps/app_meetme.c</code>
 * 
 * @author srt
 * @version $Id: MeetMeLeaveEvent.java 1050 2008-05-19 14:59:04Z srt $
 */
public class MeetMeLeaveEvent extends AbstractMeetMeEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 7692361610793036224L;

    private String callerIdNum;
    private String callerIdName;
    private Long duration;

    /**
     * @param source
     */
    public MeetMeLeaveEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the Caller*ID Name of the channel that left the conference.<p>
     * This property is available since Asterisk 1.4.
     * 
     * @return the Caller*ID Name of the channel that left the conference.
     */
    public String getCallerIdName()
    {
        return callerIdName;
    }

    /**
     * Sets the Caller*ID Name of the channel that left the conference.
     * 
     * @param callerIdName the Caller*ID Name of the channel that left the conference.
     */
    public void setCallerIdName(String callerIdName)
    {
        this.callerIdName = callerIdName;
    }

    /**
     * Returns the Caller*ID Number of the channel that left the conference.<p>
     * This property is available since Asterisk 1.4.
     * 
     * @return the Caller*ID Number of the channel that left the conference.
     */
    public String getCallerIdNum()
    {
        return callerIdNum;
    }

    /**
     * Sets the Caller*ID Number of the channel that left the conference.
     * 
     * @param callerIdNum the Caller*ID Number of the channel that left the conference.
     */
    public void setCallerIdNum(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns how long the user spent in the conference.<p>
     * This property is available since Asterisk 1.4.
     * 
     * @return the duration in seconds the user spent in the conference.
     */
    public Long getDuration()
    {
        return duration;
    }

    /**
     * Sets how long the user spent in the conference.
     * 
     * @param duration the duration in seconds the user spent in the conference.
     */
    public void setDuration(Long duration)
    {
        this.duration = duration;
    }
}

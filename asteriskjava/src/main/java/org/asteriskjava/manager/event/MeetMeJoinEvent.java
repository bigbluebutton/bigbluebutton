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
 * A MeetMeJoinEvent is triggered if a channel joins a MeetMe conference.<p>
 * Channel and unqiueId properties for this event are available since Asterisk 1.0.<p>
 * It is implemented in <code>apps/app_meetme.c</code>
 *
 * @author srt
 * @version $Id: MeetMeJoinEvent.java 1050 2008-05-19 14:59:04Z srt $
 */
public class MeetMeJoinEvent extends AbstractMeetMeEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    private String callerIdNum;
    private String callerIdName;

    /**
     * @param source
     */
    public MeetMeJoinEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the Caller Id number.
     *
     * @return the Caller Id number or "<unknown>" if not set.
     * @since 1.0.0
     */
    public String getCallerIdNum()
    {
        return callerIdNum;
    }

    public void setCallerIdNum(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns the Caller Id name.
     *
     * @return the Caller Id name or "<unknown>" if not set.
     * @since 1.0.0
     */
    public String getCallerIdName()
    {
        return callerIdName;
    }

    public void setCallerIdName(String callerIdName)
    {
        this.callerIdName = callerIdName;
    }
}

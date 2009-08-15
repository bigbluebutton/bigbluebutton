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
 * A MeetMeEnd event indicates that a conference room was disposed.<p>
 * Available since Asterisk 1.6.<p>
 * It is defined in <code>apps/app_meetme.c</code>
 *
 * @author srt
 * @version $Id: MeetMeEndEvent.java 1095 2008-08-09 01:49:43Z sprior $
 * @since 1.0.0
 */
public class MeetMeEndEvent extends ManagerEvent
{
    private static final long serialVersionUID = 510266716726148586L;
    private String meetMe;

    /**
     * @param source
     */
    public MeetMeEndEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the conference number.
     *
     * @return the conference number.
     */
    public String getMeetMe()
    {
        return meetMe;
    }

    public void setMeetMe(String meetMe)
    {
        this.meetMe = meetMe;
    }
}
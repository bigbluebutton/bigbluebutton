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
 * A MeetMeTalkingEvent is triggered when a muted user requests talking in a meet me
 * conference.<p>
 * To enable talker detection you must pass the option 'T' to the MeetMe application.<p>
 * It is implemented in <code>apps/app_meetme.c</code><p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: MeetMeTalkingRequestEvent.java 1057 2008-05-20 00:56:28Z srt $
 * @since 1.0.0
 */
public class MeetMeTalkingRequestEvent extends AbstractMeetMeEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    private Boolean status;

    /**
     * @param source
     */
    public MeetMeTalkingRequestEvent(Object source)
    {
        super(source);
    }

    // see http://bugs.digium.com/view.php?id=9418

    /**
     * Returns whether the user has started or stopped requesting talking.
     *
     * @return <code>true</code> if ther user has started requesting talking,
     *         <code>false</code> if the user has stopped requesting talking.
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
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

/**
 * The MeetMeMuteAction mutes a user in a conference.<p>
 * Defined in <code>apps/app_meetme.c</code><p>
 * Available since Asterisk 1.4.
 * 
 * @author srt
 * @version $Id: MeetMeMuteAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class MeetMeMuteAction extends AbstractMeetMeMuteAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -3843949939190283779L;

    /**
     * Creates a new empty MeetMeMuteAction.
     */
    public MeetMeMuteAction()
    {
        super();
    }

    /**
     * Creates a new MeetMeMuteAction.
     * 
     * @param meetMe the conference number.
     * @param userNum the index of the user in the conference.
     */
    public MeetMeMuteAction(String meetMe, Integer userNum)
    {
        super(meetMe, userNum);
    }

    /**
     * Returns the name of this action, i.e. "MeetMeMute".
     */
    @Override
   public String getAction()
    {
        return "MeetMeMute";
    }
}

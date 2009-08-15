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
 * Abstract base class for mute and unmute actions.
 * 
 * @author srt
 * @version $Id: AbstractMeetMeMuteAction.java 938 2007-12-31 03:23:38Z srt $
 */
public abstract class AbstractMeetMeMuteAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -2930397629192323391L;

    private String meetMe;
    private Integer userNum;

    protected AbstractMeetMeMuteAction()
    {
        super();
    }

    protected AbstractMeetMeMuteAction(String meetMe, Integer userNum)
    {
        super();
        this.meetMe = meetMe;
        this.userNum = userNum;
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

    /**
     * Sets the conference number.<p>
     * This property is mandatory.
     * 
     * @param meetMe the conference number.
     */
    public void setMeetMe(String meetMe)
    {
        this.meetMe = meetMe;
    }

    /**
     * Returns the index of the user in the conference.
     * 
     * @return the index of the user in the conference.
     */
    public Integer getUserNum()
    {
        return userNum;
    }

    /**
     * Sets the index of the user in the conference.<p>
     * This property is mandatory.
     * 
     * @param userNum the index of the user in the conference.
     */
    public void setUserNum(Integer userNum)
    {
        this.userNum = userNum;
    }
}

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
 * An AgentConnectEvent is triggered when a caller is connected to an agent.<p>
 * It is implemented in <code>apps/app_queue.c</code>.<p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: AgentConnectEvent.java 1074 2008-06-23 03:15:35Z srt $
 * @since 0.2
 */
public class AgentConnectEvent extends AbstractAgentEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;

    private Long holdTime;
    private String bridgedChannel;
    private Long ringtime;

    public AgentConnectEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the amount of time the caller was on hold.
     * 
     * @return the amount of time the caller was on hold in seconds.
     */
    public Long getHoldTime()
    {
        return holdTime;
    }

    /**
     * Sets the amount of time the caller was on hold.
     * 
     * @param holdtime the amount of time the caller was on hold in seconds.
     */
    public void setHoldTime(Long holdtime)
    {
        this.holdTime = holdtime;
    }

    /**
     * Returns the unique ID of the queue member channel that is taking the
     * call. This is useful when trying to link recording filenames back to a
     * particular call from the queue.<p>
     * Available since Asterisk 1.4.
     * 
     * @return the unique ID of the queue member channel that is taking the
     *         call.
     */
    public String getBridgedChannel()
    {
        return bridgedChannel;
    }

    /**
     * Sets the unique ID of the queue member channel that is taking the call.
     * 
     * @param bridgedChannel the unique ID of the queue member channel that is
     *            taking the call.
     */
    public void setBridgedChannel(String bridgedChannel)
    {
        this.bridgedChannel = bridgedChannel;
    }

    /**
     * Returns the amount of time the agent's channel was ringing before answered.<p>
     * Available since Asterisk 1.6.
     *
     * @return the amount of time the agent's channel was ringing before answered in seconds.
     * @since 1.0.0
     */
    public Long getRingtime()
    {
        return ringtime;
    }

    public void setRingtime(Long ringtime)
    {
        this.ringtime = ringtime;
    }
}

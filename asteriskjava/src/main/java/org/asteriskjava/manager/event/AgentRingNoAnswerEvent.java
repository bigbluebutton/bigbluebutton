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
 * An AgentRingNoAnswerEvent is triggered when a call is routed to an agent but the agent
 * does not answer the call.<p>
 * It is implemented in <code>apps/app_queue.c</code>.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: AgentRingNoAnswerEvent.java 1120 2008-08-16 19:10:02Z srt $
 * @since 1.0.0
 */
public class AgentRingNoAnswerEvent extends AbstractAgentEvent
{
    private static final long serialVersionUID = 1L;

    private Long ringtime;

    public AgentRingNoAnswerEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the amount of time the agent's channel was ringing.
     *
     * @return the amount of time the agent's channel was ringing in seconds.
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
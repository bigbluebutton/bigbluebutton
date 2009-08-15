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
 * An AlarmEvent is triggered when a Zap channel leaves alarm state.<p>
 * It is implemented in <code>channels/chan_zap.c</code>
 * 
 * @author srt
 * @version $Id: AlarmClearEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class AlarmClearEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -3584791971422266558L;

    /**
     * The number of the zap channel that left alarm state.
     */
    private Integer channel;

    /**
     * @param source
     */
    public AlarmClearEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the number of the zap channel that left alarm state.
     * 
     * @return the number of the zap channel that left alarm state.
     */
    public Integer getChannel()
    {
        return channel;
    }

    /**
     * Sets the number of the zap channel that left alarm state.
     * 
     * @param channel the number of the zap channel that left alarm state.
     */
    public void setChannel(Integer channel)
    {
        this.channel = channel;
    }
}

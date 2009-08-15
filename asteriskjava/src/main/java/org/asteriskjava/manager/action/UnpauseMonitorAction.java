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
 * The PauseMonitorAction re-enables monitoring (recording) of a channel after
 * calling PauseMonitor.
 * <p>
 * It is implemented in <code>res/res_monitor.c</code>
 * <p>
 * Available since Asterisk 1.4.
 * 
 * @see PauseMonitorAction
 * @author srt
 * @since 0.3
 * @version $Id: UnpauseMonitorAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class UnpauseMonitorAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -6316010713240389305L;

    /**
     * The name of the channel to re-enable monitoring.
     */
    private String channel;

    /**
     * Creates a new empty UnpauseMonitorAction.
     */
    public UnpauseMonitorAction()
    {

    }

    /**
     * Creates a new UnpauseMonitorAction that re-enables monitoring the given
     * channel.
     * 
     * @param channel the name of the channel re-enable monitoring.
     */
    public UnpauseMonitorAction(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of this action, i.e. "UnpauseMonitor".
     * 
     * @return the name of this action.
     */
    @Override
   public String getAction()
    {
        return "UnpauseMonitor";
    }

    /**
     * Returns the name of the channel to re-enable monitoring.
     * 
     * @return the name of the channel to re-enable monitoring.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to re-enable monitoring.
     * <p>
     * This property is mandatory.
     * 
     * @param channel the name of the channel to re-enable monitoring.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }
}

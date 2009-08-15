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

import org.asteriskjava.manager.event.AsyncAgiEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * Add a new AGI command to execute by the Async AGI application.<p>
 * It will append the application to the specified channel's queue.
 * If the channel is not inside Async AGI application it will return an error.<p>
 * It is implemented in <code>res/res_agi.c</code>
 * <p/>
 * Available since Asterisk 1.6
 *
 * @see org.asteriskjava.manager.event.AsyncAgiEvent
 * @author srt
 * @version $Id: AgiAction.java 1169 2008-09-18 07:06:52Z srt $
 * @since 1.0.0
 */
public class AgiAction extends AbstractManagerAction implements EventGeneratingAction
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    private String channel;
    private String command;
    private String commandId;

    /**
     * Creates a new empty AgiAction.
     */
    public AgiAction()
    {

    }

    /**
     * Creates a new AgiAction with channel and command.
     *
     * @param channel the name of the channel to execute the AGI command on.
     * @param command the AGI command to execute.
     */
    public AgiAction(String channel, String command)
    {
        this.channel = channel;
        this.command = command;
    }

    /**
     * Creates a new AgiAction with channel, command and commandId.
     *
     * @param channel   the name of the channel to execute the AGI command on.
     * @param command   the AGI command to execute.
     * @param commandId the command id to track execution progress.
     */
    public AgiAction(String channel, String command, String commandId)
    {
        this.channel = channel;
        this.command = command;
        this.commandId = commandId;
    }

    /**
     * Returns the name of this action.
     */
    @Override
    public String getAction()
    {
        return "AGI";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return AsyncAgiEvent.class;
    }

    /**
     * Returns the name of the channel to execute the AGI command on.
     *
     * @return the name of the channel to execute the AGI command on.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to execute the AGI command on.<p>
     * The channel must be running the Async AGI application "AGI(agi:async)".<p>
     * This property is required.
     *
     * @param channel the name of the channel to execute the AGI command on.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the AGI command to execute.
     *
     * @return the AGI command to execute.
     */
    public String getCommand()
    {
        return command;
    }

    /**
     * Sets the AGI command to execute.<p>
     * This property is required.
     *
     * @param command the AGI command to execute.
     */
    public void setCommand(String command)
    {
        this.command = command;
    }

    /**
     * Returns the command id to track execution progress.
     *
     * @return the command id to track execution progress.
     */
    public String getCommandId()
    {
        return commandId;
    }

    /**
     * Sets the command id to track execution progress.<p>
     * This value will be sent back in the CommandID header of AsyncAGI exec event notifications.
     *
     * @param commandId the command id to track execution progress.
     */
    public void setCommandId(String commandId)
    {
        this.commandId = commandId;
    }
}
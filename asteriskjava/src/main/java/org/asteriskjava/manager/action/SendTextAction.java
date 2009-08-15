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
 * Sends a text message to a given channel while in a call.
 * An active channel and a text message are required in order to success.<p>
 * It is defined in <code>main/manager.c</code>.<p>
 * Available since Asterisk 1.6.0
 *
 * @author Laureano
 * @version $Id: SendTextAction.java 1156 2008-08-25 20:24:25Z srt $
 * @since 1.0.0
 */
public class SendTextAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 1L;

    private String channel;
    private String message;

    /**
     * Creates a new empty SendTextAction.
     */
    public SendTextAction()
    {
        super();
    }

    /**
     * Creates a new SendTextAction that sends the given message to the given channel.
     *
     * @param channel the name of the channel to send the message to.
     * @param message the message to send.
     */
    public SendTextAction(String channel, String message)
    {
        super();
        this.channel = channel;
        this.message = message;
    }

    /**
     * Returns the name of this action, i.e. "SendText".
     */
    @Override
    public String getAction()
    {
        return "SendText";
    }

    /**
     * Returns the name of the channel to send the message to.
     *
     * @return the name of the channel to send the message to.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to send the message to.
     *
     * @param channel the name of the channel to send the message to.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the message to send.
     *
     * @return the message to send.
     */
    public String getMessage()
    {
        return message;
    }

    /**
     * Sets the message to send.
     *
     * @param message the message to send.
     */
    public void setMessage(String message)
    {
        this.message = message;
	}
}

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
package org.asteriskjava.fastagi.command;

/**
 * Returns the status of the specified channel. If no channel name is given the
 * returns the status of the current channel.<p>
 * Return values:
 * <ul>
 * <li>0 Channel is down and available
 * <li>1 Channel is down, but reserved
 * <li>2 Channel is off hook
 * <li>3 Digits (or equivalent) have been dialed
 * <li>4 Line is ringing
 * <li>5 Remote end is ringing
 * <li>6 Line is up
 * <li>7 Line is busy
 * </ul>
 * 
 * @author srt
 * @version $Id: ChannelStatusCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class ChannelStatusCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3904959746380281145L;

    /**
     * The name of the channel to query or <code>null</code> for the current
     * channel.
     */
    private String channel;

    /**
     * Creates a new ChannelStatusCommand that queries the current channel.
     */
    public ChannelStatusCommand()
    {
        super();
    }

    /**
     * Creates a new ChannelStatusCommand that queries the given channel.
     * 
     * @param channel the name of the channel to query.
     */
    public ChannelStatusCommand(String channel)
    {
        super();
        this.channel = channel;
    }

    /**
     * Returns the name of the channel to query.
     * 
     * @return the name of the channel to query or <code>null</code> for the
     *         current channel.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to query.
     * 
     * @param channel the name of the channel to query or <code>null</code>
     *            for the current channel.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    @Override
   public String buildCommand()
    {
        return "CHANNEL STATUS"
                + (channel == null ? "" : " " + escapeAndQuote(channel));
    }
}

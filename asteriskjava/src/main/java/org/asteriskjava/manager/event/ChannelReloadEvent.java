/*
 *  Copyright 2004-2007 Stefan Reuter and others
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

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A ChannelReloadEvent is when a channel driver is reloaded, either on startup
 * or by request.
 * <p/>
 * For example, <code>channels/chan_sip.c</code> triggers the channel reload
 * event when the SIP configuration is reloaded from sip.conf because the 'sip
 * reload' command was issued at the Manager interface, the CLI, or for another
 * reason.
 * <p/>
 * Available since Asterisk 1.4.
 * <p/>
 * It is implemented in <code>channels/chan_sip.c</code>
 *
 * @author martins
 */
public class ChannelReloadEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 1L;

    /**
     * The channel module has been loaded for the first time.
     */
    public static final String REASON_LOAD = "LOAD";

    /**
     * The channel module has been reloaded.
     */
    public static final String REASON_RELOAD = "RELOAD";

    /**
     * The channel module has been reloaded from the command line.
     */
    public static final String REASON_CLI_RELOAD = "CLIRELOAD";

    /**
     * The channel module has been reloaded due to a manager action.
     */
    public static final String REASON_MANAGER_RELOAD = "MANAGERRELOAD";

    private static final Pattern REASON_PATTERN = Pattern.compile("^([A-Z]+) \\((.*)\\)$");

    /**
     * The type of channel that got reloaded (i.e. SIP)
     */
    private String channelType;

    private String reloadReason;

    /**
     * The reason for the reload.
     *
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_CLI_RELOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_LOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_RELOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_MANAGER_RELOAD
     */
    private String reloadReasonCode;
    private String reloadReasonDescription;

    /**
     * The number of registrations with other channels (e.g. registrations with
     * other sip proxies)
     */
    private Integer registryCount;

    /**
     * The number of peers defined during the configuration of this channel
     * (e.g. sip peer definitions)
     */
    private Integer peerCount;

    /**
     * The number of users defined during the configuration of this channel
     * (e.g. sip user definitions)
     */
    private Integer userCount;

    /**
     * @param source
     */
    public ChannelReloadEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the type of channel that was reloaded. For <code>channels/chan_sip.c</code>, this would be "SIP".
     *
     * @return the type of channel that was reloaded (e.g. SIP)
     * @since 1.0.0
     */
    public String getChannelType()
    {
        return channelType;
    }

    public void setChannelType(String channelType)
    {
        this.channelType = channelType;
    }

    /**
     * Returns the channel that was reloaded. For
     * <code>channels/chan_sip.c</code>, this would be "SIP"
     *
     * @return the type of channel that was reloaded (e.g. SIP)
     * @deprecated use {@link #getChannelType()} instead.
     */
    public String getChannel()
    {
        return channelType;
    }

    public void setChannel(String channel)
    {
        this.channelType = channel;
    }

    /**
     * Returns the number of peers defined during the configuration of this
     * channel (e.g. sip peer definitions).
     *
     * @return the number of peers defined during the configuration of this
     *         channel (e.g. sip peer definitions)
     */
    public Integer getPeerCount()
    {
        return peerCount;
    }

    /**
     * @param peerCount the number of peers defined during the configuration of
     *                  this channel (e.g. sip peer definitions)
     */
    public void setPeerCount(Integer peerCount)
    {
        this.peerCount = peerCount;
    }

    /**
     * @return the number of registrations with other channels (e.g.
     *         registrations with other sip proxies)
     */
    public Integer getRegistryCount()
    {
        return registryCount;
    }

    /**
     * @param registryCount the number of registrations with other channels
     *                      (e.g. registrations with other sip proxies)
     */
    public void setRegistryCount(Integer registryCount)
    {
        this.registryCount = registryCount;
    }

    /**
     * Returns the reason that this channel was reloaded as received from Asterisk, for
     * example "CLIRELOAD (Channel module reload by CLI command)".
     * <p/>
     * Usually you don't want to use this method directly.
     *
     * @return the reason for the reload as received from Asterisk.
     * @see #getReloadReasonCode()
     * @see #getReloadReasonDescription()
     */
    public String getReloadReason()
    {
        return reloadReason;
    }

    /**
     * Sets the reason that this channel was reloaded, for
     * example "CLIRELOAD (Channel module reload by CLI command)".
     *
     * @param reloadReason the reason that this channel was reloaded
     */
    public void setReloadReason(String reloadReason)
    {
        Matcher matcher;

        this.reloadReason = reloadReason;
        if (reloadReason == null)
        {
            return;
        }

        matcher = REASON_PATTERN.matcher(reloadReason);
        if (matcher.matches())
        {
            reloadReasonCode = matcher.group(1);
            reloadReasonDescription = matcher.group(2);
        }
    }

    /**
     * Returns the reason that this channel was reloaded.<p>
     * Only the code part of the reason is returned. This is one of
     * <ul>
     * <li>LOAD</li>
     * <li>RELOAD</li>
     * <li>CLIRELOAD</li>
     * <li>MANAGERRELOAD</li>
     * </ul>
     *
     * @return the code of the reason for the reload
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_CLI_RELOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_LOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_RELOAD
     * @see org.asteriskjava.manager.event.ChannelReloadEvent#REASON_MANAGER_RELOAD
     */
    public String getReloadReasonCode()
    {
        return reloadReasonCode;
    }

    /**
     * Returns the reason that this channel was reloaded as a human readable descriptive
     * string, for example "Channel module reload by CLI command".
     *
     * @return the descriptive version of the reason for the reload.
     */
    public String getReloadReasonDescription()
    {
        return reloadReasonDescription;
    }

    /**
     * @return the number of users defined during the configuration of this
     *         channel (e.g. sip user definitions)
     */
    public Integer getUserCount()
    {
        return userCount;
    }

    /**
     * @param userCount the number of users defined during the configuration of
     *                  this channel (e.g. sip user definitions)
     */
    public void setUserCount(Integer userCount)
    {
        this.userCount = userCount;
    }
}

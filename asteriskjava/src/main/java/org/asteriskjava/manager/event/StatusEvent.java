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

import org.asteriskjava.util.AstState;

import java.util.Map;

/**
 * A StatusEvent is triggered for each active channel in response to a StatusAction.
 *
 * @author srt
 * @version $Id: StatusEvent.java 1173 2008-09-22 23:39:41Z srt $
 * @see org.asteriskjava.manager.action.StatusAction
 */
public class StatusEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = -3619197512835308812L;
    private String channel;
    private String callerIdNum;
    private String callerIdName;
    private String accountCode;
    private Integer channelState;
    private String channelStateDesc;
    private String context;
    private String extension;
    private Integer priority;
    private Integer seconds;
    private String bridgedChannel;
    private String bridgedUniqueId;
    private String uniqueId;
    private Map<String, String> variables;

    public StatusEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of this channel.
     *
     * @return the name of this channel.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of this channel.
     *
     * @param channel the name of this channel.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the Caller*ID Number of this channel.<p>
     * This property is deprecated as of Asterisk 1.4, use {@link #getCallerIdNum()} instead.
     *
     * @return the Caller*ID Number of this channel or <code>null</code> if none is available.
     * @deprecated
     */
    public String getCallerId()
    {
        return callerIdNum;
    }

    /**
     * Sets the Caller*ID Number of this channel.<p>
     * This property is deprecated as of Asterisk 1.4.
     *
     * @param callerIdNum the Caller*ID Number to set.
     */
    public void setCallerId(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns the Caller*ID Number of this channel.
     *
     * @return the Caller*ID Number of this channel or <code>null</code> if none is available.
     * @since 0.3
     */
    public String getCallerIdNum()
    {
        return callerIdNum;
    }

    /**
     * Sets the Caller*ID Number of this channel.
     *
     * @param callerIdNum the Caller*ID Number to set.
     * @since 0.3
     */
    public void setCallerIdNum(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns the Caller*ID Name of this channel.
     *
     * @return the Caller*ID Name of this channel or <code>null</code> if none is available.
     */
    public String getCallerIdName()
    {
        return callerIdName;
    }

    /**
     * Sets the Caller*ID Name of this channel.
     *
     * @param callerIdName the Caller*ID Name of this channel.
     */
    public void setCallerIdName(String callerIdName)
    {
        this.callerIdName = callerIdName;
    }

    /**
     * Returns the account code of this channel.
     *
     * @return the account code of this channel.
     * @since 1.0.0
     */
    public String getAccountCode()
    {
        return accountCode;
    }

    /**
     * Sets the account code of this channel.
     *
     * @param accountCode the account code of this channel.
     * @since 1.0.0
     */
    public void setAccountCode(String accountCode)
    {
        this.accountCode = accountCode;
    }

    /**
     * Returns the account code of this channel.
     *
     * @return the account code of this channel.
     * @deprecated since 1.0.0, use {@link #getAccountCode()} instead.
     */
    public String getAccount()
    {
        return accountCode;
    }

    /**
     * Sets the account code of this channel.<p>
     * Asterisk versions up to 1.4 use the "Account" property instead of "AccountCode".
     *
     * @param account the account code of this channel.
     */
    public void setAccount(String account)
    {
        this.accountCode = account;
    }

    /**
     * Returns the state of the channel.<p>
     * For Asterisk versions prior to 1.6 (that do not send the numeric value) it is derived
     * from the descriptive text.
     *
     * @return the state of the channel.
     * @since 1.0.0
     */
    public Integer getChannelState()
    {
        return channelState == null ? AstState.str2state(channelStateDesc) : channelState;
    }

    /**
     * Sets the state of the channel.
     *
     * @param channelState the state of the channel.
     * @since 1.0.0
     */
    public void setChannelState(Integer channelState)
    {
        this.channelState = channelState;
    }

    /**
     * Returns the state of the channel as a descriptive text.
     *
     * @return the state of the channel as a descriptive text.
     * @since 1.0.0
     */
    public String getChannelStateDesc()
    {
        return channelStateDesc;
    }

    public void setChannelStateDesc(String channelStateDesc)
    {
        this.channelStateDesc = channelStateDesc;
    }

    /**
     * Returns the state of the channel as a descriptive text.
     *
     * @return the state of the channel as a descriptive text.
     * @deprecated use {@link #getChannelStateDesc()} instead.
     */
    public String getState()
    {
        return channelStateDesc;
    }

    public void setState(String state)
    {
        this.channelStateDesc = state;
    }

    public String getContext()
    {
        return context;
    }

    public void setContext(String context)
    {
        this.context = context;
    }

    public String getExtension()
    {
        return extension;
    }

    public void setExtension(String extension)
    {
        this.extension = extension;
    }

    public Integer getPriority()
    {
        return priority;
    }

    public void setPriority(Integer priority)
    {
        this.priority = priority;
    }

    /**
     * Returns the number of elapsed seconds.
     *
     * @return the number of elapsed seconds.
     */
    public Integer getSeconds()
    {
        return seconds;
    }

    /**
     * Sets the number of elapsed seconds.
     *
     * @param seconds the number of elapsed seconds.
     */
    public void setSeconds(Integer seconds)
    {
        this.seconds = seconds;
    }

    /**
     * Returns the name of the linked channel if this channel is bridged.
     *
     * @return the name of the linked channel if this channel is bridged.
     * @since 1.0.0
     */
    public String getBridgedChannel()
    {
        return bridgedChannel;
    }

    /**
     * Sets the name of the linked channel.
     *
     * @param bridgedChannel the name of the linked channel if this channel is bridged.
     * @since 1.0.0
     */
    public void setBridgedChannel(String bridgedChannel)
    {
        this.bridgedChannel = bridgedChannel;
    }

    /**
     * Returns the name of the linked channel if this channel is bridged.
     *
     * @return the name of the linked channel if this channel is bridged.
     * @deprecated as of 1.0.0, use {@link #getBridgedChannel()} instead.
     */
    public String getLink()
    {
        return bridgedChannel;
    }

    /**
     * Sets the name of the linked channel.<p>
     * Asterisk versions up to 1.4 use "Link" instead of "BridgedChannel".
     *
     * @param link the name of the linked channel if this channel is bridged.
     */
    public void setLink(String link)
    {
        this.bridgedChannel = link;
    }

    /**
     * Returns the unique id of the linked channel if this channel is bridged.<p>
     * Available since Asterisk 1.6.
     *
     * @return the unique id of the linked channel if this channel is bridged.
     * @since 1.0.0
     */
    public String getBridgedUniqueId()
    {
        return bridgedUniqueId;
    }

    /**
     * Sets the unique id of the linked channel if this channel is bridged.<p>
     * Available since Asterisk 1.6.
     *
     * @param bridgedUniqueId the unique id of the linked channel if this channel is bridged.
     * @since 1.0.0
     */
    public void setBridgedUniqueId(String bridgedUniqueId)
    {
        this.bridgedUniqueId = bridgedUniqueId;
    }

    /**
     * Returns the unique id of this channel.
     *
     * @return the unique id of this channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of this channel.
     *
     * @param uniqueId the unique id of this channel.
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the channel variables if the {@link org.asteriskjava.manager.action.StatusAction#setVariables(String)}
     * property has been set.<p>
     * Available since Asterisk 1.6
     *
     * @return the channel variables.
     * @since 1.0.0
     */
    public Map<String, String> getVariables()
    {
        return variables;
    }

    /**
     * Sets the channel variables.<p>
     * Available since Asterisk 1.6
     *
     * @param variables the channel variables.
     * @since 1.0.0
     */
    public void setVariables(Map<String, String> variables)
    {
        this.variables = variables;
    }
}

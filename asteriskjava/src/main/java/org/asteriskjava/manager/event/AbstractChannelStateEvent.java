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

/**
 * Abstract base class providing common properties for HangupEvent, NewChannelEvent and
 * NewStateEvent.
 *
 * @author srt
 * @version $Id: AbstractChannelStateEvent.java 1026 2008-04-06 09:35:12Z srt $
 */
public abstract class AbstractChannelStateEvent extends AbstractChannelEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    private Integer channelState;
    private String channelStateDesc;

    protected AbstractChannelStateEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the new state of the channel.<p>
     * For Asterisk versions prior to 1.6 (that do not send the numeric value) it is derived
     * from the descriptive text.
     *
     * @return the new state of the channel.
     * @since 1.0.0
     */
    public Integer getChannelState()
    {
        return channelState == null ? AstState.str2state(channelStateDesc) : channelState;
    }

    /**
     * Sets the new state of the channel.
     *
     * @param channelState the new state of the channel.
     * @since 1.0.0
     */
    public void setChannelState(Integer channelState)
    {
        this.channelState = channelState;
    }

    /**
     * Returns the new state of the channel as a descriptive text.<p>
     * The following states are used:<p>
     * <ul>
     * <li>Down</li>
     * <li>Rsrvd</li>
     * <li>OffHook</li>
     * <li>Dialing</li>
     * <li>Ring</li>
     * <li>Ringing</li>
     * <li>Up</li>
     * <li>Busy</li>
     * <li>Dialing Offhook (since Asterik 1.6)</li>
     * <li>Pre-ring (since Asterik 1.6)</li>
     * <ul>
     *
     * @return the new state of the channel as a descriptive text.
     * @since 1.0.0
     */
    public String getChannelStateDesc()
    {
        return channelStateDesc;
    }

    /**
     * Sets the new state of the channel as a descriptive text.
     *
     * @param channelStateDesc the new state of the channel as a descriptive text.
     * @since 1.0.0
     */
    public void setChannelStateDesc(String channelStateDesc)
    {
        this.channelStateDesc = channelStateDesc;
    }

    /**
     * Returns the new state of the channel as a descriptive text.<p>
     * This is an alias for {@link @getChannelStateDesc}.
     *
     * @return the new state of the channel as a descriptive text.
     * @deprecated as of 1.0.0, use {@link #getChannelStateDesc()} instead or even better switch to numeric
     *             values as returned by {@link #getChannelState()}.
     */
    public String getState()
    {
        return channelStateDesc;
    }

    /**
     * Sets the new state of the channel as a descriptive text.<p>
     * The state property is used by Asterisk versions prior to 1.6.
     *
     * @param state the new state of the channel as a descriptive text.
     */
    public void setState(String state)
    {
        this.channelStateDesc = state;
    }
}

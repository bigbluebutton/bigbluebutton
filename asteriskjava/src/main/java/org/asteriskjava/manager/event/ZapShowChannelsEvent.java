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
 * A ZapShowChannelsEvent is triggered in response to a ZapShowChannelsAction and shows the state of
 * a zap channel.
 * 
 * @see org.asteriskjava.manager.action.ZapShowChannelsAction
 * 
 * @author srt
 * @version $Id: ZapShowChannelsEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class ZapShowChannelsEvent extends ResponseEvent
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = -3613642267527361400L;
    private Integer channel;
    private String signalling;
    private String context;
    private Boolean dnd;
    private String alarm;

    /**
     * @param source
     */
    public ZapShowChannelsEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the number of this zap channel.
     */
    public Integer getChannel()
    {
        return channel;
    }

    /**
     * Sets the number of this zap channel.
     */
    public void setChannel(Integer channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the signalling of this zap channel.<p>
     * Possible values are:
     * <ul>
     * <li>E & M Immediate</li>
     * <li>E & M Wink</li>
     * <li>E & M E1</li>
     * <li>Feature Group D (DTMF)</li>
     * <li>Feature Group D (MF)</li>
     * <li>Feature Group B (MF)</li>
     * <li>E911 (MF)</li>
     * <li>FXS Loopstart</li>
     * <li>FXS Groundstart</li>
     * <li>FXS Kewlstart</li>
     * <li>FXO Loopstart</li>
     * <li>FXO Groundstart</li>
     * <li>FXO Kewlstart</li>
     * <li>PRI Signalling</li>
     * <li>R2 Signalling</li>
     * <li>SF (Tone) Signalling Immediate</li>
     * <li>SF (Tone) Signalling Wink</li>
     * <li>SF (Tone) Signalling with Feature Group D (DTMF)</li>
     * <li>SF (Tone) Signalling with Feature Group D (MF)</li>
     * <li>SF (Tone) Signalling with Feature Group B (MF)</li>
     * <li>GR-303 Signalling with FXOKS</li>
     * <li>GR-303 Signalling with FXSKS</li>
     * <li>Pseudo Signalling</li>
     * </ul>
     */
    public String getSignalling()
    {
        return signalling;
    }

    /**
     * Sets the signalling of this zap channel.
     */
    public void setSignalling(String signalling)
    {
        this.signalling = signalling;
    }

    /**
     * Returns the context of this zap channel as defined in <code>zapata.conf</code>.
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Sets the context of this zap channel.
     */
    public void setContext(String context)
    {
        this.context = context;
    }

    /**
     * Returns whether dnd (do not disturb) is enabled for this zap channel.
     * 
     * @return Boolean.TRUE if dnd is enabled, Boolean.FALSE if it is disabled,
     *         <code>null</code> if not set.
     * @since 0.3
     */
    public Boolean getDnd()
    {
        return dnd;
    }

    /**
     * Sets whether dnd (do not disturb) is enabled for this zap channel.
     * 
     * @param dnd Boolean.TRUE if dnd is enabled, Boolean.FALSE if it is disabled.
     * @since 0.3
     */
    public void setDnd(Boolean dnd)
    {
        this.dnd = dnd;
    }

    /**
     * Returns the alarm state of this zap channel.<p>
     * This may be one of
     * <ul>
     * <li>Red Alarm</li>
     * <li>Yellow Alarm</li>
     * <li>Blue Alarm</li>
     * <li>Recovering</li>
     * <li>Loopback</li>
     * <li>Not Open</li>
     * <li>No Alarm</li>
     * </ul>
     */
    public String getAlarm()
    {
        return alarm;
    }

    /**
     * Sets the alarm state of this zap channel.
     */
    public void setAlarm(String alarm)
    {
        this.alarm = alarm;
    }
}

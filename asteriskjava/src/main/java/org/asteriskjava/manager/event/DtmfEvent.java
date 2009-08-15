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
 * A DtmfEvent is triggered each time a DTMF digit is sent or received on a
 * channel.<p>
 * To support variable-length DTMF Asterisk (since 1.4.0) interally uses two different frames
 * for DTMF releated events (<code>AST_FRAME_DTMF_BEGIN</code> and <code>AST_FRAME_DTMF_END</code>).
 * Before 1.4.0 Asterisk only used one frame (<code>AST_FRAME_DTMF</code>) which is now an alias for
 * <code>AST_FRAME_DTMF_END</code>.<br>
 * Many other systems and devices (like mobile phone providers) do not support variable-length DTMF.
 * In these cases you will only see <code>AST_FRAME_DTMF_END</code> frames in Asterisk.<br>
 * When building DTMF aware applications you should not rely on <code>AST_FRAME_DTMF_BEGIN</code>.
 * Generally it is safe to just ignore them and only react on <code>AST_FRAME_DTMF_END</code> frames.<br>
 * To check whether an DtmfEvent represents an <code>AST_FRAME_DTMF_BEGIN</code> or
 * <code>AST_FRAME_DTMF_END</code> frame use the {@link #isBegin()} and {@link #isEnd()} methods.
 * <p/>
 * You can find more information on how Asterisk handles DTMF in the
 * <a href="http://www.voip-info.org/wiki/view/Asterisk+DTMF">DTMF article at voip-info.org</a><p>
 * It is implemented in <code>main/channel.c</code>.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: DtmfEvent.java 961 2008-02-03 02:53:56Z srt $
 * @since 1.0.0
 */
public class DtmfEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    public static final String DIRECTION_RECEIVED = "Received";
    public static final String DIRECTION_SENT = "Sent";

    private String channel;
    private String uniqueId;
    private String digit;
    private String direction;
    private Boolean begin;
    private Boolean end;

    /**
     * Creates a new DtmfEvent.
     *
     * @param source
     */
    public DtmfEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel the DTMF digit was sent or received on.
     * The channel name is of the form "Zap/&lt;channel number&gt;".
     *
     * @return the channel name.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel.
     *
     * @param channel the channel name.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the unique id of the the channel the DTMF digit was sent or received on.
     *
     * @return the unique id of the channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the the channel.
     *
     * @param uniqueId the unique id of the the channel.
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the DTMF digit that was sent or received.
     *
     * @return the DTMF digit that was sent or received.
     */
    public String getDigit()
    {
        return digit;
    }

    /**
     * Sets the DTMF digit that was sent or received.
     *
     * @param digit the DTMF digit that was sent or received.
     */
    public void setDigit(String digit)
    {
        this.digit = digit;
    }

    /**
     * Returns whether the DTMF digit was sent or received.<p>
     * Possible values are:
     * <ul>
     * <li>Received</li>
     * <li>Sent</li>
     * </ul>
     *
     * @return "Reveived" if the DTMF was received (sent from the device to Asterisk) or "Sent" if the DTMF
     *         digit was sent (sent from Asterisk to the device).
     * @see #DIRECTION_RECEIVED
     * @see #DIRECTION_SENT
     */
    public String getDirection()
    {
        return direction;
    }

    /**
     * Sets whether the DTMF digit was sent or received.
     *
     * @param direction "Received" or "Sent".
     */
    public void setDirection(String direction)
    {
        this.direction = direction;
    }

    /**
     * Returns whether this event represents an <code>AST_FRAME_DTMF_BEGIN</code> frame.<p>
     * Gerally your application will want to ignore begin events. You will only need
     * them if you want to make use of the duration a DTMF key was pressed.<p>
     * Note that there will be DTMF end events without a corresponding begin event
     * as not all systems (including Asterisk prior to 1.4.0) support variable-length
     * DTMF.
     *
     * @return <code>true</code> if this is a DTMF begin event (key pressed),
     *         <code>false</code> otherwise.
     */
    public Boolean isBegin()
    {
        return begin != null && begin;
    }

    /**
     * Sets whether this event represents an <code>AST_FRAME_DTMF_BEGIN</code> frame.
     *
     * @param begin <code>true</code> if this is a DTMF begin event (key pressed),
     *              <code>false</code> otherwise.
     */
    public void setBegin(Boolean begin)
    {
        this.begin = begin;
    }

    /**
     * Returns whether this event represents an <code>AST_FRAME_DTMF_END</code> frame.<p>
     * DTMF information received from systems that do not support variable-length
     * DTMF you will only see DTMF end events.
     *
     * @return <code>true</code> if this is a DTMF end event (key released),
     *         <code>false</code> otherwise.
     */
    public boolean isEnd()
    {
        return end != null && end;
    }

    /**
     * Sets whether this event represents an <code>AST_FRAME_DTMF_END</code> frame.
     *
     * @param end <code>true</code> if this is a DTMF end event (key released),
     *            <code>false</code> otherwise.
     */
    public void setEnd(Boolean end)
    {
        this.end = end;
    }

    /**
     * Returns whether the DTMF digit was received by Asterisk (sent from the device to Asterisk).
     *
     * @return <code>true</code> if the DTMF digit was received by Asterisk,
     *         <code>false</code> otherwise.
     * @see #getDirection()
     */
    public boolean isReceived()
    {
        return direction != null && DIRECTION_RECEIVED.equalsIgnoreCase(direction);
    }

    /**
     * Returns whether the DTMF digit was sent from Asterisk to the device.
     *
     * @return <code>true</code> if the DTMF digit was sent from Asterisk to the device,
     *         <code>false</code> otherwise.
     * @see #getDirection()
     */
    public boolean isSent()
    {
        return direction != null && DIRECTION_SENT.equalsIgnoreCase(direction);
    }
}
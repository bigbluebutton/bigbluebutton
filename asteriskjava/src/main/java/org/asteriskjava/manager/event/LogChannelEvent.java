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
 * A LogChannelEvent is triggered when logging is turned on or off.<p>
 * It is implemented in <code>logger.c</code><p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: LogChannelEvent.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class LogChannelEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = 650153034857116588L;

    private String channel;
    private Boolean enabled;
    private Integer reason;
    private String reasonTxt;

    /**
     * @param source
     */
    public LogChannelEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the log channel.
     * 
     * @return the name of the log channel.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the log channel.
     * 
     * @param channel the name of the log channel.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns if logging has been enabled or disabled.
     * 
     * @return Boolean.TRUE if logging has been enabled, Boolean.FALSE if it has
     *         been disabled.
     */
    public Boolean getEnabled()
    {
        return enabled;
    }

    /**
     * Sets if logging has been enabled or disabled.
     * 
     * @param enabled Boolean.TRUE if logging has been enabled, Boolean.FALSE if
     *            it has been disabled.
     */
    public void setEnabled(Boolean enabled)
    {
        this.enabled = enabled;
    }

    /**
     * Returns the reason code for disabling logging.
     * 
     * @return the reason code for disabling logging.
     */
    public Integer getReason()
    {
        return reason;
    }

    /**
     * Returns the textual representation of the reason for disabling logging.
     * 
     * @return the textual representation of the reason for disabling logging.
     */
    public String getReasonTxt()
    {
        return reasonTxt;
    }

    /**
     * Sets the reason for disabling logging.
     * 
     * @param s the reason in the form "%d - %s".
     */
    public void setReason(String s)
    {
        int spaceIdx;

        if (s == null)
        {
            return;
        }

        spaceIdx = s.indexOf(' ');
        if (spaceIdx <= 0)
        {
            spaceIdx = s.length();
        }

        try
        {
            this.reason = Integer.valueOf(s.substring(0, spaceIdx));
        }
        catch (NumberFormatException e)
        {
            return;
        }

        if (s.length() > spaceIdx + 3)
        {
            this.reasonTxt = s.substring(spaceIdx + 3, s.length());
        }
    }
}

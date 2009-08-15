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
 * Say a given time, returning early if any of the given DTMF digits are
 * pressed.<p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed or -1 on error/hangup.<p>
 * Available since Asterisk 1.2.
 * 
 * @since 0.2
 * @author srt
 * @version $Id: SayDateTimeCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SayDateTimeCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = -976344744239948036L;

    private static final String DEFAULT_FORMAT = "ABdY 'digits/at' IMp";

    private long time;
    private String escapeDigits;
    private String format;
    private String timezone;

    /**
     * Creates a new SayDateTimeCommand that says the given time.
     * 
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *            1, 1970, Coordinated Universal Time (UTC)
     */
    public SayDateTimeCommand(long time)
    {
        super();
        this.time = time;
    }

    /**
     * Creates a new SayDateTimeCommand that says the given time and allows
     * interruption by one of the given escape digits.
     * 
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *            1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *            command or <code>null</code> for none.
     */
    public SayDateTimeCommand(long time, String escapeDigits)
    {
        super();
        this.time = time;
        this.escapeDigits = escapeDigits;
    }

    /**
     * Creates a new SayDateTimeCommand that says the given time in the given
     * format and allows interruption by one of the given escape digits.
     * 
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *            1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *            command or <code>null</code> for none.
     * @param format the format the time should be said in
     */
    public SayDateTimeCommand(long time, String escapeDigits, String format)
    {
        super();
        this.time = time;
        this.escapeDigits = escapeDigits;
        this.format = format;
    }

    /**
     * Creates a new SayDateTimeCommand that says the given time in the given
     * format and timezone and allows interruption by one of the given escape
     * digits.
     * 
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *            1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *            command or <code>null</code> for none.
     * @param format the format the time should be said in
     * @param timezone the timezone to use when saying the time, for example
     *            "UTC" or "Europe/Berlin".
     */
    public SayDateTimeCommand(long time, String escapeDigits, String format,
            String timezone)
    {
        super();
        this.time = time;
        this.escapeDigits = escapeDigits;
        this.format = format;
        this.timezone = timezone;
    }

    /**
     * Returns the time to say in seconds elapsed since 00:00:00 on January 1,
     * 1970, Coordinated Universal Time (UTC).
     * 
     * @return the time to say in seconds elapsed since 00:00:00 on January 1,
     *         1970, Coordinated Universal Time (UTC)
     */
    public long getTime()
    {
        return time;
    }

    /**
     * Returns the time to say in seconds elapsed since 00:00:00 on January 1,
     * 1970, Coordinated Universal Time (UTC).<p>
     * This property is mandatory.
     * 
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *            1, 1970, Coordinated Universal Time (UTC)
     */
    public void setTime(long time)
    {
        this.time = time;
    }

    /**
     * Returns the digits that allow the user to interrupt this command.
     * 
     * @return the digits that allow the user to interrupt this command.
     */
    public String getEscapeDigits()
    {
        return escapeDigits;
    }

    /**
     * Sets the digits that allow the user to interrupt this command.
     * 
     * @param escapeDigits the digits that allow the user to interrupt this
     *            command or <code>null</code> for none.
     */
    public void setEscapeDigits(String escapeDigits)
    {
        this.escapeDigits = escapeDigits;
    }

    /**
     * Returns the format the time should be said in.
     * 
     * @return the format the time should be said in
     */
    public String getFormat()
    {
        return format;
    }

    /**
     * Sets the format the time should be said in.<p>
     * See <code>voicemail.conf</code>.<p>
     * Defaults to "ABdY 'digits/at' IMp".
     * 
     * @param format the format the time should be said in
     */
    public void setFormat(String format)
    {
        this.format = format;
    }

    /**
     * Returns the timezone to use when saying the time.
     * 
     * @return the timezone to use when saying the time.
     */
    public String getTimezone()
    {
        return timezone;
    }

    /**
     * Sets the timezone to use when saying the time.<p>
     * A list of available timezones is available in
     * <code>/usr/share/zoneinfo</code> on your Asterisk server.<p>
     * Defaults to machine default.
     * 
     * @param timezone the timezone to use when saying the time, for example
     *            "UTC" or "Europe/Berlin".
     */
    public void setTimezone(String timezone)
    {
        this.timezone = timezone;
    }

    @Override
   public String buildCommand()
    {
        StringBuffer sb;

        sb = new StringBuffer("SAY DATETIME ");
        sb.append(time);
        sb.append(" ");
        sb.append(escapeAndQuote(escapeDigits));

        if (format == null && timezone != null)
        {
            sb.append(" ");
            sb.append(escapeAndQuote(DEFAULT_FORMAT));
        }
        if (format != null)
        {
            sb.append(" ");
            sb.append(escapeAndQuote(format));
        }

        if (timezone != null)
        {
            sb.append(" ");
            sb.append(escapeAndQuote(timezone));
        }

        return sb.toString();
    }
}

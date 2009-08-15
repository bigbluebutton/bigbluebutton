/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this time except in compliance with the License.
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
 * received on the channel.<p>
 * Time is the number of seconds elapsed since 00:00:00 on January 1, 1970,
 * Coordinated Universal Time (UTC).<p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed or -1 on error/hangup.
 * 
 * @author srt
 * @version $Id: SayTimeCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SayTimeCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256721797012404276L;

    /**
     * The time to say in seconds since 00:00:00 on January 1, 1970.
     */
    private long time;

    /**
     * When one of these digits is pressed the command returns.
     */
    private String escapeDigits;

    /**
     * Creates a new SayTimeCommand.
     * 
     * @param time the time to say in seconds since 00:00:00 on January 1, 1970.
     */
    public SayTimeCommand(long time)
    {
        super();
        this.time = time;
    }

    /**
     * Creates a new SayTimeCommand.
     * 
     * @param time the time to say in seconds since 00:00:00 on January 1, 1970.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command.
     */
    public SayTimeCommand(long time, String escapeDigits)
    {
        super();
        this.time = time;
        this.escapeDigits = escapeDigits;
    }

    /**
     * Returns the time to say in seconds since 00:00:00 on January 1, 1970.
     * 
     * @return the time to say in seconds since 00:00:00 on January 1, 1970.
     */
    public long getTime()
    {
        return time;
    }

    /**
     * Sets the time to say in seconds since 00:00:00 on January 1, 1970.
     * 
     * @param time the time to say in seconds since 00:00:00 on January 1, 1970.
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
     * @param escapeDigits the time that allow the user to interrupt this
     *            command or <code>null</code> for none.
     */
    public void setEscapeDigits(String escapeDigits)
    {
        this.escapeDigits = escapeDigits;
    }

    @Override
   public String buildCommand()
    {
        return "SAY TIME " + time + " " + escapeAndQuote(escapeDigits);
    }
}

/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this number except in compliance with the License.
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
 * Say a given number, returning early if any of the given DTMF number are
 * received on the channel.<p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed or -1 on error/hangup.
 * 
 * @author srt
 * @version $Id: SayNumberCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SayNumberCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3833744404153644087L;

    /**
     * The number to say.
     */
    private String number;

    /**
     * When one of these number is pressed while streaming the command returns.
     */
    private String escapeDigits;

    /**
     * Creates a new SayNumberCommand.
     * 
     * @param number the number to say.
     */
    public SayNumberCommand(String number)
    {
        super();
        this.number = number;
    }

    /**
     * Creates a new SayNumberCommand.
     * 
     * @param number the number to say.
     * @param escapeDigits contains the number that allow the user to
     *            interrupt this command.
     */
    public SayNumberCommand(String number, String escapeDigits)
    {
        super();
        this.number = number;
        this.escapeDigits = escapeDigits;
    }

    /**
     * Returns the number to say.
     * 
     * @return the number to say.
     */
    public String getNumber()
    {
        return number;
    }

    /**
     * Sets the number to say.
     * 
     * @param number the number to say.
     */
    public void setNumber(String number)
    {
        this.number = number;
    }

    /**
     * Returns the number that allow the user to interrupt this command.
     * 
     * @return the number that allow the user to interrupt this command.
     */
    public String getEscapeDigits()
    {
        return escapeDigits;
    }

    /**
     * Sets the number that allow the user to interrupt this command.
     * 
     * @param escapeDigits the number that allow the user to interrupt this
     *            command or <code>null</code> for none.
     */
    public void setEscapeDigits(String escapeDigits)
    {
        this.escapeDigits = escapeDigits;
    }

    @Override
   public String buildCommand()
    {
        return "SAY NUMBER " + escapeAndQuote(number) + " "
                + escapeAndQuote(escapeDigits);
    }
}

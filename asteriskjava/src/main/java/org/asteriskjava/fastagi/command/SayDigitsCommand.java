/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this digits except in compliance with the License.
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
 * Say a given digit string, returning early if any of the given DTMF digits are
 * received on the channel.<p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed or -1 on error/hangup.
 * 
 * @author srt
 * @version $Id: SayDigitsCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SayDigitsCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3907207173934101552L;

    /**
     * The digits string to say.
     */
    private String digits;

    /**
     * When one of these digits is pressed while saying the digits the command
     * returns.
     */
    private String escapeDigits;

    /**
     * Creates a new SayDigitsCommand.
     * 
     * @param digits the digits to say.
     */
    public SayDigitsCommand(String digits)
    {
        super();
        this.digits = digits;
    }

    /**
     * Creates a new SayDigitsCommand.
     * 
     * @param digits the digits to say.
     * @param escapeDigits the digits that allow the user to interrupt this
     *            command.
     */
    public SayDigitsCommand(String digits, String escapeDigits)
    {
        super();
        this.digits = digits;
        this.escapeDigits = escapeDigits;
    }

    /**
     * Returns the digits string to say.
     * 
     * @return the digits string to say.
     */
    public String getDigits()
    {
        return digits;
    }

    /**
     * Sets the digits to say.
     * 
     * @param digits the digits string to say.
     */
    public void setDigits(String digits)
    {
        this.digits = digits;
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

    @Override
   public String buildCommand()
    {
        return "SAY DIGITS " + escapeAndQuote(digits) + " "
                + escapeAndQuote(escapeDigits);
    }
}

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
 * Sends a message to the Asterisk console via the verbose message system.<p>
 * Always returns 1.
 * 
 * @author srt
 * @version $Id: VerboseCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class VerboseCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The message to send.
     */
    private String message;

    /**
     * The verbosity level to use.<p>
     * Must be in [1..4]
     */
    private int level;

    /**
     * Creates a new VerboseCommand.
     * 
     * @param message the message to send.
     * @param level the verbosity level to use.<p>
     *            Must be in [1..4]
     */
    public VerboseCommand(String message, int level)
    {
        super();
        this.message = message;
        this.level = level;
    }

    /**
     * Returns the message to send.
     * 
     * @return the message to send.
     */
    public String getMessage()
    {
        return message;
    }

    /**
     * Sets the message to send.
     * 
     * @param message the message to send.
     */
    public void setMessage(String message)
    {
        this.message = message;
    }

    /**
     * Returns the level to use.
     * 
     * @return the level to use.
     */
    public int getLevel()
    {
        return level;
    }

    /**
     * Sets the level to use.<p>
     * Must be in in [1..4].
     * 
     * @param level the level to use.
     */
    public void setLevel(int level)
    {
        this.level = level;
    }

    @Override
   public String buildCommand()
    {
        return "VERBOSE " + escapeAndQuote(message) + " " + level;
    }
}

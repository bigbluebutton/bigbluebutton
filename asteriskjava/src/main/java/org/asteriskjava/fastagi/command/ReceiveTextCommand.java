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
 * Receives a string of text on a channel.<p>
 * Specify timeout to be the maximum time to wait for input in milliseconds, or
 * 0 for infinite.<p>
 * Most channels do not support the reception of text.<p>
 * Returns -1 for failure or 1 for success, and the string in parentheses.<p>
 * Available since Asterisk 1.2.
 * 
 * @since 0.2
 * @author srt
 * @version $Id: ReceiveTextCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class ReceiveTextCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The milliseconds to wait for the channel to receive a character.
     */
    private int timeout;

    /**
     * Creates a new ReceiveTextCommand with a default timeout of 0 meaning to
     * wait for ever.
     */
    public ReceiveTextCommand()
    {
        super();
        this.timeout = 0;
    }

    /**
     * Creates a new ReceiveTextCommand.
     * 
     * @param timeout the milliseconds to wait for the channel to receive the
     *            text.
     */
    public ReceiveTextCommand(int timeout)
    {
        super();
        this.timeout = timeout;
    }

    /**
     * Returns the milliseconds to wait for the channel to receive the text.
     * 
     * @return the milliseconds to wait for the channel to receive the text.
     */
    public int getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the milliseconds to wait for the channel to receive the text.
     * 
     * @param timeout the milliseconds to wait for the channel to receive the
     *            text.
     */
    public void setTimeout(int timeout)
    {
        this.timeout = timeout;
    }

    @Override
   public String buildCommand()
    {
        return "RECEIVE TEXT " + timeout;
    }
}

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
 * Waits up to 'timeout' milliseconds for channel to receive a DTMF digit.<p>
 * Returns -1 on channel failure, 0 if no digit is received in the timeout, or
 * the numerical value of the ascii of the digit if one is received. Use -1 for
 * the timeout value if you desire the call to block indefinitely.
 * 
 * @author srt
 * @version $Id: WaitForDigitCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class WaitForDigitCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3257562923458443314L;

    /**
     * The milliseconds to wait for the channel to receive a DTMF digit.
     */
    private long timeout;

    /**
     * Creates a new WaitForDigitCommand with a default timeout of -1 which
     * blocks the channel indefinitely.
     */
    public WaitForDigitCommand()
    {
        super();
        this.timeout = -1;
    }

    /**
     * Creates a new WaitForDigitCommand.
     * 
     * @param timeout the milliseconds to wait for the channel to receive a DTMF
     *            digit.
     */
    public WaitForDigitCommand(long timeout)
    {
        super();
        this.timeout = timeout;
    }

    /**
     * Returns the milliseconds to wait for the channel to receive a DTMF digit.
     * 
     * @return the milliseconds to wait for the channel to receive a DTMF digit.
     */
    public long getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the milliseconds to wait for the channel to receive a DTMF digit.
     * 
     * @param timeout the milliseconds to wait for the channel to receive a DTMF
     *            digit.
     */
    public void setTimeout(long timeout)
    {
        this.timeout = timeout;
    }

    @Override
   public String buildCommand()
    {
        return "WAIT FOR DIGIT " + timeout;
    }
}

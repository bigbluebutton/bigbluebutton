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
 * Stream the given file, and recieve DTMF data. The user may interrupt the streaming
 * by starting to enter digits.<p>
 * Returns the digits recieved from the channel at the other end.<p>
 * Input ends when the timeout is reached, the maximum number of digits is read
 * or the user presses #.
 * 
 * @author srt
 * @version $Id: GetDataCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class GetDataCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3978141041352128820L;

    private static final int DEFAULT_MAX_DIGITS = 1024;
    private static final int DEFAULT_TIMEOUT = 0;

    
    /**
     * The name of the file to stream.
     */
    private String file;

    /**
     * The timeout in milliseconds to wait for data.<p>
     * 0 means standard timeout value, -1 means "ludicrous time" (essentially
     * never times out).
     */
    private long timeout;

    /**
     * The maximum number of digits to read.<p>
     * Must be in [1..1024].
     */
    private int maxDigits;

    /**
     * Creates a new GetDataCommand with default timeout and maxDigits set to
     * 1024.
     * 
     * @param file the name of the file to stream, must not include extension.
     */
    public GetDataCommand(String file)
    {
        super();
        this.file = file;
        this.timeout = DEFAULT_TIMEOUT;
        this.maxDigits = DEFAULT_MAX_DIGITS;
    }

    /**
     * Creates a new GetDataCommand with the given timeout and maxDigits set to
     * 1024.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param timeout the timeout in milliseconds to wait for data.<p>
     *            0 means standard timeout value, -1 means "ludicrous time"
     *            (essentially never times out).
     */
    public GetDataCommand(String file, long timeout)
    {
        super();
        this.file = file;
        this.timeout = timeout;
        this.maxDigits = DEFAULT_MAX_DIGITS;
    }

    /**
     * Creates a new GetDataCommand with the given timeout and maxDigits.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param timeout the timeout in milliseconds to wait for data.<p>
     *            0 means standard timeout value, -1 means "ludicrous time"
     *            (essentially never times out).
     * @param maxDigits the maximum number of digits to read.<p>
     *            Must be in [1..1024].
     * 
     * @throws IllegalArgumentException if maxDigits is not in [1..1024]
     */
    public GetDataCommand(String file, long timeout, int maxDigits)
            throws IllegalArgumentException
    {
        super();
        if (maxDigits < 1 || maxDigits > 1024)
        {
            throw new IllegalArgumentException("maxDigits must be in [1..1024]");
        }

        this.file = file;
        this.timeout = timeout;
        this.maxDigits = maxDigits;
    }

    /**
     * Returns the name of the file to stream.
     * 
     * @return the name of the file to stream.
     */
    public String getFile()
    {
        return file;
    }

    /**
     * Sets the name of the file to stream.<p>
     * This attribute is mandatory.
     * 
     * @param file the name of the file to stream, must not include extension.
     */
    public void setFile(String file)
    {
        this.file = file;
    }

    /**
     * Returns the timeout to wait for data.
     * 
     * @return the timeout in milliseconds to wait for data.
     */
    public long getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the timeout to wait for data.
     * 
     * @param timeout the timeout in milliseconds to wait for data.<p>
     *            0 means standard timeout value, -1 means "ludicrous time"
     *            (essentially never times out).
     */
    public void setTimeout(long timeout)
    {
        this.timeout = timeout;
    }

    /**
     * Returns the maximum number of digits to read.
     * 
     * @return the maximum number of digits to read.
     */
    public int getMaxDigits()
    {
        return maxDigits;
    }

    /**
     * Sets the maximum number of digits to read.
     * 
     * @param maxDigits the maximum number of digits to read.<p>
     *            Must be in [1..1024].
     * 
     * @throws IllegalArgumentException if maxDigits is not in [1..1024]
     */
    public void setMaxDigits(int maxDigits) throws IllegalArgumentException
    {
        if (maxDigits < 1 || maxDigits > 1024)
        {
            throw new IllegalArgumentException("maxDigits must be in [1..1024]");
        }

        this.maxDigits = maxDigits;
    }

    @Override
   public String buildCommand()
    {
        if (maxDigits == DEFAULT_MAX_DIGITS)
        {
            if (timeout == DEFAULT_TIMEOUT)
            {
                return "GET DATA " + escapeAndQuote(file);
            }
            else
            {
                return "GET DATA " + escapeAndQuote(file) + " " + timeout;
            }
        }
        return "GET DATA " + escapeAndQuote(file) + " " + timeout + " "
                + maxDigits;
    }
}

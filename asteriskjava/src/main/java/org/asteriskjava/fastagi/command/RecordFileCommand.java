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
 * Record to a file until a given dtmf digit in the sequence is received.
 * <p>
 * Returns -1 on hangup or error.
 * <p>
 * The format will specify what kind of file will be recorded. The timeout is
 * the maximum record time in milliseconds, or -1 for no timeout. Offset samples
 * is optional, and if provided will seek to the offset without exceeding the
 * end of the file. "maxSilence" is the number of seconds of maxSilence allowed
 * before the function returns despite the lack of dtmf digits or reaching
 * timeout.
 * 
 * @author srt
 * @version $Id: RecordFileCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class RecordFileCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3978141041352128820L;

    /**
     * The name of the file to record.
     */
    private String file;

    /**
     * The format of the file to be recorded, for example "wav".
     */
    private String format;

    /**
     * The these digits a user can press to end the recording.
     */
    private String escapeDigits;

    /**
     * The maximum record time in milliseconds, or -1 for no timeout.
     */
    private int timeout;

    /**
     * The offset samples to skip.
     */
    private int offset;

    /**
     * Wheather a beep should be played before recording.
     */
    private boolean beep;

    /**
     * The amount of silence (in seconds) to allow before returning despite the
     * lack of dtmf digits or reaching timeout.
     */
    private int maxSilence;

    /**
     * Creates a new RecordFileCommand.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param format the format of the file to be recorded, for example "wav".
     * @param escapeDigits contains the digits that allow the user to end
     *            recording.
     * @param timeout the maximum record time in milliseconds, or -1 for no
     *            timeout.
     */
    public RecordFileCommand(String file, String format, String escapeDigits, int timeout)
    {
        super();
        this.file = file;
        this.format = format;
        this.escapeDigits = escapeDigits;
        this.timeout = timeout;
        this.offset = 0;
        this.beep = false;
        this.maxSilence = 0;
    }

    /**
     * Creates a new RecordFileCommand.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param format the format of the file to be recorded, for example "wav".
     * @param escapeDigits contains the digits that allow the user to end
     *            recording.
     * @param timeout the maximum record time in milliseconds, or -1 for no
     *            timeout.
     * @param offset the offset samples to skip.
     * @param beep <code>true</code> if a beep should be played before
     *            recording.
     * @param maxSilence The amount of silence (in seconds) to allow before
     *            returning despite the lack of dtmf digits or reaching timeout.
     */
    public RecordFileCommand(String file, String format, String escapeDigits, int timeout, int offset, boolean beep,
            int maxSilence)
    {
        super();
        this.file = file;
        this.format = format;
        this.escapeDigits = escapeDigits;
        this.timeout = timeout;
        this.offset = offset;
        this.beep = beep;
        this.maxSilence = maxSilence;
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
     * Sets the name of the file to stream.
     * 
     * @param file the name of the file to stream, must not include extension.
     */
    public void setFile(String file)
    {
        this.file = file;
    }

    /**
     * Returns the format of the file to be recorded, for example "wav".
     * 
     * @return the format of the file to be recorded, for example "wav".
     */
    public String getFormat()
    {
        return format;
    }

    /**
     * Sets the format of the file to be recorded, for example "wav".
     * 
     * @param format the format of the file to be recorded, for example "wav".
     */
    public void setFormat(String format)
    {
        this.format = format;
    }

    /**
     * Returns the digits that allow the user to end recording.
     * 
     * @return the digits that allow the user to end recording.
     */
    public String getEscapeDigits()
    {
        return escapeDigits;
    }

    /**
     * Sets the digits that allow the user to end recording.
     * 
     * @param escapeDigits the digits that allow the user to end recording or
     *            <code>null</code> for none.
     */
    public void setEscapeDigits(String escapeDigits)
    {
        this.escapeDigits = escapeDigits;
    }

    /**
     * Returns the maximum record time in milliseconds.
     * 
     * @return the maximum record time in milliseconds.
     */
    public int getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the maximum record time in milliseconds.
     * 
     * @param timeout the maximum record time in milliseconds, or -1 for no
     *            timeout.
     */
    public void setTimeout(int timeout)
    {
        this.timeout = timeout;
    }

    /**
     * Returns the offset samples to skip.
     * 
     * @return the offset samples to skip.
     */
    public int getOffset()
    {
        return offset;
    }

    /**
     * Sets the offset samples to skip.
     * 
     * @param offset the offset samples to skip.
     */
    public void setOffset(int offset)
    {
        this.offset = offset;
    }

    /**
     * Returns <code>true</code> if a beep should be played before recording.
     * 
     * @return <code>true</code> if a beep should be played before recording,
     *         <code>false</code> if not.
     */
    public boolean getBeep()
    {
        return beep;
    }

    /**
     * Set to <code>true</code> to play a beep before recording.
     * 
     * @param beep <code>true</code> if a beep should be played before
     *            recording, <code>false</code> if not.
     */
    public void setBeep(boolean beep)
    {
        this.beep = beep;
    }

    /**
     * Returns the amount of silence (in seconds) to allow before returning
     * despite the lack of dtmf digits or reaching timeout.
     * 
     * @return the amount of silence (in seconds) to allow before returning
     *         despite the lack of dtmf digits or reaching timeout.
     */
    int getMaxSilence()
    {
        return maxSilence;
    }

    /**
     * Sets the amount of silence (in seconds) to allow before returning despite
     * the lack of dtmf digits or reaching timeout.
     * 
     * @param maxSilence the amount of silence (in seconds) to allow before
     *            returning despite the lack of dtmf digits or reaching timeout.
     */
    void setMaxSilence(int maxSilence)
    {
        this.maxSilence = maxSilence;
    }

    @Override
   public String buildCommand()
    {
        return "RECORD FILE " + escapeAndQuote(file) + " " + escapeAndQuote(format) + " " + escapeAndQuote(escapeDigits)
                + " " + timeout + " " + offset + (beep ? " BEEP" : "") + " s=" + maxSilence;
    }
}

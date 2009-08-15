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
 * Plays the given file, allowing playback to be interrupted by the given
 * digits, if any, and allows the listner to control the stream.<p>
 * If offset is provided then the audio will seek to sample offset before play
 * starts.<p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed, or -1 on error or if the
 * channel was disconnected. <p>
 * Remember, the file extension must not be included in the filename.<p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: ControlStreamFileCommand.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class ControlStreamFileCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3978141041352128820L;

    /**
     * The name of the file to stream.
     */
    private String file;

    /**
     * When one of these digits is pressed while streaming the command returns.
     */
    private String escapeDigits;

    /**
     * The offset samples to skip before streaming.
     */
    private int offset;

    private String forwardDigit;

    private String rewindDigit;

    private String pauseDigit;

    /**
     * Creates a new ControlStreamFileCommand, streaming from the beginning. It
     * uses the default digit "#" for forward and "*" for rewind and does not
     * support pausing.
     * 
     * @param file the name of the file to stream, must not include extension.
     */
    public ControlStreamFileCommand(String file)
    {
        super();
        this.file = file;
        this.offset = -1;
    }

    /**
     * Creates a new ControlStreamFileCommand, streaming from the beginning. It
     * uses the default digit "#" for forward and "*" for rewind and does not
     * support pausing.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command.
     */
    public ControlStreamFileCommand(String file, String escapeDigits)
    {
        super();
        this.file = file;
        this.escapeDigits = escapeDigits;
        this.offset = -1;
    }

    /**
     * Creates a new ControlStreamFileCommand, streaming from the given offset.
     * It uses the default digit "#" for forward and "*" for rewind and does not
     * support pausing.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command. May be <code>null</code> if you don't want the
     *            user to interrupt.
     * @param offset the offset samples to skip before streaming.
     */
    public ControlStreamFileCommand(String file, String escapeDigits, int offset)
    {
        super();
        this.file = file;
        this.escapeDigits = escapeDigits;
        this.offset = offset;
    }

    /**
     * Creates a new ControlStreamFileCommand, streaming from the given offset.
     * It allows the user to pause streaming by pressing the pauseDigit.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command. May be <code>null</code> if you don't want the
     *            user to interrupt.
     * @param offset the offset samples to skip before streaming.
     * @param forwardDigit the digit for fast forward.
     * @param rewindDigit the digit for rewind.
     * @param pauseDigit the digit for pause and unpause.
     */
    public ControlStreamFileCommand(String file, String escapeDigits,
            int offset, String forwardDigit, String rewindDigit,
            String pauseDigit)
    {
        super();
        this.file = file;
        this.escapeDigits = escapeDigits;
        this.offset = offset;
        this.forwardDigit = forwardDigit;
        this.rewindDigit = rewindDigit;
        this.pauseDigit = pauseDigit;
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
     * Returns the offset samples to skip before streaming.
     * 
     * @return the offset samples to skip before streaming.
     */
    public int getOffset()
    {
        return offset;
    }

    /**
     * Sets the offset samples to skip before streaming.
     * 
     * @param offset the offset samples to skip before streaming.
     */
    public void setOffset(int offset)
    {
        this.offset = offset;
    }

    /**
     * Returns the digit for fast forward.
     * 
     * @return the digit for fast forward.
     */
    public String getForwardDigit()
    {
        return forwardDigit;
    }

    /**
     * Returns the digit for rewind.
     * 
     * @return the digit for rewind.
     */
    public String getRewindDigit()
    {
        return rewindDigit;
    }

    /**
     * Retruns the digit for pause and unpause.
     * 
     * @return the digit for pause and unpause.
     */
    public String getPauseDigit()
    {
        return pauseDigit;
    }

    /**
     * Sets the control digits for fast forward and rewind.
     * 
     * @param forwardDigit the digit for fast forward.
     * @param rewindDigit the digit for rewind.
     */
    public void setControlDigits(String forwardDigit, String rewindDigit)
    {
        this.forwardDigit = forwardDigit;
        this.rewindDigit = rewindDigit;
    }

    /**
     * Sets the control digits for fast forward, rewind and pause.
     * 
     * @param forwardDigit the digit for fast forward.
     * @param rewindDigit the digit for rewind.
     * @param pauseDigit the digit for pause and unpause.
     */
    public void setControlDigits(String forwardDigit, String rewindDigit,
            String pauseDigit)
    {
        this.forwardDigit = forwardDigit;
        this.rewindDigit = rewindDigit;
        this.pauseDigit = pauseDigit;
    }

    @Override
   public String buildCommand()
    {
        StringBuffer sb;

        sb = new StringBuffer("CONTROL STREAM FILE ");
        sb.append(escapeAndQuote(file));
        sb.append(" ");
        sb.append(escapeAndQuote(escapeDigits));
        if (offset >= 0)
        {
            sb.append(" ");
            sb.append(offset);
        }
        else if (forwardDigit != null || rewindDigit != null
                || pauseDigit != null)
        {
            sb.append(" 0");
        }

        if (forwardDigit != null || rewindDigit != null || pauseDigit != null)
        {
            sb.append(" ");
            sb.append(forwardDigit);
        }
        if (rewindDigit != null || pauseDigit != null)
        {
            sb.append(" ");
            sb.append(rewindDigit);
        }
        if (pauseDigit != null)
        {
            sb.append(" ");
            sb.append(pauseDigit);
        }

        return sb.toString();
    }
}

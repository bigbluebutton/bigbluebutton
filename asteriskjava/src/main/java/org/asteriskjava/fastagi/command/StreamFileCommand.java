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
 * digits, if any.
 * <p>
 * If offset is provided then the audio will seek to sample offset before play
 * starts.
 * <p>
 * Returns 0 if playback completes without a digit being pressed, or the ASCII
 * numerical value of the digit if one was pressed, or -1 on error or if the
 * channel was disconnected.
 * <p>
 * Remember, filename follows the same conventions and uses the same file path
 * as dialplan applications like Playback or Background. The file extension must
 * not be included in the filename.
 * 
 * @author srt
 * @version $Id: StreamFileCommand.java 1064 2008-06-03 17:27:52Z msmith $
 */
public class StreamFileCommand extends AbstractAgiCommand
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

    /**
     * Creates a new StreamFileCommand, streaming from the beginning.
     * 
     * @param file the name of the file to stream, must not include extension.
     */
    public StreamFileCommand(String file)
    {
        super();
        this.file = file;
        this.offset = -1;
    }

    /**
     * Creates a new StreamFileCommand, streaming from the beginning.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command.
     */
    public StreamFileCommand(String file, String escapeDigits)
    {
        super();
        this.file = file;
        this.escapeDigits = escapeDigits;
        this.offset = -1;
    }

    /**
     * Creates a new StreamFileCommand, streaming from the given offset.
     * 
     * @param file the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *            this command. Maybe <code>null</code> if you don't want the
     *            user to interrupt.
     * @param offset the offset samples to skip before streaming.
     */
    public StreamFileCommand(String file, String escapeDigits, int offset)
    {
        super();
        this.file = file;
        this.escapeDigits = escapeDigits;
        this.offset = offset;
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

    @Override
   public String buildCommand()
    {
        return "STREAM FILE " + escapeAndQuote(file) + " "
                + escapeAndQuote(escapeDigits)
                + (offset < 0 ? "" : " " + offset);
    }
}

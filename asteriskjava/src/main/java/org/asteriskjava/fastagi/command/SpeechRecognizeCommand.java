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
 * Plays back given prompt while listening for speech and dtmf.<p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: SpeechRecognizeCommand.java 1013 2008-03-31 06:51:03Z srt $
 * @since 1.0.0
 */
public class SpeechRecognizeCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 1L;

    private String prompt;
    private int timeout;
    private int offset;

    /**
     * Creates a new SpeechRecognizeCommand that plays the given prompt and listens for for speech and dtmf.
     *
     * @param prompt  the prompt to play.
     * @param timeout the maximum recognition time in milliseconds.
     */
    public SpeechRecognizeCommand(String prompt, int timeout)
    {
        this.prompt = prompt;
        this.timeout = timeout;
        this.offset = 0;
    }

    /**
     * Creates a new SpeechRecognizeCommand that plays the given prompt and listens for for speech and dtmf.
     *
     * @param prompt  the prompt to play.
     * @param timeout the maximum recognition time in milliseconds.
     * @param offset  the offset samples to skip when playing the prompt.
     */
    public SpeechRecognizeCommand(String prompt, int timeout, int offset)
    {
        this.prompt = prompt;
        this.timeout = timeout;
        this.offset = offset;
    }

    /**
     * Returns the prompt to play.
     *
     * @return the prompt to play.
     */
    public String getPrompt()
    {
        return prompt;
    }

    /**
     * Sets the prompt to play.
     *
     * @param prompt the prompt to play.
     */
    public void setPrompt(String prompt)
    {
        this.prompt = prompt;
    }

    /**
     * Returns the maximum recognition time in milliseconds.
     *
     * @return the maximum recognition time in milliseconds.
     */
    public int getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the maximum recognition time in milliseconds.
     *
     * @param timeout the maximum recognition time in milliseconds, or -1 for no timeout.
     */
    public void setTimeout(int timeout)
    {
        this.timeout = timeout;
    }

    /**
     * Returns the offset samples to skip when playing the prompt.
     *
     * @return the offset samples to skip when playing the prompt.
     */
    public int getOffset()
    {
        return offset;
    }

    /**
     * Sets the offset samples to skip when playing the prompt.
     *
     * @param offset the offset samples to skip when playing the prompt.
     */
    public void setOffset(int offset)
    {
        this.offset = offset;
    }

    @Override
    public String buildCommand()
    {
        return "SPEECH RECOGNIZE " + escapeAndQuote(prompt) + " " + timeout + " " + offset;
    }
}
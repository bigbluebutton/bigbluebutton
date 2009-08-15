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
 * Sends the given text on a channel.<p>
 * Most channels do not support the transmission of text.<p>
 * Returns 0 if text is sent, or if the channel does not support text
 * transmission. Returns -1 only on error/hangup.
 * 
 * @author srt
 * @version $Id: SendTextCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SendTextCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3904959746380281145L;

    /**
     * The text to send.
     */
    private String text;

    /**
     * Creates a new SendTextCommand.
     * 
     * @param text the text to send.
     */
    public SendTextCommand(String text)
    {
        super();
        this.text = text;
    }

    /**
     * Returns the text to send.
     * 
     * @return the text to send.
     */
    public String getText()
    {
        return text;
    }

    /**
     * Sets the text to send.
     * 
     * @param text the text to send.
     */
    public void setText(String text)
    {
        this.text = text;
    }

    @Override
   public String buildCommand()
    {
        return "SEND TEXT " + escapeAndQuote(text);
    }
}

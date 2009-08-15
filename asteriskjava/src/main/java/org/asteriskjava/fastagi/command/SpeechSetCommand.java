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
 * Sets a speech engine specific setting.<p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: SpeechSetCommand.java 1013 2008-03-31 06:51:03Z srt $
 * @since 1.0.0
 */
public class SpeechSetCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 1L;
    private String name;
    private String value;

    /**
     * Creates a new SpeechSetCommand that sets the setting indicated by name to the given value.
     *
     * @param name  the name of the setting to set.
     * @param value the value to set.
     */
    public SpeechSetCommand(String name, String value)
    {
        this.name = name;
        this.value = value;
    }

    /**
     * Returns the name of the setting to set.
     *
     * @return the name of the setting to set.
     */
    public String getName()
    {
        return name;
    }

    /**
     * Sets the name of the setting to set.
     *
     * @param name the name of the setting to set.
     */
    public void setName(String name)
    {
        this.name = name;
    }

    /**
     * Returns the value to set.
     *
     * @return the value to set.
     */
    public String getValue()
    {
        return value;
    }

    /**
     * Sets the value to set.
     *
     * @param value the value to set.
     */
    public void setValue(String value)
    {
        this.value = value;
    }

    @Override
    public String buildCommand()
    {
        return "SPEECH SET " + escapeAndQuote(name) + " " + escapeAndQuote(value);
    }
}
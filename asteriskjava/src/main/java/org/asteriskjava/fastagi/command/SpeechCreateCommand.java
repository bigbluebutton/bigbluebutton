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
 * Creates a speech object to be used by the other Speech AGI commands.<p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: SpeechCreateCommand.java 1013 2008-03-31 06:51:03Z srt $
 * @since 1.0.0
 * @see org.asteriskjava.fastagi.command.SpeechDestroyCommand
 * @see org.asteriskjava.fastagi.command.SpeechLoadGrammarCommand
 */
public class SpeechCreateCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 1L;
    private String engine;

    /**
     * Creates a new SpeechCreateCommand for the given engine.
     *
     * @param engine the name of the speech engine to use for subsequent Speech AGI commands.
     */
    public SpeechCreateCommand(String engine)
    {
        this.engine = engine;
    }

    /**
     * Returns the name of the speech engine to use for subsequent Speech AGI commands.
     *
     * @return the name of the speech engine to use for subsequent Speech AGI commands.
     */
    public String getEngine()
    {
        return engine;
    }

    /**
     * Sets the name of the speech engine to use for subsequent Speech AGI commands.
     *
     * @param engine the name of the speech engine to use for subsequent Speech AGI commands.
     */
    public void setEngine(String engine)
    {
        this.engine = engine;
    }

    @Override
    public String buildCommand()
    {
        return "SPEECH CREATE " + escapeAndQuote(engine);
    }
}
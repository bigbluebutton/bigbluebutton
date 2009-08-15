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
 * Destroys a speech object previously created by a {@link SpeechCreateCommand}.<p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: SpeechDestroyCommand.java 1013 2008-03-31 06:51:03Z srt $
 * @since 1.0.0
 * @see org.asteriskjava.fastagi.command.SpeechCreateCommand
 */
public class SpeechDestroyCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Creates a new empty SpeechDestroyCommand.
     */
    public SpeechDestroyCommand()
    {
        super();
    }

    @Override
    public String buildCommand()
    {
        return "SPEECH DESTROY";
    }
}
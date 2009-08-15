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
 * Turns on music on hold on the current channel.<p>
 * Always returns 0.
 * 
 * @author srt
 * @version $Id: SetMusicOnCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SetMusicOnCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3762248656229053753L;

    /**
     * The music on hold class to play music from.
     */
    private String musicOnHoldClass;

    /**
     * Creates a new SetMusicOnCommand playing music from the default music on
     * hold class.
     */
    public SetMusicOnCommand()
    {
        super();
    }

    /**
     * Creates a new SetMusicOnCommand playing music from the default music on
     * hold class.
     * 
     * @param musicOnHoldClass the music on hold class to play music from.
     */
    public SetMusicOnCommand(String musicOnHoldClass)
    {
        this.musicOnHoldClass = musicOnHoldClass;
    }

    /**
     * Returns the music on hold class to play music from.
     * 
     * @return the music on hold class to play music from or <code>null</code>
     *         for the default class.
     */
    public String getMusicOnHoldClass()
    {
        return musicOnHoldClass;
    }

    /**
     * Sets the music on hold class to play music from.
     * 
     * @param musicOnHoldClass the music on hold class to play music from or
     *            <code>null</code> for the default class.
     */
    public void setMusicOnHoldClass(String musicOnHoldClass)
    {
        this.musicOnHoldClass = musicOnHoldClass;
    }

    @Override
   public String buildCommand()
    {
        return "SET MUSIC ON"
                + (musicOnHoldClass == null ? "" : " "
                        + escapeAndQuote(musicOnHoldClass));
    }
}

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
package org.asteriskjava.fastagi;

/**
 * An InvalidCommandSyntaxException is thrown when the reader receives a reply
 * with status code 520.
 * 
 * @author srt
 * @version $Id: InvalidCommandSyntaxException.java 938 2007-12-31 03:23:38Z srt $
 */
public class InvalidCommandSyntaxException extends AgiException
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3257002168165807929L;

    private final String synopsis;
    private final String usage;

    /**
     * Creates a new InvalidCommandSyntaxException with the given synopsis and
     * usage.
     * 
     * @param synopsis the synopsis of the command.
     * @param usage the usage of the command.
     */
    public InvalidCommandSyntaxException(String synopsis, String usage)
    {
        super("Invalid command syntax: " + synopsis);
        this.synopsis = synopsis;
        this.usage = usage;
    }

    /**
     * Returns the synopsis of the command that was called with invalid syntax.
     * 
     * @return the synopsis of the command that was called with invalid syntax.
     */
    public String getSynopsis()
    {
        return synopsis;
    }

    /**
     * Returns a description of the command that was called with invalid syntax.
     * 
     * @return a description of the command that was called with invalid syntax.
     */
    public String getUsage()
    {
        return usage;
    }
}

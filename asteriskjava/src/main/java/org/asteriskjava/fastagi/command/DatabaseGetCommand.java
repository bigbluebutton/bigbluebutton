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
 * Retrieves an entry in the Asterisk database for a given family and key.<p>
 * Returns 0 if is not set. Returns 1 if the variable is set and returns the
 * value in parenthesis.<p>
 * Example return code: 200 result=1 (testvariable)
 * 
 * @author srt
 * @version $Id: DatabaseGetCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class DatabaseGetCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The family of the key to retrieve.
     */
    private String family;

    /**
     * The key to retrieve.
     */
    private String key;

    /**
     * Creates a new DatabaseGetCommand.
     * 
     * @param family the family of the key to retrieve.
     * @param key the key to retrieve.
     */
    public DatabaseGetCommand(String family, String key)
    {
        super();
        this.family = family;
        this.key = key;
    }

    /**
     * Returns the family of the key to retrieve.
     * 
     * @return the family of the key to retrieve.
     */
    public String getFamily()
    {
        return family;
    }

    /**
     * Sets the family of the key to retrieve.
     * 
     * @param family the family of the key to retrieve.
     */
    public void setFamily(String family)
    {
        this.family = family;
    }

    /**
     * Returns the the key to retrieve.
     * 
     * @return the key to retrieve.
     */
    public String getKey()
    {
        return key;
    }

    /**
     * Sets the key to retrieve.
     * 
     * @param key the key to retrieve.
     */
    public void setKey(String key)
    {
        this.key = key;
    }

    @Override
   public String buildCommand()
    {
        return "DATABASE GET " + escapeAndQuote(family) + " "
                + escapeAndQuote(key);
    }
}

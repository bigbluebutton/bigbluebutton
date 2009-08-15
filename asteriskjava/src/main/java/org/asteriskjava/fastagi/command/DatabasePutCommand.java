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
 * Adds or updates an entry in the Asterisk database for a given family, key,
 * and value.<p>
 * Returns 1 if successful, 0 otherwise.
 * 
 * @author srt
 * @version $Id: DatabasePutCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class DatabasePutCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The family of the key to set.
     */
    private String family;

    /**
     * The key to set.
     */
    private String key;

    /**
     * The value to set.
     */
    private String value;

    /**
     * Creates a new DatabasePutCommand.
     * 
     * @param family the family of the key to set.
     * @param key the key to set.
     * @param value the value to set.
     */
    public DatabasePutCommand(String family, String key, String value)
    {
        super();
        this.family = family;
        this.key = key;
        this.value = value;
    }

    /**
     * Returns the family of the key to set.
     * 
     * @return the family of the key to set.
     */
    public String getFamily()
    {
        return family;
    }

    /**
     * Sets the family of the key to set.
     * 
     * @param family the family of the key to set.
     */
    public void setFamily(String family)
    {
        this.family = family;
    }

    /**
     * Returns the the key to set.
     * 
     * @return the key to set.
     */
    public String getKey()
    {
        return key;
    }

    /**
     * Sets the key to set.
     * 
     * @param key the key to set.
     */
    public void setKey(String key)
    {
        this.key = key;
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
        return "DATABASE PUT " + escapeAndQuote(family) + " "
                + escapeAndQuote(key) + " " + escapeAndQuote(value);
    }
}

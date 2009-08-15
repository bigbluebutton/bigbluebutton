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
 * Deletes a family or specific keytree within a family in the Asterisk database.<p>
 * Returns 1 if successful, 0 otherwise.
 * 
 * @author srt
 * @version $Id: DatabaseDelTreeCommand.java 1286 2009-04-04 09:40:40Z srt $
 */
public class DatabaseDelTreeCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The family of the key to delete.
     */
    private String family;

    /**
     * The keytree to delete.
     */
    private String keyTree;

    /**
     * Creates a new DatabaseDelCommand to delete a whole family.
     * 
     * @param family the family to delete.
     */
    public DatabaseDelTreeCommand(String family)
    {
        super();
        this.family = family;
    }

    /**
     * Creates a new DatabaseDelCommand to delete a keytree within a given family.
     * 
     * @param family the family of the keytree to delete.
     * @param keyTree the keytree to delete.
     */
    public DatabaseDelTreeCommand(String family, String keyTree)
    {
        super();
        this.family = family;
        this.keyTree = keyTree;
    }

    /**
     * Returns the family of the key to delete.
     * 
     * @return the family of the key to delete.
     */
    public String getFamily()
    {
        return family;
    }

    /**
     * Sets the family of the key to delete.
     * 
     * @param family the family of the key to delete.
     */
    public void setFamily(String family)
    {
        this.family = family;
    }

    /**
     * Returns the the keytree to delete.
     * 
     * @return the keytree to delete.
     */
    public String getKeyTree()
    {
        return keyTree;
    }

    /**
     * Sets the keytree to delete.
     * 
     * @param keyTree the keytree to delete, <code>null</code> to delete the whole family.
     */
    public void setKeyTree(String keyTree)
    {
        this.keyTree = keyTree;
    }

    @Override
   public String buildCommand()
    {
        if (keyTree == null)
        {
            return "DATABASE DELTREE " + escapeAndQuote(family) + " " + escapeAndQuote(keyTree);
        }
        else
        {
            return "DATABASE DELTREE " + escapeAndQuote(family);
        }
    }
}

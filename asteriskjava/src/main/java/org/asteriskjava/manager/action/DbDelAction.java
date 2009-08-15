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
package org.asteriskjava.manager.action;

/**
 * Deletes an entry in the Asterisk database for a given family and key.<p>
 * Available since Asterisk 1.2 with BRIStuff patches and since Asterisk 1.6
 * 
 * @author gmi
 */
public class DbDelAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 921037572305993779L;
    private String family;
    private String key;

    /**
     * Creates a new empty DbDelAction.
     */
    public DbDelAction()
    {

    }

    /**
     * Creates a new DbDelAction that deletes the value of the database
     * 
     * @param family the family of the key
     * @param key the key of the entry to delete
     */
    public DbDelAction(String family, String key)
    {
        this.family = family;
        this.key = key;
    }

    @Override
    public String getAction()
    {
        return "DBDel";
    }

    /**
     * Returns the family of the key to delete
     * 
     * @return the family of the key to delete
     */
    public String getFamily()
    {
        return family;
    }

    /**
     * Sets the family of the key to delete
     * 
     * @param family the family of the key to delete
     */
    public void setFamily(String family)
    {
        this.family = family;
    }

    /**
     * Returns the the key to delete
     * 
     * @return the key to delete
     */
    public String getKey()
    {
        return key;
    }

    /**
     * Sets the key to delete
     * 
     * @param key the key to delete
     */
    public void setKey(String key)
    {
        this.key = key;
    }
}

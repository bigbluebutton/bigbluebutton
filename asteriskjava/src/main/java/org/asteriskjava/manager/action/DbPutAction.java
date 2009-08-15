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
 * Adds or updates an entry in the Asterisk database for a given family, key,
 * and value.<p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: DbPutAction.java 1041 2008-04-24 01:30:23Z srt $
 * @since 0.2
 */
public class DbPutAction extends AbstractManagerAction
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 921037572305993779L;
    private String family;
    private String key;
    private String val;

    /**
     * Creates a new empty DbPutAction.
     */
    public DbPutAction()
    {

    }

    /**
     * Creates a new DbPutAction that sets the value of the database entry with
     * the given key in the given family.
     * 
     * @param family the family of the key
     * @param key the key of the entry to set
     * @param val the value to set
     * @since 0.2
     */
    public DbPutAction(String family, String key, String val)
    {
        this.family = family;
        this.key = key;
        this.val = val;
    }

    @Override
   public String getAction()
    {
        return "DBPut";
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
    public String getVal()
    {
        return val;
    }

    /**
     * Sets the value to set.
     * 
     * @param val the value to set.
     */
    public void setVal(String val)
    {
        this.val = val;
    }
    
    /**
     * Returns the value to set for BRIstuffed versions.
     * 
     * @return the value to set.
     * @since 1.0.0
     */
    public String getValue()
    {
        return val;
    }
}

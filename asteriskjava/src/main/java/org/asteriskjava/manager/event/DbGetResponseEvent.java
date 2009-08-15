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
package org.asteriskjava.manager.event;

/**
 * A DBGetResponseEvent is sent in response to a DBGetAction and contains the
 * entry that was queried.<p>
 * Available since Asterisk 1.2
 * 
 * @see org.asteriskjava.manager.action.DbGetAction
 * @author srt
 * @version $Id: DbGetResponseEvent.java 1222 2008-12-19 08:10:16Z srt $
 * @since 0.2
 */
public class DbGetResponseEvent extends ResponseEvent
{
    private String family;
    private String key;
    private String val;

    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = -1177773673509373296L;

    /**
     * @param source
     */
    public DbGetResponseEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the family of the database entry that was queried.
     * 
     * @return the family of the database entry that was queried.
     */
    public String getFamily()
    {
        return family;
    }

    /**
     * Sets the family of the database entry that was queried.
     * 
     * @param family the family of the database entry that was queried.
     */
    public void setFamily(String family)
    {
        this.family = family;
    }

    /**
     * Returns the key of the database entry that was queried.
     * 
     * @return the key of the database entry that was queried.
     */
    public String getKey()
    {
        return key;
    }

    /**
     * Sets the key of the database entry that was queried.
     * 
     * @param key the key of the database entry that was queried.
     */
    public void setKey(String key)
    {
        this.key = key;
    }

    /**
     * Returns the value of the database entry that was queried.
     * 
     * @return the value of the database entry that was queried.
     */
    public String getVal()
    {
        return val;
    }

    /**
     * Sets the value of the database entry that was queried.
     * 
     * @param val the value of the database entry that was queried.
     */
    public void setVal(String val)
    {
        this.val = val;
    }
    
    /**
     * Sets the value of the database entry that was queried.
     * It seems that in ast 1.2 ( 1.2.9 +BRIStuff ? ) at least the key is
     * not val anymore but value.
     * 
     * @param val the value of the database entry that was queried.
     */
    public void setValue(String val)
    {
        this.val = val;
    }
}

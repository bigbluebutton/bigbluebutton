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
 * The SetCDRUserFieldAction causes the user field of the call detail record for
 * the given channel to be changed.<p>
 * Depending on the value of the append property the value is appended or
 * overwritten.<p>
 * The SetCDRUserFieldAction is implemented in
 * <code>apps/app_setcdruserfield.c</code>
 * 
 * @author srt
 * @version $Id: SetCdrUserFieldAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class SetCdrUserFieldAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -2024074141079750509L;
    private String channel;
    private String userField;
    private Boolean append;

    /**
     * Creates a new empty SetCdrUserFieldAction.
     */
    public SetCdrUserFieldAction()
    {

    }

    /**
     * Creates a new SetCdrUserFieldAction that sets the user field of the call
     * detail record for the given channel to the given value.
     * 
     * @param channel the name of the channel
     * @param userField the new value of the userfield
     * @since 0.2
     */
    public SetCdrUserFieldAction(String channel, String userField)
    {
        this.channel = channel;
        this.userField = userField;
    }

    /**
     * Creates a new SetCDRUserFieldAction that sets the user field of the call
     * detail record for the given channel to the given value.
     * 
     * @param channel the name of the channel
     * @param userField the new value of the userfield
     * @param append true to append the value to the cdr user field or false to
     *            overwrite
     * @since 0.2
     */
    public SetCdrUserFieldAction(String channel, String userField,
            Boolean append)
    {
        this.channel = channel;
        this.userField = userField;
        this.append = append;
    }

    /**
     * Returns the name of the action, i.e. "SetCDRUserField".
     */
    @Override
   public String getAction()
    {
        return "SetCDRUserField";
    }

    /**
     * Returns the name of the channel to set the cdr user field on.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to set the cdr user field on.<p>
     * This property is mandatory.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the value of the cdr user field to set or append.
     */
    public String getUserField()
    {
        return userField;
    }

    /**
     * Sets the value of the cdr user field to set or append.<p>
     * This property is mandatory.
     */
    public void setUserField(String userField)
    {
        this.userField = userField;
    }

    /**
     * Returns if the value of the cdr user field is appended or overwritten.
     */
    public Boolean getAppend()
    {
        return append;
    }

    /**
     * Set to true to append the value to the cdr user field or false to
     * overwrite.
     */
    public void setAppend(Boolean append)
    {
        this.append = append;
    }
}

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
 * The SetVarAction sets the value of a global or local channel variable.<p>
 * Setting global variables is supported since Asterisk 1.2.
 * 
 * @author Asteria Solutions Group, Inc. <http://www.asteriasgi.com>
 * @author srt
 * @version $Id: SetVarAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class SetVarAction extends AbstractManagerAction
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = 3978144348493591607L;

    /**
     * The channel on which to set the variable.
     */
    public String channel;

    /**
     * The name of the variable to set.
     */
    public String variable;

    /**
     * The value to store.
     */
    public String value;

    /**
     * Creates a new empty SetVarAction.
     */
    public SetVarAction()
    {

    }

    /**
     * Creates a new SetVarAction that sets the given global variable to a new value.
     * 
     * @param variable the name of the global variable to set
     * @param value the new value
     * @since 0.2
     */
    public SetVarAction(String variable, String value)
    {
        this.variable = variable;
        this.value = value;
    }
    
    /**
     * Creates a new SetVarAction that sets the given channel variable of the
     * given channel to a new value.
     * 
     * @param channel the name of the channel to set the variable on
     * @param variable the name of the channel variable
     * @param value the new value
     * @since 0.2
     */
    public SetVarAction(String channel, String variable, String value)
    {
        this.channel = channel;
        this.variable = variable;
        this.value = value;
    }

    /**
     * Returns the name of this action, i.e. "SetVar".
     * 
     * @return the name of this action
     */
    @Override
   public String getAction()
    {
        return "SetVar";
    }

    /**
     * Returns the name of the channel.
     * 
     * @return the name of channel.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel.
     * 
     * @param channel the name of the channel to set.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of the variable to set.
     * 
     * @return the name of the variable to set.
     */
    public String getVariable()
    {
        return variable;
    }

    /**
     * Sets the name of the variable to set.
     * 
     * @param variable the name of the variable to set.
     */
    public void setVariable(String variable)
    {
        this.variable = variable;
    }

    /**
     * Returns the value to store.
     * 
     * @return the value to store.
     */
    public String getValue()
    {
        return value;
    }

    /**
     * Sets the value to store.
     * 
     * @param value the value to set.
     */
    public void setValue(String value)
    {
        this.value = value;
    }
}

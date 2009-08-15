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
 * A VarSetEvent is triggered when a channel or global variable is set in Asterisk.<p>
 * Available since Asterisk 1.6<p>
 * It is implemented in <code>main/pbx.c</code>
 *
 * @author srt
 * @version $Id: VarSetEvent.java 1109 2008-08-16 11:27:26Z srt $
 * @since 1.0.0
 */
public class VarSetEvent extends ManagerEvent
{
    static final long serialVersionUID = 1L;

    private String channel;
    private String uniqueId;
    private String variable;
    private String value;

    public VarSetEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel or <code>null</code> for global variables.
     *
     * @return the name of the channel or <code>null</code> for global variables.
     */
    public String getChannel()
    {
        return channel;
    }

    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the unique id of the channel or <code>null</code> for global variables.
     *
     * @return the unique id of the channel or <code>null</code> for global variables.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the name of the variable that has been set.
     *
     * @return the name of the variable that has been set.
     */
    public String getVariable()
    {
        return variable;
    }

    public void setVariable(String variable)
    {
        this.variable = variable;
    }

    /**
     * Returns the new value of the variable.
     *
     * @return the new value of the variable.
     */
    public String getValue()
    {
        return value;
    }

    public void setValue(String value)
    {
        this.value = value;
    }
}
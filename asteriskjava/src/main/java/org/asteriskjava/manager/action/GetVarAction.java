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

import org.asteriskjava.manager.ExpectedResponse;
import org.asteriskjava.manager.response.GetVarResponse;

/**
 * The GetVarAction queries for a global or local channel variable.<p>
 * Reading global variables is supported since Asterisk 1.2.<p>
 * You cannot read built-in channel variables such as <code>LANGUAGE</code> or
 * <code>CALLERIDNUM</code> using the Manager API. You can only
 * read channel variables that you have explicitly set using the
 * <code>Set</code> or <code>SetVar</code> (for Asterisk 1.0.x)
 * applications in the dialplan, in an AGI script or by using
 * the {@link org.asteriskjava.manager.action.SetVarAction} through
 * the Manager API itself.<p>
 * GetVarAction returns a {@link org.asteriskjava.manager.response.GetVarResponse}.
 * To get the actual value from the corresponding
 * {@link org.asteriskjava.manager.response.ManagerResponse} call
 * {@link org.asteriskjava.manager.response.ManagerResponse#getAttribute(String)}
 * with either the variable name as parameter (for Asterisk 1.0.x) or
 * with "Value" as parameter (for Asterisk since 1.2).<p>
 * Example (for Asterisk 1.2):<p>
 * <pre>
 * GetVarAction getVarAction = new GetVarAction(channel, "MY_VAR");
 * ManagerResponse response = c.sendAction(getVarAction);
 * String value = response.getAttribute("Value");
 * System.out.println("MY_VAR on " + channel + " is " + value);
 * </pre>
 * Where <code>c</code> is an instance of 
 * {@link org.asteriskjava.manager.ManagerConnection} and <code>channel</code>
 * contains the name of a channel instance, for example "SIP/1234-9cd".
 * <p>
 * Since Asterisk-Java 1.0.0 you can also call
 * {@link org.asteriskjava.manager.response.GetVarResponse#getValue()}
 * when using Asterisk 1.2 or later.
 * <p>
 * Since Asterisk 1.4 this action also supports built-in functions like
 * <code>DB()</code>, <code>CALLERID()</code> and <code>ENV()</code>.
 * 
 * @author srt
 * @version $Id: GetVarAction.java 1153 2008-08-22 10:10:22Z srt $
 */
@ExpectedResponse(GetVarResponse.class)
public class GetVarAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 5239805071977668779L;
    private String channel;
    private String variable;

    /**
     * Creates a new empty GetVarAction.
     */
    public GetVarAction()
    {

    }

    /**
     * Creates a new GetVarAction that queries for the given global variable.
     * 
     * @param variable the name of the global variable to query.
     * @since 0.2
     */
    public GetVarAction(String variable)
    {
        this.variable = variable;
    }

    /**
     * Creates a new GetVarAction that queries for the given local channel
     * variable.
     * 
     * @param channel the name of the channel, for example "SIP/1234-9cd".
     * @param variable the name of the variable to query.
     * @since 0.2
     */
    public GetVarAction(String channel, String variable)
    {
        this.channel = channel;
        this.variable = variable;
    }

    /**
     * Returns the name of this action, i.e. "GetVar".
     */
    @Override
   public String getAction()
    {
        return "GetVar";
    }

    /**
     * Returns the name of the channel if you query for a local channel variable
     * or <code>null</code> if it is a global variable.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel if you query for a local channel variable.
     * Leave empty to query for a global variable.
     * 
     * @param channel the channel if you query for a local channel variable or
     *            <code>null</code> to query for a gloabl variable.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Retruns the name of the variable to query.
     */
    public String getVariable()
    {
        return variable;
    }

    /**
     * Sets the name of the variable to query.
     */
    public void setVariable(String variable)
    {
        this.variable = variable;
    }
}

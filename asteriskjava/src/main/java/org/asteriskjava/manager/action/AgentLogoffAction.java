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
 * The AgentLogoffAction sets an agent as no longer logged in.<p>
 * Available since Asterisk 1.2
 * 
 * @author srt
 * @version $Id: AgentLogoffAction.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class AgentLogoffAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 5239805071977668779L;
    private String agent;
    private Boolean soft;

    /**
     * Creates a new empty AgentLogoffAction.
     */
    public AgentLogoffAction()
    {

    }

    /**
     * Creates a new AgentLogoffAction that logs off the given agent
     * 
     * @param agent the name of the agent to log off.
     */
    public AgentLogoffAction(String agent)
    {
        this.agent = agent;
    }

    /**
     * Creates a new AgentLogoffAction that logs off the given agent
     * 
     * @param agent the name of the agent to log off.
     * @param soft Boolean.TRUE if exisiting calls should not be hung up on
     *            logout.
     */
    public AgentLogoffAction(String agent, Boolean soft)
    {
        this(agent);
        this.soft = soft;
    }

    /**
     * Returns the name of this action, i.e. "AgentLogoff".
     * 
     * @return the name of this action
     */
    @Override
   public String getAction()
    {
        return "AgentLogoff";
    }

    /**
     * Returns the name of the agent to log off, for example "1002".
     * 
     * @return the name of the agent to log off
     */
    public String getAgent()
    {
        return agent;
    }

    /**
     * Sets the name of the agent to log off, for example "1002".<p>
     * This is property is mandatory.
     * 
     * @param agent the name of the agent to log off
     */
    public void setAgent(String agent)
    {
        this.agent = agent;
    }

    /**
     * Returns whether to hangup existing calls or not.<p>
     * Default is to hangup existing calls on logoff.
     * 
     * @return Boolean.TRUE if existing calls should not be hung up,
     *         Boolean.FALSE otherwise. <code>null</code> if default should be
     *         used.
     */
    public Boolean getSoft()
    {
        return soft;
    }

    /**
     * Sets whether existing calls should be hung up or not.<p>
     * Default is to hangup existing calls on logoff.
     * 
     * @param soft Boolean.TRUE if existing calls should not be hung up,
     *            Boolean.FALSE otherwise. <code>null</code> if default should
     *            be used.
     */
    public void setSoft(Boolean soft)
    {
        this.soft = soft;
    }
}

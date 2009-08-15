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

import java.lang.reflect.Method;
import java.util.Date;
import java.util.EventObject;
import java.util.Map;

import org.asteriskjava.util.ReflectionUtil;

/**
 * Abstract base class for all Events that can be received from the Asterisk
 * server.
 * <p/>
 * Events contain data pertaining to an event generated from within the Asterisk
 * core or an extension module.
 * <p/>
 * There is one conrete subclass of ManagerEvent per each supported Asterisk
 * Event.
 *
 * @author srt
 * @version $Id: ManagerEvent.java 1164 2008-09-18 02:40:44Z sprior $
 */
public abstract class ManagerEvent extends EventObject
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 1L;

    /**
     * AMI authorization class.
     */
    private String privilege;

    /**
     * The point in time this event has been received from the Asterisk server.
     */
    private Date dateReceived;

    private Double timestamp;

    /**
     * The server from which this event has been received (only used with AstManProxy).
     */
    private String server;

    public ManagerEvent(Object source)
    {
        super(source);

    }

    /**
     * Returns the point in time this event was received from the Asterisk
     * server.
     * <p/>
     * Pseudo events that are not directly received from the asterisk server
     * (for example ConnectEvent and DisconnectEvent) may return
     * <code>null</code>.
     */
    public Date getDateReceived()
    {
        return dateReceived;
    }

    /**
     * Sets the point in time this event was received from the asterisk server.
     */
    public void setDateReceived(Date dateReceived)
    {
        this.dateReceived = dateReceived;
    }

    /**
     * Returns the AMI authorization class of this event.
     * <p/>
     * This is one or more of system, call, log, verbose, command, agent or
     * user. Multiple privileges are separated by comma.
     * <p/>
     * Note: This property is not available from Asterisk 1.0 servers.
     *
     * @since 0.2
     */
    public String getPrivilege()
    {
        return privilege;
    }

    /**
     * Sets the AMI authorization class of this event.
     *
     * @since 0.2
     */
    public void setPrivilege(String privilege)
    {
        this.privilege = privilege;
    }

    /**
     * Returns the timestamp for this event.
     * <p/>
     * The timestamp property is available in Asterisk since 1.4 if enabled in
     * <code>manager.conf</code> by setting <code>timestampevents = yes</code>.
     * <p/>
     * In contains the time the event was generated in seconds since the epoch.
     * <p/>
     * Example: 1159310429.569108
     *
     * @return the timestamp for this event.
     * @since 0.3
     */
    public final Double getTimestamp()
    {
        return timestamp;
    }

    /**
     * Sets the timestamp for this event.
     *
     * @param timestamp the timestamp to set.
     * @since 0.3
     */
    public final void setTimestamp(Double timestamp)
    {
        this.timestamp = timestamp;
    }

    /**
     * Returns the name of the Asterisk server from which this event has been received.
     * <p/>
     * This property is only available when using to AstManProxy.
     *
     * @return the name of the Asterisk server from which this event has been received
     *         or <code>null</code> when directly connected to an Asterisk server
     *         instead of AstManProxy.
     * @since 1.0.0
     */
    public final String getServer()
    {
        return server;
    }

    /**
     * Sets the name of the Asterisk server from which this event has been received.
     *
     * @param server the name of the Asterisk server from which this event has been received.
     * @since 1.0.0
     */
    public final void setServer(String server)
    {
        this.server = server;
    }

    @Override
    public String toString()
    {
        StringBuffer sb;
        Map<String, Method> getters;

        sb = new StringBuffer(getClass().getName() + "[");
        sb.append("dateReceived=").append(getDateReceived()).append(",");
        if (getPrivilege() != null)
        {
            sb.append("privilege='").append(getPrivilege()).append("',");
        }
        getters = ReflectionUtil.getGetters(getClass());
        for (Map.Entry<String, Method> entry: getters.entrySet())
        {
            final String attribute = entry.getKey();
            if ("class".equals(attribute) || "datereceived".equals(attribute) || "privilege".equals(attribute)
                    || "source".equals(attribute))
            {
                continue;
            }

            try
            {
                final Object value;
                value = entry.getValue().invoke(this);
                sb.append(attribute).append("='").append(value).append("',");
            }
            catch (Exception e) // NOPMD
            {
                // swallow
            }
        }
        sb.append("systemHashcode=").append(System.identityHashCode(this));
        sb.append("]");

        return sb.toString();
    }
}

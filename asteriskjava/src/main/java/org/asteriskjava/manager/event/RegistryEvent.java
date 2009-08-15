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
 * A RegistryEvent is triggered when this asterisk server attempts to register
 * as a client at another SIP or IAX server.<p>
 * This event is implemented in <code>channels/chan_iax2.c</code> and
 * <code>channels/chan_sip.c</code>
 *
 * @author srt
 * @version $Id: RegistryEvent.java 1108 2008-08-16 11:22:50Z srt $
 */
public class RegistryEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    public static final String STATUS_REGISTERED = "Registered";
    public static final String STATUS_UNREGISTERED = "Registered";
    public static final String STATUS_REQUEST_SENT = "Request Sent";
    public static final String STATUS_AUTH_SENT = "Auth. Sent";
    public static final String STATUS_REJECTED = "Rejected";
    public static final String STATUS_TIMEOUT = "Timeout";
    public static final String STATUS_NO_AUTHENTICATION = "No Authentication";
    public static final String STATUS_UNREACHABLE = "Unreachable";

    private String channelType;
    private String domain;
    private String username;
    private String status;
    private String cause;

    /**
     * @param source
     */
    public RegistryEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the type of channel that is registered, that is "IAX2" for an IAX2
     * channel or "SIP" for a SIP channel.
     *
     * @return the type of channel that is registered.
     * @since 1.0.0
     */
    public String getChannelType()
    {
        return channelType;
    }

    /**
     * Sets the type of channel that is registered.
     *
     * @param channelType the type of channel that is registered.
     * @since 1.0.0
     */
    public void setChannelType(String channelType)
    {
        this.channelType = channelType;
    }

    /**
     * Returns the type of channel that is registered, that is "IAX2" for an IAX2
     * channel or "SIP" for a SIP channel.
     *
     * @see #getChannelType()
     * @since 0.3
     * @deprecated
     */
    public String getChannelDriver()
    {
        return channelType;
    }

    /**
     * Sets the type of channel that is registered.
     *
     * @see #setChannelType(String)
     * @since 0.3
     * @deprecated
     */
    public void setChannelDriver(String channelDriver)
    {
        this.channelType = channelDriver;
    }

    /**
     * Returns the type of channel that is registered, that is "IAX2" for an IAX2
     * channel or "SIP" for a SIP channel.
     *
     * @see #getChannelType()
     * @deprecated
     */
    public String getChannel()
    {
        return channelType;
    }

    /**
     * Sets the type of channel that is registered.
     *
     * @see #setChannelType(String)
     * @deprecated
     */
    public void setChannel(String channel)
    {
        this.channelType = channel;
    }

    /**
     * Returns the domain or host name of the SIP or IAX2 server.<p>
     * This is the host part used in the <code>register</code> lines in
     * <code>iax.conf</code> and <code>sip.conf</code>.
     *
     * @return the domain or host name of the SIP or IAX2 server.
     */
    public String getDomain()
    {
        return domain;
    }

    /**
     * Sets the domain or host name of the SIP or IAX2 server.
     *
     * @param domain the domain or host name of the SIP or IAX2 server.
     */
    public void setDomain(String domain)
    {
        this.domain = domain;
    }

    /**
     * Returns the username used for registration.<p>
     * SIP send the username in case of a registration timeout, IAX2 in case of
     * a registration failure. Otherwise the username is <code>null</code>.
     *
     * @return the username used for registration.
     */
    public String getUsername()
    {
        return username;
    }

    /**
     * Sets the username used for registration.
     *
     * @param username the username used for registration.
     */
    public void setUsername(String username)
    {
        this.username = username;
    }

    /**
     * Sets the username used for registration.
     *
     * @see #setUsername(String)
     * @deprecated Please do not use this method it is a workaround for Asterisk
     *             1.0.x servers. See Asterisk bug 4916.
     */
    public void setUser(String username)
    {
        this.username = username;
    }

    /**
     * Returns the registration state.<p>
     * For sip this may be one of (not sure if all of these are exposed via the
     * manager api, at least "Registered" and "Timeout" are used though)
     * <ul>
     * <li>Registered</li>
     * <li>Unregistered</li>
     * <li>Request Sent</li>
     * <li>Auth. Sent</li>
     * <li>Rejected</li>
     * <li>Timeout</li>
     * <li>No Authentication</li>
     * <li>Unreachable</li>
     * </ul>
     * IAX2 only uses
     * <ul>
     * <li>Rejected</li>
     * </ul>
     * Successful IAX2 registrations do not use the this property at all.
     *
     * @return the registration state.
     */
    public String getStatus()
    {
        return status;
    }

    /**
     * Sets the registration state.
     *
     * @param status the registration state.
     */
    public void setStatus(String status)
    {
        this.status = status;
    }

    /**
     * Returns the cause of a rejected registration.
     *
     * @return the cause of a rejected registration or <code>null</code> if the cause is unknown.
     * @since 0.2
     */
    public String getCause()
    {
        return cause;
    }

    /**
     * Sets the cause of a rejected registration.
     *
     * @param cause the cause of a rejected registration.
     * @since 0.2
     */
    public void setCause(String cause)
    {
        this.cause = cause;
    }

}

/*
 *  Copyright 2004-2008 Stefan Reuter
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
 * A RegistryEntry is triggered in response to a SipShowRegistryAction and contains
 * information about a SIP registration.<p>
 * It is implemented in <code>channels/chan_sip.c</code>
 *
 * @author Laureano
 * @version $Id: RegistryEntryEvent.java 1166 2008-09-18 02:41:44Z sprior $
 * @since 1.0.0
 */
public class RegistryEntryEvent extends ResponseEvent
{
    /**
    * 
    */
   private static final long serialVersionUID = -7158046719541054868L;
   private Integer port;
    private String username;
    private String state;
    private Integer refresh;
    private String host;
    private Long registrationTime;

    /**
     * Creates a new instance.
     *
     * @param source
     */
    public RegistryEntryEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the epoch since the last registration.
     *
     * @return epoch since the last registration.
     */
    public Long getRegistrationTime()
    {
        return registrationTime;
    }

    /**
     * Sets the epoch (unix Timestamp) of the last registration.
     * Will be casted to Long.
     *
     * @param registrationTime the epoch of the last registration.
     */
    public void setRegistrationTime(String registrationTime)
    {
        this.registrationTime = Long.valueOf(registrationTime);
    }

    /**
     * Returns the port number used for the registration.
     *
     * @return the port number.
     */
    public Integer getPort()
    {
        return port;
    }

    /**
     * Sets the port number used for the registration.
     *
     * @param port the port number.
     */
    public void setPort(Integer port)
    {
        this.port = port;
    }

    /**
     * Returns the username used for the registration.
     *
     * @return the username.
     */
    public String getUsername()
    {
        return username;
    }

    /**
     * Sets the username used for the registration.
     *
     * @param username the username.
     */
    public void setUsername(String username)
    {
        this.username = username;
    }

    /**
     * Returns the IP address or hostname used for the registration.
     *
     * @return the IP address or the hostname.
     */
    public String getHost()
    {
        return host;
    }

    /**
     * Set the IP address or hostname used for the registration.
     *
     * @param host IP address or hostname.
     */
    public void setHost(String host)
    {
        this.host = host;
    }

    /**
     * Returns the value of state.
     *
     * @return the value of state
     */
    public String getState()
    {
        return state;
    }

    /**
     * Set the value of state.
     *
     * @param state new value of state
     */
    public void setState(String state)
    {
        this.state = state;
    }

    /**
     * Returns the value of refresh.
     *
     * @return the value of refresh.
     */
    public Integer getRefresh()
    {
        return refresh;
    }

    /**
     * Set the value of refresh.
     *
     * @param refresh new value of refresh
     */
    public void setRefresh(Integer refresh)
    {
        this.refresh = refresh;
    }
}

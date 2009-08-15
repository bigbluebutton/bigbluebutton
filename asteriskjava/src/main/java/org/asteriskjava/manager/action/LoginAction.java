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
 * The LoginAction authenticates the connection.<p>
 * A successful login is the precondition for sending any other action except
 * for the ChallengeAction.<p>
 * An unsuccessful login results in an ManagerError being received from the
 * server with a message set to "Authentication failed" and the socket being
 * closed by Asterisk.
 * 
 * @see org.asteriskjava.manager.action.ChallengeAction
 * @see org.asteriskjava.manager.response.ManagerError
 * @author srt
 * @version $Id: LoginAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class LoginAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = -2600694249339115032L;

    private String username;
    private String secret;
    private String authType;
    private String key;
    private String events;

    /**
     * Creates a new empty LoginAction.
     */
    public LoginAction()
    {
        
    }
    
    /**
     * Creates a new LoginAction that performs a cleartext login.<p>
     * You should not use cleartext login if you are concerned about security,
     * using {@see ChallengeAction} and login with a password hash instead.
     * 
     * @param username the username as configured in Asterisk's
     *            <code>manager.conf</code>
     * @param secret the user's password as configured in Asterisk's
     *            <code>manager.conf</code>
     * @since 0.2
     */
    public LoginAction(String username, String secret)
    {
        this.username = username;
        this.secret = secret;
    }

    /**
     * Creates a new LoginAction that performs a login via challenge/response.
     * 
     * @param username the username as configured in Asterisk's
     *            <code>manager.conf</code>
     * @param authType the digest alogrithm, must match the digest algorithm
     *            that was used with the corresponding ChallengeAction.
     * @param key the hash of the user's password and the challenge
     * @since 0.2
     */
    public LoginAction(String username, String authType, String key)
    {
        this.username = username;
        this.authType = authType;
        this.key = key;
    }

    /**
     * Creates a new LoginAction that performs a login via challenge/response.
     * 
     * @param username the username as configured in Asterisk's
     *            <code>manager.conf</code>
     * @param authType the digest alogrithm, must match the digest algorithm
     *            that was used with the corresponding ChallengeAction.
     * @param key the hash of the user's password and the challenge
     * @param events the event mask. Set to "on" if all events should be send,
     *            "off" if not events should be sent or a combination of
     *            "system", "call" and "log" (separated by ',') to specify what
     *            kind of events should be sent.
     * @since 0.2
     */
    public LoginAction(String username, String authType, String key,
            String events)
    {
        this.username = username;
        this.authType = authType;
        this.key = key;
        this.events = events;
    }

    /**
     * Returns the name of this action, i.e. "Login".
     */
    @Override
   public String getAction()
    {
        return "Login";
    }

    /**
     * Returns the username.
     */
    public String getUsername()
    {
        return username;
    }

    /**
     * Sets the username as configured in asterik's <code>manager.conf</code>.
     */
    public void setUsername(String username)
    {
        this.username = username;
    }

    /**
     * Returns the secret.
     */
    public String getSecret()
    {
        return secret;
    }

    /**
     * Sets the secret to use when using cleartext login.<p>
     * The secret contains the user's password as configured in Asterisk's
     * <code>manager.conf</code>.<p>
     * The secret and key properties are mutually exclusive.
     */
    public void setSecret(String secret)
    {
        this.secret = secret;
    }

    /**
     * Returns the digest alogrithm when using challenge/response.
     */
    public String getAuthType()
    {
        return authType;
    }

    /**
     * Sets the digest alogrithm when using challenge/response.<p>
     * The digest algorithm is used to create the key based on the challenge and
     * the user's password.<p>
     * Currently Asterisk supports only "MD5".
     */
    public void setAuthType(String authType)
    {
        this.authType = authType;
    }

    /**
     * @return Returns the key.
     */
    public String getKey()
    {
        return key;
    }

    /**
     * @param key The key to set.
     */
    public void setKey(String key)
    {
        this.key = key;
    }

    /**
     * Returns the event mask.
     * 
     * @return the event mask.
     */
    public String getEvents()
    {
        return events;
    }

    /**
     * Sets the event mask.
     * 
     * @param events the event mask. Set to "on" if all events should be send,
     *            "off" if not events should be sent or a combination of
     *            "system", "call" and "log" (separated by ',') to specify what
     *            kind of events should be sent.
     */
    public void setEvents(String events)
    {
        this.events = events;
    }
}

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
 * The JabberSendAction sends a Jabber (XMPP) message to a recipient.<p>
 * Available since Asterisk 1.6.0
 *
 * @author srt
 * @version $Id: JabberSendAction.java 1131 2008-08-18 12:41:36Z srt $
 * @since 1.0.0
 */
public class JabberSendAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 1L;

    private String jabber;
    private String screenName;
    private String message;

    /**
     * Creates a new JabberSendAction.
     */
    public JabberSendAction()
    {
        super();
    }

    /**
     * Creates a new JabberSendAction.
     *
     * @param jabber     the client or transport Asterisk uses to connect to Jabber.
     * @param screenName the JID of the recipient.
     * @param message    the message to send to the recipient.
     */
    public JabberSendAction(String jabber, String screenName, String message)
    {
        this.jabber = jabber;
        this.screenName = screenName;
        this.message = message;
    }

    /**
     * Returns the name of this action, i.e. "Ping".
     */
    @Override
    public String getAction()
    {
        return "JabberSend";
    }

    public String getJabber()
    {
        return jabber;
    }

    /**
     * Sets the client or transport Asterisk uses to connect to Jabber.
     *
     * @param jabber the client or transport Asterisk uses to connect to Jabber.
     */
    public void setJabber(String jabber)
    {
        this.jabber = jabber;
    }

    public String getScreenName()
    {
        return screenName;
    }

    /**
     * Sets the JID of the recipient.
     *
     * @param screenName the JID of the recipient.
     */
    public void setScreenName(String screenName)
    {
        this.screenName = screenName;
    }

    public String getMessage()
    {
        return message;
    }

    /**
     * Sets the message to send to the recipient.
     *
     * @param message the message to send to the recipient.
     */
    public void setMessage(String message)
    {
        this.message = message;
    }
}
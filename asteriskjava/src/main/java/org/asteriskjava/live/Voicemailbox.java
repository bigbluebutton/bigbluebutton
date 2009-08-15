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
package org.asteriskjava.live;

import java.io.Serializable;

/**
 * An Asterisk voicemailbox with status.
 * 
 * @author srt
 * @version $Id: Voicemailbox.java 961 2008-02-03 02:53:56Z srt $
 * @since 0.3
 */
public class Voicemailbox implements Serializable
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 2750652515961182547L;
    private final String mailbox;
    private final String context;
    private final String user;
    private int newMessages;
    private int oldMessages;

    /**
     * Creates a new instance.
     * 
     * @param mailbox the name of this mailbox as defined in <code>voicemail.conf</code>.
     * @param context the context of this mailbox as defined in <code>voicemail.conf</code>.
     * @param user the user of this mailbox as defined in <code>voicemail.conf</code>.
     */
    public Voicemailbox(String mailbox, String context, String user)
    {
        this.mailbox = mailbox;
        this.context = context;
        this.user = user;
    }

    /**
     * Returns the name of this mailbox as defined in <code>voicemail.conf</code>.
     * 
     * @return the name of this mailbox as defined in <code>voicemail.conf</code>.
     */
    public String getMailbox()
    {
        return mailbox;
    }

    /**
     * Returns the context of this mailbox as defined in <code>voicemail.conf</code>.
     * 
     * @return the context of this mailbox as defined in <code>voicemail.conf</code>.
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Returns the user (usually the full name) of this mailbox as defined in <code>voicemail.conf</code>.
     * 
     * @return the user of this mailbox as defined in <code>voicemail.conf</code>.
     */
    public String getUser()
    {
        return user;
    }

    /**
     * Returns the number of new messages.
     * 
     * @return the number of new messages.
     */
    public int getNewMessages()
    {
        return newMessages;
    }

    /**
     * Sets the number of new messages.
     * 
     * @param newMessages the number of new messages.
     */
    public void setNewMessages(int newMessages)
    {
        this.newMessages = newMessages;
    }

    /**
     * Returns the number of old messages.
     * 
     * @return the number of old messages.
     */
    public int getOldMessages()
    {
        return oldMessages;
    }

    /**
     * Sets the number of old messages.
     * 
     * @param oldMessages the number of old messages.
     */
    public void setOldMessages(int oldMessages)
    {
        this.oldMessages = oldMessages;
    }

    @Override
   public String toString()
    {
        StringBuffer sb;

        sb = new StringBuffer(100);
        sb.append("Voicemailbox[");
        sb.append("mailbox='").append(getMailbox()).append("',");
        sb.append("context='").append(getContext()).append("',");
        sb.append("user='").append(getUser()).append("',");
        sb.append("newMessages=").append(getNewMessages()).append(",");
        sb.append("oldMessages=").append(getOldMessages()).append("]");

        return sb.toString();
    }
}

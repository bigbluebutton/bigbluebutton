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
package org.asteriskjava.manager.response;

/**
 * A MailboxCountResponse is sent in response to a MailboxCountAction and contains the number of old
 * and new messages in a mailbox.
 * 
 * @see org.asteriskjava.manager.action.MailboxCountAction
 * 
 * @author srt
 * @version $Id: MailboxCountResponse.java 938 2007-12-31 03:23:38Z srt $
 */
public class MailboxCountResponse extends ManagerResponse
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = 7820598941277275838L;
    private String mailbox;
    private Integer newMessages;
    private Integer oldMessages;

    /**
     * Returns the name of the mailbox.
     */
    public String getMailbox()
    {
        return mailbox;
    }

    /**
     * Sets the name of the mailbox.
     */
    public void setMailbox(String mailbox)
    {
        this.mailbox = mailbox;
    }

    /**
     * Returns the number of new messages in the mailbox.
     */
    public Integer getNewMessages()
    {
        return newMessages;
    }

    /**
     * Sets the number of new messages in the mailbox.
     */
    public void setNewMessages(Integer newMessages)
    {
        this.newMessages = newMessages;
    }

    /**
     * Returns the number of old messages in the mailbox.
     */
    public Integer getOldMessages()
    {
        return oldMessages;
    }

    /**
     * Sets the number of old messages in the mailbox.
     */
    public void setOldMessages(Integer oldMessages)
    {
        this.oldMessages = oldMessages;
    }
}

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
 * A MailboxStatusResponse is sent in response to a MailboxStatusAction and indicates if a set
 * of mailboxes contains waiting messages.
 * 
 * @see org.asteriskjava.manager.action.MailboxStatusAction
 * 
 * @author srt
 * @version $Id: MailboxStatusResponse.java 938 2007-12-31 03:23:38Z srt $
 */
public class MailboxStatusResponse extends ManagerResponse
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = -7193581424292429279L;
    
    /**
     * The name of the mailbox.
     */
    private String mailbox;
    
    /**
     * Indicates if there are new messages waiting in the given set of mailboxes.
     */
    private Boolean waiting;

    /**
     * Returns the names of the mailboxes, separated by ",".
     * @return the names of the mailbox.
     */
    public String getMailbox()
    {
        return mailbox;
    }

    /**
     * Sets the names of the mailboxes.
     * @param mailbox the names of the mailboxes.
     */
    public void setMailbox(String mailbox)
    {
        this.mailbox = mailbox;
    }

    /**
     * Returns Boolean.TRUE if at least one of the given mailboxes contains new messages;
     * Boolean.FALSE otherwise.
     */
    public Boolean getWaiting()
    {
        return waiting;
    }

    /**
     * Set to Boolean.TRUE if at least one of the mailboxes contains new messages;
     * Boolean.FALSE otherwise.
     */
    public void setWaiting(Boolean waiting)
    {
        this.waiting = waiting;
    }
}

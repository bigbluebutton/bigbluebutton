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
 * A MessageWaitingEvent is triggered when someone leaves voicemail.<p>
 * It is implemented in <code>apps/app_voicemail.c</code>
 * 
 * @author srt
 * @version $Id: MessageWaitingEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class MessageWaitingEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 7014587245968686266L;
    private String mailbox;
    private Integer waiting;
    private Integer newMessages;
    private Integer oldMessages;

    /**
     * @param source
     */
    public MessageWaitingEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the mailbox that has waiting messages.<p>
     * The name of the mailbox is of the form numberOfMailbox@context, e.g.
     * 1234@default.
     * 
     * @return the name of the mailbox that has waiting messages
     */
    public String getMailbox()
    {
        return mailbox;
    }

    /**
     * Sets the name of the mailbox that has waiting messages.
     * 
     * @param mailbox the name of the mailbox that has waiting messages
     */
    public void setMailbox(String mailbox)
    {
        this.mailbox = mailbox;
    }

    /**
     * Returns the number of new messages in the mailbox.
     * 
     * @return the number of new messages in the mailbox
     */
    public Integer getWaiting()
    {
        return waiting;
    }

    /**
     * Sets the number of new messages in the mailbox.
     * 
     * @param waiting the number of new messages in the mailbox
     */
    public void setWaiting(Integer waiting)
    {
        this.waiting = waiting;
    }

    /**
     * Returns the number of new messages in this mailbox.
     * @return the number of new messages in this mailbox.
     * @since 0.2
     */
    public Integer getNew()
    {
        return newMessages;
    }

    /**
     * Sets the number of new messages in this mailbox.
     * @param newMessages the number of new messages in this mailbox.
     * @since 0.2
     */
    public void setNew(Integer newMessages)
    {
        this.newMessages = newMessages;
    }

    /**
     * Returns the number of old messages in this mailbox.
     * @return the number of old messages in this mailbox.
     * @since 0.2
     */
    public Integer getOld()
    {
        return oldMessages;
    }

    /**
     * Sets the number of old messages in this mailbox.
     * @param oldMessages the number of old messages in this mailbox.
     * @since 0.2
     */
    public void setOld(Integer oldMessages)
    {
        this.oldMessages = oldMessages;
    }
}

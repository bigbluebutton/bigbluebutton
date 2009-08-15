/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Apr 22, 2004
 */
package org.asteriskjava.manager.action;

import org.asteriskjava.manager.ExpectedResponse;
import org.asteriskjava.manager.response.MailboxCountResponse;

/**
 * The MailboxCountAction queries the number of unread and read messages in a
 * mailbox.<p>
 * The MailboxCountAction returns a MailboxStatusResponse.
 *
 * @author srt
 * @version $Id: MailboxCountAction.java 1124 2008-08-18 03:25:01Z srt $
 * @see org.asteriskjava.manager.response.MailboxCountResponse
 */
@ExpectedResponse(MailboxCountResponse.class)
public class MailboxCountAction extends AbstractManagerAction
{
    static final long serialVersionUID = -6900421919824575941L;

    private String mailbox;

    /**
     * Creates a new empty MailboxCountAction.
     */
    public MailboxCountAction()
    {

    }

    /**
     * Creates a new MailboxCountAction that queries the number of unread and
     * read messages in the given mailbox.
     *
     * @param mailbox the name of the mailbox to query.<p>
     *                This can either be only the number of the mailbox or a string
     *                of the form mailboxnumber@context. If no context is specified
     *                "default" is assumed.
     * @since 0.2
     */
    public MailboxCountAction(String mailbox)
    {
        this.mailbox = mailbox;
    }

    /**
     * Returns the name of this action, i.e. "MailboxCount".
     */
    @Override
    public String getAction()
    {
        return "MailboxCount";
    }

    /**
     * Returns the name of the mailbox to query.
     */
    public String getMailbox()
    {
        return mailbox;
    }

    /**
     * Sets the name of the mailbox to query.<p>
     * This can either be only the number of the mailbox or a string of the form
     * mailboxnumber@context.If no context is specified "default" is assumed.<p>
     * This property is mandatory.
     */
    public void setMailbox(String mailbox)
    {
        this.mailbox = mailbox;
    }
}

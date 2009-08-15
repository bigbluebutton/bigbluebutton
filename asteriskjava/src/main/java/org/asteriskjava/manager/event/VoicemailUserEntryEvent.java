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
 * A VoicemailUserEntryCompleteEvent is triggered in response to a VoicemailUsersListAction
 * and contains the details about a voicemail user.<p>
 * It is implemented in <code>apps/app_voicemail.c</code>
 * <p/>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: VoicemailUserEntryEvent.java 948 2008-01-30 03:09:42Z srt $
 * @see org.asteriskjava.manager.event.VoicemailUserEntryCompleteEvent
 * @see org.asteriskjava.manager.action.VoicemailUsersListAction
 * @since 1.0.0
 */
public class VoicemailUserEntryEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;
    private String vmContext;
    private String voicemailbox;
    private String fullname;
    private String email;
    private String pager;
    private String serverEmail;
    private String mailCommand;
    private String language;
    private String timezone;
    private String callback;
    private String dialout;
    private String uniqueId; // only for realtime?
    private String exitContext;
    private Integer sayDurationMinimum;
    private Boolean sayEnvelope;
    private Boolean sayCid;
    private Boolean attachMessage;
    private String attachmentFormat;
    private Boolean deleteMessage;
    private Double volumeGain;
    private Boolean canReview;
    private Boolean callOperator;
    private Integer maxMessageCount;
    private Integer maxMessageLength;
    private Integer newMessageCount;

    // only if compiled with imap storage
    private Integer oldMessageCount;
    private String imapUser;

    /**
     * Creates a new instance.
     *
     * @param source
     */
    public VoicemailUserEntryEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the voicemail context.
     *
     * @return the voicemail context.
     */
    public String getVmContext()
    {
        return vmContext;
    }

    /**
     * Sets the voicemail context.
     *
     * @param vmContext the voicemail context.
     */
    public void setVmContext(String vmContext)
    {
        this.vmContext = vmContext;
    }

    /**
     * Returns the mailbox id. The mailbox is unique within the voicemail context.
     *
     * @return the mailbox id.
     */
    public String getVoicemailbox()
    {
        return voicemailbox;
    }

    /**
     * Sets the mailbox id.
     *
     * @param voicemailbox the mailbox id.
     */
    public void setVoicemailbox(String voicemailbox)
    {
        this.voicemailbox = voicemailbox;
    }

    /**
     * Returns the full name of the voicemail user that is used for the directory application.
     *
     * @return the full name of the voicemail user.
     */
    public String getFullname()
    {
        return fullname;
    }

    /**
     * Sets the full name of the voicemail user.
     *
     * @param fullname the full name of the voicemail user.
     */
    public void setFullname(String fullname)
    {
        this.fullname = fullname;
    }

    /**
     * Returns the email address of the voicemail user.
     *
     * @return the email address of the voicemail user.
     */
    public String getEmail()
    {
        return email;
    }

    /**
     * Sets the email address of the voicemail user.
     *
     * @param email the email address of the voicemail user.
     */
    public void setEmail(String email)
    {
        this.email = email;
    }

    /**
     * Returns the email adress of pager of the voicemail user.
     * This email will not receive attachments.
     *
     * @return the email adress of pager of the voicemail user.
     */
    public String getPager()
    {
        return pager;
    }

    /**
     * Sets the email adress of pager of the voicemail user.
     *
     * @param pager the email adress of pager of the voicemail user.
     */
    public void setPager(String pager)
    {
        this.pager = pager;
    }

    /**
     * Returns the email address used for the "from" header when sending notification emails.
     *
     * @return the email address used for the "from" header when sending notification emails.
     */
    public String getServerEmail()
    {
        return serverEmail;
    }

    /**
     * Sets the email address used for the "from" header when sending notification emails.
     *
     * @param serverEmail the email address used for the "from" header when sending notification emails.
     */
    public void setServerEmail(String serverEmail)
    {
        this.serverEmail = serverEmail;
    }

    /**
     * Returns the custom mail command used to send notifications to the voicemail user.
     *
     * @return the custom mail command used to send notifications to the voicemail user.
     */
    public String getMailCommand()
    {
        return mailCommand;
    }

    /**
     * Sets the custom mail command used to send notifications to the voicemail user.
     *
     * @param mailCommand the custom mail command used to send notifications to the voicemail user.
     */
    public void setMailCommand(String mailCommand)
    {
        this.mailCommand = mailCommand;
    }

    public String getLanguage()
    {
        return language;
    }

    public void setLanguage(String language)
    {
        this.language = language;
    }

    public String getTimezone()
    {
        return timezone;
    }

    public void setTimezone(String timezone)
    {
        this.timezone = timezone;
    }

    /**
     * Returns the dialplan context used by the "return phone call" feature in the advanced
     * voicemail features menu.
     *
     * @return the dialplan context used by the "return phone call" feature in the advanced
     *         voicemail features menu.
     */
    public String getCallback()
    {
        return callback;
    }

    /**
     * Sets the dialplan context used by the "return phone call" feature in the advanced
     * voicemail features menu.
     *
     * @param callback the dialplan context used by the "return phone call" feature in the advanced
     *                 voicemail features menu.
     */
    public void setCallback(String callback)
    {
        this.callback = callback;
    }

    /**
     * Returns the dialplan context used by the "place an outgoing call" feature in the advanced
     * voicemail features menu.
     *
     * @return the dialplan context used by the "place an outgoing call" feature in the advanced
     *         voicemail features menu.
     */
    public String getDialout()
    {
        return dialout;
    }

    /**
     * Sets the dialplan context used by the "place an outgoing call" feature in the advanced
     * voicemail features menu.
     *
     * @param dialout the dialplan context used by the "place an outgoing call" feature in the advanced
     *                voicemail features menu.
     */
    public void setDialout(String dialout)
    {
        this.dialout = dialout;
    }

    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the dialplan context the user is dropped into after he has pressed * or 0 to exit voicemail.
     *
     * @return the dialplan context the user is dropped into after he has pressed * or 0 to exit voicemail.
     */
    public String getExitContext()
    {
        return exitContext;
    }

    /**
     * Sets the dialplan context the user is dropped into after he has pressed * or 0 to exit voicemail.
     *
     * @param exitContext the dialplan context the user is dropped into after he has pressed * or 0 to exit voicemail.
     */
    public void setExitContext(String exitContext)
    {
        this.exitContext = exitContext;
    }

    public Integer getSayDurationMinimum()
    {
        return sayDurationMinimum;
    }

    public void setSayDurationMinimum(Integer sayDurationMinimum)
    {
        this.sayDurationMinimum = sayDurationMinimum;
    }

    public Boolean getSayEnvelope()
    {
        return sayEnvelope;
    }

    public void setSayEnvelope(Boolean sayEnvelope)
    {
        this.sayEnvelope = sayEnvelope;
    }

    public Boolean getSayCid()
    {
        return sayCid;
    }

    public void setSayCid(Boolean sayCid)
    {
        this.sayCid = sayCid;
    }

    /**
     * Returns whether Asterisk copies a voicemail message to an audio file and sends it to the user as an
     * attachment in an eemail voicemail notification message.
     *
     * @return Booelan.TRUE if message will be attached, Boolean.FALSE if not, <code>null</code> if unset.
     */
    public Boolean getAttachMessage()
    {
        return attachMessage;
    }

    /**
     * Sets whether Asterisk copies a voicemail message to an audio file and sends it to the user as an
     * attachment in an eemail voicemail notification message.
     *
     * @param attachMessage Booelan.TRUE if message will be attached, Boolean.FALSE if not, <code>null</code> if unset.
     */
    public void setAttachMessage(Boolean attachMessage)
    {
        this.attachMessage = attachMessage;
    }

    public String getAttachmentFormat()
    {
        return attachmentFormat;
    }

    public void setAttachmentFormat(String attachmentFormat)
    {
        this.attachmentFormat = attachmentFormat;
    }

    /**
     * Returns whether messages will be deleted from the voicemailbox (after having been emailed).
     *
     * @return Booelan.TRUE if messages will be deleted from the voicemailbox, Boolean.FALSE if not,
     *         <code>null</code> if unset.
     */
    public Boolean getDeleteMessage()
    {
        return deleteMessage;
    }

    /**
     * Sets whether messages will be deleted from the voicemailbox (after having been emailed).
     *
     * @param deleteMessage Booelan.TRUE if messages will be deleted from the voicemailbox, Boolean.FALSE if not.
     */
    public void setDeleteMessage(Boolean deleteMessage)
    {
        this.deleteMessage = deleteMessage;
    }

    /**
     * Returns the volume gain used for voicemails sent via email.
     *
     * @return the volume gain used for voicemails sent via email.
     */
    public Double getVolumeGain()
    {
        return volumeGain;
    }

    /**
     * Sets the volume gain used for voicemails sent via email.
     *
     * @param volumeGain the volume gain used for voicemails sent via email.
     */
    public void setVolumeGain(Double volumeGain)
    {
        this.volumeGain = volumeGain;
    }

    public Boolean getCanReview()
    {
        return canReview;
    }

    public void setCanReview(Boolean canReview)
    {
        this.canReview = canReview;
    }

    public Boolean getCallOperator()
    {
        return callOperator;
    }

    public void setCallOperator(Boolean callOperator)
    {
        this.callOperator = callOperator;
    }

    /**
     * Returns the maximum number of messages per folder. 0 indicated unlimited.
     *
     * @return the maximum number of messages per folder or 0 for unlimited.
     */
    public Integer getMaxMessageCount()
    {
        return maxMessageCount;
    }

    /**
     * Sets the maximum number of messages per folder.
     *
     * @param maxMessageCount the maximum number of messages per folder.
     */
    public void setMaxMessageCount(Integer maxMessageCount)
    {
        this.maxMessageCount = maxMessageCount;
    }

    /**
     * Returns the maximum duration per message for voicemails in this mailbox.
     *
     * @return the maximum duration in seconds.
     */
    public Integer getMaxMessageLength()
    {
        return maxMessageLength;
    }

    /**
     * Returns the maximum duration per message for voicemails in this mailbox.
     *
     * @param maxMessageLength the maximum duration in seconds.
     */
    public void setMaxMessageLength(Integer maxMessageLength)
    {
        this.maxMessageLength = maxMessageLength;
    }

    public Integer getNewMessageCount()
    {
        return newMessageCount;
    }

    public void setNewMessageCount(Integer newMessageCount)
    {
        this.newMessageCount = newMessageCount;
    }

    /**
     * Returns the number of old ("read" or listened to) messages for this voicemail user.<p>
     * This property is only available if the IMAP storage backend is used.
     *
     * @return the number of old messages for this voicemail user.
     */
    public Integer getOldMessageCount()
    {
        return oldMessageCount;
    }

    /**
     * Sets the number of old messages for this voicemail user.
     *
     * @param oldMessageCount the number of old messages for this voicemail user.
     */
    public void setOldMessageCount(Integer oldMessageCount)
    {
        this.oldMessageCount = oldMessageCount;
    }

    /**
     * Returns the username of the IMAP account associated with this mailbox.<p>
     * This property is only available if the IMAP storage backend is used.
     *
     * @return the username of the IMAP account associated with this mailbox.
     */
    public String getImapUser()
    {
        return imapUser;
    }

    /**
     * Sets the username of the IMAP account associated with this mailbox.
     *
     * @param imapUser the username of the IMAP account associated with this mailbox.
     */
    public void setImapUser(String imapUser)
    {
        this.imapUser = imapUser;
    }
}
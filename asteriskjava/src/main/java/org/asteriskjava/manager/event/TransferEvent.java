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
 * A TransferEvent is triggered when a SIP channel is transfered.<p>
 * It is implemented in <code>channels/chan_sip.c</code>.<p>
 * Available since Asterisk 1.6 for SIP channels.
 *
 * @author srt
 * @version $Id: TransferEvent.java 1117 2008-08-16 16:43:57Z srt $
 * @since 1.0.0
 */
public class TransferEvent extends ManagerEvent
{
    private static final long serialVersionUID = 1L;

    public static final String TRANSFER_METHOD_SIP = "SIP";

    public static final String TRANSFER_TYPE_ATTENDED = "Attended";
    public static final String TRANSFER_TYPE_BLIND = "Blind";

    private String channel;
    private String uniqueId;
    private String transferMethod;
    private String transferType;
    private String sipCallId;
    private String targetChannel;
    private String targetUniqueId;
    private String transferExten;
    private String transferContext;
    private Boolean transfer2Parking;

    public TransferEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the transfering channel.
     *
     * @return channel the name of the transfering channel.
     */
    public String getChannel()
    {
        return channel;
    }

    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the unique id of the transfering channel.
     *
     * @return the unique id of the transfering channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the transfer method. Currently this is always "SIP".
     *
     * @return the transfer method ("SIP").
     */
    public String getTransferMethod()
    {
        return transferMethod;
    }

    public void setTransferMethod(String transferMethod)
    {
        this.transferMethod = transferMethod;
    }

    /**
     * Returns whether this is an attended or a blind transfer. Possible values are
     * "Attended" and "Blind".
     *
     * @return "Attended" if this an attended transfer, "Blind" if it is a blind transfer.
     * @see #TRANSFER_TYPE_ATTENDED
     * @see #TRANSFER_TYPE_BLIND
     */
    public String getTransferType()
    {
        return transferType;
    }

    /**
     * Checks whether this is an attended transfer or not.
     *
     * @return <code>true</code> if this is an attended transfer, <code>false</code> if not.
     */
    public boolean isAttended()
    {
        return TRANSFER_TYPE_ATTENDED.equals(transferType);
    }

    /**
     * Checks whether this is a blind transfer or not.
     *
     * @return <code>true</code> if this is an blind transfer, <code>false</code> if not.
     */
    public boolean isBlind()
    {
        return TRANSFER_TYPE_BLIND.equals(transferType);
    }

    public void setTransferType(String transferType)
    {
        this.transferType = transferType;
    }

    /**
     * Returns the SIP call id.
     *
     * @return the SIP call id.
     */
    public String getSipCallId()
    {
        return sipCallId;
    }

    public void setSipCallId(String sipCallId)
    {
        this.sipCallId = sipCallId;
    }

    /**
     * Returns the name of the target channel.
     *
     * @return the name of the target channel.
     */
    public String getTargetChannel()
    {
        return targetChannel;
    }

    public void setTargetChannel(String targetChannel)
    {
        this.targetChannel = targetChannel;
    }

    /**
     * Returns the unique id of the target channel.
     *
     * @return the unique id of the target channel.
     */
    public String getTargetUniqueId()
    {
        return targetUniqueId;
    }

    public void setTargetUniqueId(String targetUniqueId)
    {
        this.targetUniqueId = targetUniqueId;
    }

    /**
     * Returns the target extension the call is transfered to. This is only available for
     * blind transfers. If the call is transfered to a parking extension, the parking extension
     * is returned.
     *
     * @return the target extension the call is transfered to or <code>null</code> for attended
     *         transfers.
     */
    public String getTransferExten()
    {
        return transferExten;
    }

    public void setTransferExten(String transferExten)
    {
        this.transferExten = transferExten;
    }

    /**
     * Returns the target context (in the dialplan) the call is transfered to. This is only available for
     * blind transfers. If the call is transfered to a parking extension <code>null</code> is returned.
     *
     * @return the target context the call is transfered to or <code>null</code> for attended
     *         transfers and transfers to a parking extension.
     */
    public String getTransferContext()
    {
        return transferContext;
    }

    public void setTransferContext(String transferContext)
    {
        this.transferContext = transferContext;
    }

    /**
     * Returns whether this is a transfer to a parking extension.
     *
     * @return Boolean.TRUE if this is a transfer to a parking extension, <code>null</code> otherwise.
     */
    public Boolean getTransfer2Parking()
    {
        return transfer2Parking;
    }

    public void setTransfer2Parking(Boolean transfer2Parking)
    {
        this.transfer2Parking = transfer2Parking;
    }

    /**
     * Convenience method to check if this is a transfer to a parking extension.
     *
     * @return <code>true</code> if this is a transfer to a parking extension, <code>false</code> otherwise.
     */
    public boolean isParking()
    {
        return transfer2Parking != null && transfer2Parking;
    }
}
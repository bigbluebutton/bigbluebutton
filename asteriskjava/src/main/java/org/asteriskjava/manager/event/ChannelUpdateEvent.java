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
 * A ChannelUpdateEvent provides additional channel type specific information like
 * the SIP call id or IAX2 call numbers about a channel.<p>
 * Available since Asterisk 1.6.<p>
 * It is implemented in <code>channels/chan_sip.c</code>, <code>channels/chan_iax2.c</code> and
 * <code>channels/chan_gtalk.c</code>
 *
 * @author srt
 * @version $Id: ChannelUpdateEvent.java 1118 2008-08-16 18:26:54Z srt $
 * @since 1.0.0
 */
public class ChannelUpdateEvent extends ManagerEvent
{
    private static final long serialVersionUID = 3141630567125429466L;
    private String channelType;
    private String channel;
    private String uniqueId;
    // SIP
    private String sipCallId;
    private String sipFullContact;
    private String peerName;
    // Gtalk
    private String gtalkSid;
    // IAX2
    private String iax2CallNoLocal;
    private String iax2CallNoRemote;
    private String iax2Peer;

    /**
     * @param source
     */
    public ChannelUpdateEvent(Object source)
    {
        super(source);
    }

    
    /**
     * Returns the type of channel, that is "IAX2" for an IAX2
     * channel or "SIP" for a SIP channel.<br>
     * For Google Talk it is either "GTALK" or "Gtalk".
     *
     * @return the type of channel that is registered.
     */
    public String getChannelType()
    {
        return channelType;
    }

    public void setChannelType(String channelType)
    {
        this.channelType = channelType;
    }

    /**
     * Returns the name of the channel.
     *
     * @return the name of the channel.
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
     * Returns the unique id of the channel.
     *
     * @return the unique id of the channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    public String getSipCallId()
    {
        return sipCallId;
    }

    public void setSipCallId(String sipCallId)
    {
        this.sipCallId = sipCallId;
    }

    public String getSipFullContact()
    {
        return sipFullContact;
    }

    public void setSipFullContact(String sipFullContact)
    {
        this.sipFullContact = sipFullContact;
    }

    public String getPeerName()
    {
        return peerName;
    }

    public void setPeerName(String peerName)
    {
        this.peerName = peerName;
    }

    public String getGtalkSid()
    {
        return gtalkSid;
    }

    public void setGtalkSid(String gtalkSid)
    {
        this.gtalkSid = gtalkSid;
    }

    public String getIax2CallNoLocal()
    {
        return iax2CallNoLocal;
    }

    public void setIax2CallNoLocal(String iax2CallNoLocal)
    {
        this.iax2CallNoLocal = iax2CallNoLocal;
    }

    public String getIax2CallNoRemote()
    {
        return iax2CallNoRemote;
    }

    public void setIax2CallNoRemote(String iax2CallNoRemote)
    {
        this.iax2CallNoRemote = iax2CallNoRemote;
    }

    public String getIax2Peer()
    {
        return iax2Peer;
    }

    public void setIax2Peer(String iax2Peer)
    {
        this.iax2Peer = iax2Peer;
    }
}
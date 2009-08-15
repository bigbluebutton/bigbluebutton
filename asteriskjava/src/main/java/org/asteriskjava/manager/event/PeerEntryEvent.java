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
 * A PeerEntryEvent is triggered in response to a {@link org.asteriskjava.manager.action.SipPeersAction},
 * {@link org.asteriskjava.manager.action.SipShowPeerAction} or {@link org.asteriskjava.manager.action.IaxPeerListAction}
 * and contains information about a SIP or IAX peer.<p>
 * It is implemented in <code>channels/chan_sip.c</code> and <code>channels/chan_iax.c</code>
 *
 * @author srt
 * @version $Id: PeerEntryEvent.java 1300 2009-04-30 00:28:00Z srt $
 * @since 0.2
 */
public class PeerEntryEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;

    public static final String CHANNEL_TYPE_SIP = "SIP";
    public static final String CHANNEL_TYPE_IAX = "IAX";

    private String channelType;
    private String objectName;
    private String objectUserName;
    private String chanObjectType;
    private String ipAddress;
    private Integer port;
    private Boolean dynamic;
    private Boolean natSupport;
    private Boolean videoSupport;
    private Boolean textSupport;
    private Boolean acl;
    private String status;
    private String realtimeDevice;
    private Boolean trunk;
    private String encryption;

    /**
     * Creates a new instance.
     *
     * @param source
     */
    public PeerEntryEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns whether this event represents a SIP or an IAX peer.
     *
     * @return "SIP" or "IAX".
     * @see #CHANNEL_TYPE_SIP
     * @see #CHANNEL_TYPE_IAX
     */
    public String getChannelType()
    {
        return channelType;
    }

    public void setChannelType(String channelType)
    {
        this.channelType = channelType;
    }

    public String getObjectName()
    {
        return objectName;
    }

    public void setObjectName(String objectName)
    {
        this.objectName = objectName;
    }

    /**
     * @return
     * @since 1.0.0
     */
    public String getObjectUserName()
    {
        return objectUserName;
    }

    public void setObjectUserName(String objectUserName)
    {
        this.objectUserName = objectUserName;
    }

    /**
     * For SIP peers this is either "peer" or "user".
     *
     * @return "peer" or "user".
     */
    public String getChanObjectType()
    {
        return chanObjectType;
    }

    public void setChanObjectType(String chanObjectType)
    {
        this.chanObjectType = chanObjectType;
    }

    /**
     * Returns the IP address of the peer.
     *
     * @return the IP address of the peer or "-none-" if none is available.
     */
    public String getIpAddress()
    {
        return ipAddress;
    }

    /**
     * Sets the IP address of the peer.
     *
     * @param ipAddress the IP address of the peer.
     */
    public void setIpAddress(String ipAddress)
    {
        this.ipAddress = ipAddress;
    }

    /**
     * Returns the port of the peer.
     *
     * @return the port of the peer.
     * @deprecated since 1.0.0, use {@link #getPort()} instead.
     */
    public Integer getIpPort()
    {
        return port;
    }

    public void setIpPort(Integer ipPort)
    {
        this.port = ipPort;
    }

    /**
     * Returns the port of the peer.
     *
     * @return the port of the peer.
     * @since 1.0.0
     */
    public Integer getPort()
    {
        return port;
    }

    public void setPort(Integer port)
    {
        this.port = port;
    }

    public Boolean getDynamic()
    {
        return dynamic;
    }

    public void setDynamic(Boolean dynamic)
    {
        this.dynamic = dynamic;
    }

    public Boolean getNatSupport()
    {
        return natSupport;
    }

    public void setNatSupport(Boolean natSupport)
    {
        this.natSupport = natSupport;
    }

    /**
     * Available since Asterisk 1.4.
     *
     * @since 0.3
     */
    public Boolean getVideoSupport()
    {
        return videoSupport;
    }

    /**
     * Available since Asterisk 1.4.
     *
     * @since 0.3
     */
    public void setVideoSupport(Boolean videoSupport)
    {
        this.videoSupport = videoSupport;
    }

    /**
     * Returns whether the peer supports text messages.<p>
     * Available since Asterisk 1.6.
     *
     * @return <code>true</code> if the peer supports text messages, <code>false</code> otherwise or
     *         <code>null</code> if the property is not set (i.e. for Asterisk prior to 1.6).
     * @since 1.0.0
     */
    public Boolean getTextSupport()
    {
        return textSupport;
    }

    public void setTextSupport(Boolean textSupport)
    {
        this.textSupport = textSupport;
    }

    public Boolean getAcl()
    {
        return acl;
    }

    public void setAcl(Boolean acl)
    {
        this.acl = acl;
    }

    /**
     * Returns the status of this peer.<p>
     * For SIP peers this is one of:
     * <dl>
     * <dt>"UNREACHABLE"</dt>
     * <dd></dd>
     * <dt>"LAGGED (%d ms)"</dt>
     * <dd></dd>
     * <dt>"OK (%d ms)"</dt>
     * <dd></dd>
     * <dt>"UNKNOWN"</dt>
     * <dd></dd>
     * <dt>"Unmonitored"</dt>
     * <dd></dd>
     * </dl>
     *
     * @return the status of this peer.
     */
    public String getStatus()
    {
        return status;
    }

    /**
     * Sets the status of this peer.
     *
     * @param status the status of this peer.
     */
    public void setStatus(String status)
    {
        this.status = status;
    }

    /**
     * Available since Asterisk 1.4.
     *
     * @since 0.3
     */
    public String getRealtimeDevice()
    {
        return realtimeDevice;
    }

    /**
     * Available since Asterisk 1.4.
     *
     * @since 0.3
     */
    public void setRealtimeDevice(String realtimeDevice)
    {
        this.realtimeDevice = realtimeDevice;
    }

    /**
     * Returns whether to use IAX2 trunking with this peer.<p>
     * Available since Asterisk 1.6.
     *
     * @return <code>true</code> if trunking is used, <code>false</code> if not or <code>null</code> if not set.
     * @since 1.0.0
     */
    public Boolean getTrunk()
    {
        return trunk;
    }

    public void setTrunk(Boolean trunk)
    {
        this.trunk = trunk;
    }

    public String getEncryption()
    {
        return encryption;
    }

    public void setEncryption(String encryption)
    {
        this.encryption = encryption;
    }
}

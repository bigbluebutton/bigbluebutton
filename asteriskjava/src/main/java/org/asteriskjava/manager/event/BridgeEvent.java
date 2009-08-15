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
 * A BridgeEvent is triggered when a link between two voice channels is established ("Link") or
 * discontinued ("Unlink").<p>
 * As of Asterisk 1.6 the Bridge event is reported directly by Asterisk. Asterisk versions up to
 * 1.4 report individual events: {@link org.asteriskjava.manager.event.LinkEvent} and
 * {@link org.asteriskjava.manager.event.UnlinkEvent}.For maximum compatibily do not use the Link and Unlink
 * events in your code. Just use the Bridge event and check for {@link #isLink()} and {@link #isUnlink()}.
 * <p/>
 * It is implemented in <code>channel.c</code>
 *
 * @author srt
 * @version $Id: BridgeEvent.java 971 2008-02-03 15:14:06Z srt $
 */
public class BridgeEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    public static final String BRIDGE_STATE_LINK = "Link";
    public static final String BRIDGE_STATE_UNLINK = "Unlink";

    /**
     * A <code>channel.c</code> bridge.
     */
    public static final String BRIDGE_TYPE_CORE = "core";

    /**
     * An RTP native bridge.
     */
    public static final String BRIDGE_TYPE_RTP_NATIVE = "rtp-native";

    /**
     * An RTP peer-2-peer bridge (NAT support only).
     */
    public static final String BRIDGE_TYPE_RTP_DIRECT = "rtp-direct";

    /**
     * A remote (re-invite) bridge.
     */
    public static final String BRIDGE_TYPE_RTP_REMOTE = "rtp-remote";

    private String bridgeState;
    private String bridgeType;
    private String uniqueId1;
    private String uniqueId2;
    private String channel1;
    private String channel2;
    private String callerId1;
    private String callerId2;

    public BridgeEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the bridge state.
     *
     * @return "Link" if the two channels have been linked, "Unlink" if they have been unlinked.
     * @see #BRIDGE_STATE_LINK
     * @see #BRIDGE_STATE_UNLINK
     * @since 1.0.0
     */
    public String getBridgeState()
    {
        return bridgeState;
    }

    /**
     * Sets the bridge state.
     *
     * @param bridgeState "Link" if the two channels have been linked, "Unlink" if they have been unlinked.
     * @since 1.0.0
     */
    public void setBridgeState(String bridgeState)
    {
        this.bridgeState = bridgeState;
    }

    /**
     * Returns the bridge type.<p>
     * Available since Asterisk 1.6.
     *
     * @return the bridge type.
     * @see #BRIDGE_TYPE_CORE
     * @see #BRIDGE_TYPE_RTP_NATIVE
     * @see #BRIDGE_TYPE_RTP_DIRECT
     * @see #BRIDGE_TYPE_RTP_REMOTE
     * @since 1.0.0
     */
    public String getBridgeType()
    {
        return bridgeType;
    }

    /**
     * Sets the bridge type.
     *
     * @param bridgeType the bridge type.
     * @since 1.0.0
     */
    public void setBridgeType(String bridgeType)
    {
        this.bridgeType = bridgeType;
    }

    /**
     * Returns the unique id of the first channel.
     *
     * @return the unique id of the first channel.
     */
    public String getUniqueId1()
    {
        return uniqueId1;
    }

    /**
     * Sets the unique id of the first channel.
     *
     * @param uniqueId1 the unique id of the first channel.
     */
    public void setUniqueId1(String uniqueId1)
    {
        this.uniqueId1 = uniqueId1;
    }

    /**
     * Returns the unique id of the second channel.
     *
     * @return the unique id of the second channel.
     */
    public String getUniqueId2()
    {
        return uniqueId2;
    }

    /**
     * Sets the unique id of the second channel.
     *
     * @param uniqueId2 the unique id of the second channel.
     */
    public void setUniqueId2(String uniqueId2)
    {
        this.uniqueId2 = uniqueId2;
    }

    /**
     * Returns the name of the first channel.
     *
     * @return the name of the first channel.
     */
    public String getChannel1()
    {
        return channel1;
    }

    /**
     * Sets the name of the first channel.
     *
     * @param channel1 the name of the first channel.
     */
    public void setChannel1(String channel1)
    {
        this.channel1 = channel1;
    }

    /**
     * Returns the name of the second channel.
     *
     * @return the name of the second channel.
     */
    public String getChannel2()
    {
        return channel2;
    }

    /**
     * Sets the name of the second channel.
     *
     * @param channel2 the name of the second channel.
     */
    public void setChannel2(String channel2)
    {
        this.channel2 = channel2;
    }

    /**
     * Returns the Caller*Id number of the first channel.
     *
     * @return the Caller*Id number of the first channel.
     * @since 0.2
     */
    public String getCallerId1()
    {
        return callerId1;
    }

    /**
     * Sets the Caller*Id number of the first channel.
     *
     * @param callerId1 the Caller*Id number of the first channel.
     * @since 0.2
     */
    public void setCallerId1(String callerId1)
    {
        this.callerId1 = callerId1;
    }

    /**
     * Returns the Caller*Id number of the second channel.
     *
     * @return the Caller*Id number of the second channel.
     * @since 0.2
     */
    public String getCallerId2()
    {
        return callerId2;
    }

    /**
     * Sets the Caller*Id number of the second channel.
     *
     * @param callerId2 the Caller*Id number of the second channel.
     * @since 0.2
     */
    public void setCallerId2(String callerId2)
    {
        this.callerId2 = callerId2;
    }

    /**
     * Returns whether the two channels have been linked.
     *
     * @return <code>true</code> the two channels have been linked, <code>false</code> if they have been unlinked.
     * @since 1.0.0
     */
    public boolean isLink()
    {
        return bridgeState != null && BRIDGE_STATE_LINK.equalsIgnoreCase(bridgeState);
    }

    /**
     * Returns whether the two channels have been unlinked.
     *
     * @return <code>true</code> the two channels have been unlinked, <code>false</code> if they have been linked.
     * @since 1.0.0
     */
    public boolean isUnlink()
    {
        return bridgeState != null && BRIDGE_STATE_UNLINK.equalsIgnoreCase(bridgeState);
    }
}

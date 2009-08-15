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
package org.asteriskjava.manager.action;

/**
 * The BridgeAction bridges two channels that are currently active on the system.<p>
 * It is definied in <code>res/res_features.c</code>.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: BridgeAction.java 938 2007-12-31 03:23:38Z srt $
 * @since 1.0.0
 */
public class BridgeAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    private String channel1;
    private String channel2;
    private Boolean tone;

    /**
     * Creates a new empty BridgeAction.
     */
    public BridgeAction()
    {

    }

    /**
     * Creates a new BridgeAction that bridges the two given channels.
     *
     * @param channel1 the name of the channel to bridge to channel2.
     * @param channel2 the name of the channel to bridge to channel1.
     */
    public BridgeAction(String channel1, String channel2)
    {
        this.channel1 = channel1;
        this.channel2 = channel2;
    }

    /**
     * Creates a new BridgeAction that bridges the two given channels.
     *
     * @param channel1 the name of the channel to bridge to channel2.
     * @param channel2 the name of the channel to bridge to channel1.
     * @param tone     <code>true</code> to play a courtesy tone to channel2, <code>false</code> otherwise.
     */
    public BridgeAction(String channel1, String channel2, Boolean tone)
    {
        this.channel1 = channel1;
        this.channel2 = channel2;
        this.tone = tone;
    }

    /**
     * Returns the name of this action, i.e. "Bridge".
     */
    @Override
    public String getAction()
    {
        return "Bridge";
    }

    /**
     * Returns the name of the channel to bridge to channel2.
     *
     * @return the name of the channel to bridge to channel2.
     */
    public String getChannel1()
    {
        return channel1;
    }

    /**
     * Sets the name of the channel to bridge to channel2.
     *
     * @param channel1 the name of the channel to bridge to channel2.
     */
    public void setChannel1(String channel1)
    {
        this.channel1 = channel1;
    }

    /**
     * Returns the name of the channel to bridge to channel1.
     *
     * @return the name of the channel to bridge to channel1.
     */
    public String getChannel2()
    {
        return channel2;
    }

    /**
     * Sets the name of the channel to bridge to channel1.
     *
     * @param channel2 the name of the channel to bridge to channel1.
     */
    public void setChannel2(String channel2)
    {
        this.channel2 = channel2;
    }

    /**
     * Returns whether a courtesy tone will be played to channel2.
     *
     * @return <code>true</code> to play a courtesy tone to channel2, <code>false</code> or
     *         <code>null</code> (if not set) otherwise.
     */
    public Boolean getTone()
    {
        return tone;
    }

    /**
     * Sets whether a courtesy tone will be played to channel2.
     *
     * @param tone <code>true</code> to play a courtesy tone to channel2, <code>false</code> otherwise.
     */
    public void setTone(Boolean tone)
    {
        this.tone = tone;
    }
}
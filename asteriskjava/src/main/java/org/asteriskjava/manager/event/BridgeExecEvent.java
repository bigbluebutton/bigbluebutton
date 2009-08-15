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
 * A BridgeExecEvent is triggered when two channels are bridged through a feature code or bridging the channels fails.<p>
 * It is implemented in <code>main/features.c</code><p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: BridgeExecEvent.java 1276 2009-03-23 21:48:25Z srt $
 * @since 1.0.0
 */
public class BridgeExecEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    public static final String RESPONSE_FAILED = "Failed";
    public static final String RESPONSE_SUCCESS = "Success";

    private String response;
    private String reason;
    private String channel1;
    private String channel2;

    public BridgeExecEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns whether bridging succeeded or failed. Possible values are
     * <ul>
     * <li>Failed</li>
     * <li>Success</li>
     * </ul>
     *
     * @return "Failed" if bridging failed, "Success" if it succeeded.
     * @see #RESPONSE_FAILED
     * @see #RESPONSE_SUCCESS
     */
    public String getResponse()
    {
        return response;
    }

    public void setResponse(String response)
    {
        this.response = response;
    }

    /**
     * Returns the reason for failure. Possible values are
     * <ul>
     * <li>Unable to bridge channel to itself</li>
     * <li>Cannot grab end point</li>
     * <li>cannot create placeholder</li>
     * <li>Could not make channels compatible for bridge</li>
     * </ul>
     *
     * @return the reason for failure or <code>null</code> on success.
     */
    public String getReason()
    {
        return reason;
    }

    public void setReason(String reason)
    {
        this.reason = reason;
    }

    /**
     * The name of the first channel.
     *
     * @return name of the first channel.
     */
    public String getChannel1()
    {
        return channel1;
    }

    public void setChannel1(String channel1)
    {
        this.channel1 = channel1;
    }

    /**
     * The name of the second channel.
     *
     * @return name of the second channel.
     */
    public String getChannel2()
    {
        return channel2;
    }

    public void setChannel2(String channel2)
    {
        this.channel2 = channel2;
    }
}
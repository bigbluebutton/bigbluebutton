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
 * The ParkAction parks a channel using Asterisk's park feature.
 * <p>
 * Defined in <code>res/res_features.c</code><p>
 * Available since Asterisk 1.4.
 * 
 * @author srt
 * @version $Id: ParkAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class ParkAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -2930397629192323391L;

    private String channel;
    private String channel2;
    private Integer timeout;

    /**
     * Creates a new empty ParkAction.
     */
    public ParkAction()
    {
        super();
    }

    /**
     * Creates a new ParkAction.
     * 
     * @param channel name of the channel to park.
     * @param channel2 name of the channel to announce park info to and return
     *            to on timeout.
     */
    public ParkAction(String channel, String channel2)
    {
        super();
        this.channel = channel;
        this.channel2 = channel2;
    }

    /**
     * Creates a new ParkAction with a timeout.
     * 
     * @param channel the name of the channel to park.
     * @param channel2 the name of the channel to announce park info to and
     *            return to on timeout.
     * @param timeout the timeout in seconds before callback.
     */
    public ParkAction(String channel, String channel2, Integer timeout)
    {
        super();
        this.channel = channel;
        this.channel2 = channel2;
        this.timeout = timeout;
    }

    /**
     * Returns the name of this action, i.e. "Park".
     */
    @Override
   public String getAction()
    {
        return "Park";
    }

    /**
     * Returns the name of the channel to park.
     * 
     * @return the name of the channel to park.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to park.<p>
     * This property is mandatory.
     * 
     * @param channel the name of the channel to park.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of the channel to announce park info to and return to on
     * timeout.
     * 
     * @return the name of the channel to announce park info to and return to on
     *         timeout.
     */
    public String getChannel2()
    {
        return channel2;
    }

    /**
     * Sets the name of the channel to announce park info to and return to on
     * timeout.<p>
     * This property is mandatory.
     * 
     * @param channel2 the name of the channel to announce park info to and
     *            return to on timeout.
     */
    public void setChannel2(String channel2)
    {
        this.channel2 = channel2;
    }

    /**
     * Returns the timeout in seconds before callback.
     * 
     * @return the timeout in seconds before callback.
     */
    public Integer getTimeout()
    {
        return timeout;
    }

    /**
     * Sets the timeout in seconds before callback.
     * 
     * @param timeout the timeout in seconds before callback.
     */
    public void setTimeout(Integer timeout)
    {
        this.timeout = timeout;
    }
}

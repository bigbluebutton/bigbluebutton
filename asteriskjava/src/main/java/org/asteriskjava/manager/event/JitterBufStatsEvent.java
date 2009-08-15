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
 * A JitterBufStatsEvent is triggered at the end of IAX2 calls and reports
 * jitter statistics.<p>
 * It is implemented in <code>channels/chan_iax2.c</code>.<p>
 * Available since Asterisk 1.6.
 *
 * @author srt
 * @version $Id: JitterBufStatsEvent.java 1209 2008-12-09 13:46:01Z srt $
 * @since 1.0.0
 */
public class JitterBufStatsEvent extends ManagerEvent
{
    private static final long serialVersionUID = 1L;

    private String owner;
    private Integer ping;
    private Integer localJitter;
    private Integer localJbDelay;
    private Integer localTotalLost;
    private Integer localLossPercent;
    private Integer localDropped;
    private Integer localooo;
    private Integer localReceived;
    private Integer remoteJitter;
    private Integer remoteJbDelay;
    private Integer remoteTotalLost;
    private Integer remoteLossPercent;
    private Integer remoteDropped;
    private Integer remoteooo;
    private Integer remoteReceived;

    public JitterBufStatsEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel.
     *
     * @return channel the name of the channel.
     */
    public String getOwner()
    {
        return owner;
    }

    public void setOwner(String owner)
    {
        this.owner = owner;
    }

    public Integer getPing()
    {
        return ping;
    }

    public void setPing(Integer ping)
    {
        this.ping = ping;
    }

    public Integer getLocalJitter()
    {
        return localJitter;
    }

    public void setLocalJitter(Integer localJitter)
    {
        this.localJitter = localJitter;
    }

    public Integer getLocalJbDelay()
    {
        return localJbDelay;
    }

    public void setLocalJbDelay(Integer localJbDelay)
    {
        this.localJbDelay = localJbDelay;
    }

    public Integer getLocalTotalLost()
    {
        return localTotalLost;
    }

    public void setLocalTotalLost(Integer localTotalLost)
    {
        this.localTotalLost = localTotalLost;
    }

    public Integer getLocalLossPercent()
    {
        return localLossPercent;
    }

    public void setLocalLossPercent(Integer localLossPercent)
    {
        this.localLossPercent = localLossPercent;
    }

    public Integer getLocalDropped()
    {
        return localDropped;
    }

    public void setLocalDropped(Integer localDropped)
    {
        this.localDropped = localDropped;
    }

    public Integer getLocalooo()
    {
        return localooo;
    }

    public void setLocalooo(Integer localooo)
    {
        this.localooo = localooo;
    }

    public Integer getLocalReceived()
    {
        return localReceived;
    }

    public void setLocalReceived(Integer localReceived)
    {
        this.localReceived = localReceived;
    }

    public Integer getRemoteJitter()
    {
        return remoteJitter;
    }

    public void setRemoteJitter(Integer remoteJitter)
    {
        this.remoteJitter = remoteJitter;
    }

    public Integer getRemoteJbDelay()
    {
        return remoteJbDelay;
    }

    public void setRemoteJbDelay(Integer remoteJbDelay)
    {
        this.remoteJbDelay = remoteJbDelay;
    }

    public Integer getRemoteTotalLost()
    {
        return remoteTotalLost;
    }

    public void setRemoteTotalLost(Integer remoteTotalLost)
    {
        this.remoteTotalLost = remoteTotalLost;
    }

    public Integer getRemoteLossPercent()
    {
        return remoteLossPercent;
    }

    public void setRemoteLossPercent(Integer remoteLossPercent)
    {
        this.remoteLossPercent = remoteLossPercent;
    }

    public Integer getRemoteDropped()
    {
        return remoteDropped;
    }

    public void setRemoteDropped(Integer remoteDropped)
    {
        this.remoteDropped = remoteDropped;
    }

    public Integer getRemoteooo()
    {
        return remoteooo;
    }

    public void setRemoteooo(Integer remoteooo)
    {
        this.remoteooo = remoteooo;
    }

    public Integer getRemoteReceived()
    {
        return remoteReceived;
    }

    public void setRemoteReceived(Integer remoteReceived)
    {
        this.remoteReceived = remoteReceived;
    }
}
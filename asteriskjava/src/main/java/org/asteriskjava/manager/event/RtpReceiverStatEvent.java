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
 * An RtpReceiverStatEvent is triggered at the end of an RTP transmission and reports
 * transmission statistics.<p>
 * Available since Asterisk 1.6<p>
 * It is implemented in <code>main/rtp.c</code>
 *
 * @author srt
 * @version $Id: RtpReceiverStatEvent.java 1141 2008-08-19 18:08:19Z srt $
 * @since 1.0.0
 */
public class RtpReceiverStatEvent extends AbstractRtpStatEvent
{
    private static final long serialVersionUID = 1L;

    private Long receivedPackets;
    private Double transit;
    private Long rrCount;

    public RtpReceiverStatEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the number of packets received.
     *
     * @return the number of packets received.
     */
    public Long getReceivedPackets()
    {
        return receivedPackets;
    }

    public void setReceivedPackets(Long receivedPackets)
    {
        this.receivedPackets = receivedPackets;
    }

    public Double getTransit()
    {
        return transit;
    }

    public void setTransit(Double transit)
    {
        this.transit = transit;
    }

    /**
     * Returns the number of receiver reports.
     *
     * @return the number of receiver reports.
     */
    public Long getRrCount()
    {
        return rrCount;
    }

    public void setRrCount(Long rrCount)
    {
        this.rrCount = rrCount;
    }
}
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

import java.net.InetAddress;

/**
 * An RtcpSentEvent is triggered when Asterisk sends an RTCP message.<p>
 * Available since Asterisk 1.6<p>
 * It is implemented in <code>main/rtp.c</code>
 *
 * @author srt
 * @version $Id: RtcpSentEvent.java 1141 2008-08-19 18:08:19Z srt $
 * @since 1.0.0
 */
public class RtcpSentEvent extends AbstractRtcpEvent
{
    private static final long serialVersionUID = 1L;

    private InetAddress toAddress;
    private Integer toPort;
    private Long ourSsrc;
    private Double sentNtp;
    private Long sentRtp;
    private Long sentPackets;
    private Long sentOctets;
    private Long cumulativeLoss;
    private Long theirLastSr;

    public RtcpSentEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the IP address the RTCP message has been sent to.
     *
     * @return the IP address the RTCP message has been sent to.
     */
    public InetAddress getToAddress()
    {
        return toAddress;
    }

    /**
     * Returns the port the RTCP message has been sent to.
     *
     * @return the port the RTCP message has been sent to.
     */
    public Integer getToPort()
    {
        return toPort;
    }

    public void setTo(String to)
    {
        // Format is "%s:%d"
        this.toAddress = stringToAddress(to);
        this.toPort = stringToPort(to);
    }

    /**
     * Returns our synchronization source identifier that uniquely identifies the source of a stream.
     * @return our synchronization source identifier.
     */
    public Long getOurSsrc()
    {
        return ourSsrc;
    }

    public void setOurSsrc(Long ourSsrc)
    {
        this.ourSsrc = ourSsrc;
    }

    public Double getSentNtp()
    {
        return sentNtp;
    }

    public void setSentNtp(Double sentNtp)
    {
        this.sentNtp = sentNtp;
    }

    public Long getSentRtp()
    {
        return sentRtp;
    }

    public void setSentRtp(Long sentRtp)
    {
        this.sentRtp = sentRtp;
    }

    /**
     * Returns the number of packets sent.
     *
     * @return the number of packets sent.
     */
    public Long getSentPackets()
    {
        return sentPackets;
    }

    public void setSentPackets(Long sentPackets)
    {
        this.sentPackets = sentPackets;
    }

    /**
     * Returns the number of octets (bytes) sent.
     *
     * @return the number of octets (bytes) sent.
     */
    public Long getSentOctets()
    {
        return sentOctets;
    }

    public void setSentOctets(Long sentOctets)
    {
        this.sentOctets = sentOctets;
    }

    public Long getCumulativeLoss()
    {
        return cumulativeLoss;
    }

    public void setCumulativeLoss(Long cumulativeLoss)
    {
        this.cumulativeLoss = cumulativeLoss;
    }

    public Long getTheirLastSr()
    {
        return theirLastSr;
    }

    public void setTheirLastSr(Long theirLastSr)
    {
        this.theirLastSr = theirLastSr;
    }
}
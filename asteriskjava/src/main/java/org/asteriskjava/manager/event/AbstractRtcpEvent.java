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
import java.net.UnknownHostException;

/**
 * Abstract base class for RTCP related events.<p>
 *
 * @author srt
 * @version $Id: AbstractRtcpEvent.java 1141 2008-08-19 18:08:19Z srt $
 * @since 1.0.0
 */
public abstract class AbstractRtcpEvent extends ManagerEvent
{
    private static final long serialVersionUID = 1L;

    private Long fractionLost;
    private Double dlSr;
    private Double iaJitter;

    public AbstractRtcpEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the short term loss ratio. This is the fraction of packets lost since the last RR
     * or SR packet was sent.
     *
     * @return the short term loss ratio.
     */
    public Long getFractionLost()
    {
        return fractionLost;
    }

    public void setFractionLost(Long fractionLost)
    {
        this.fractionLost = fractionLost;
    }

    /**
     * Returns the interarrival jitter.
     *
     * @return the interarrival jitter.
     */
    public Double getIaJitter()
    {
        return iaJitter;
    }

    public void setIaJitter(Double iaJitter)
    {
        this.iaJitter = iaJitter;
    }

    /**
     * Returns the delay since the last SR.
     *
     * @return the delay since the last SR in seconds.
     */
    public Double getDlSr()
    {
        return dlSr;
    }

    public void setDlSr(String dlSrString)
    {
        this.dlSr = secStringToDouble(dlSrString);
    }

    protected Long secStringToLong(String s)
    {
        if (s == null || s.length() == 0)
        {
            return null;
        }

        if (s.endsWith("(sec)"))
        {
            return Long.parseLong(s.substring(0, s.length() - "(sec)".length()));
        }
        else
        {
            return Long.parseLong(s);
        }
    }

    protected Double secStringToDouble(String s)
    {
        if (s == null || s.length() == 0)
        {
            return null;
        }

        if (s.endsWith("(sec)"))
        {
            return Double.parseDouble(s.substring(0, s.length() - "(sec)".length()));
        }
        else
        {
            return Double.parseDouble(s);
        }
    }

    protected InetAddress stringToAddress(String addressWithPort)
    {
        final String address;

        if (addressWithPort == null || addressWithPort.length() == 0)
        {
            return null;
        }

        if (addressWithPort.lastIndexOf(':') > 0)
        {
            address = addressWithPort.substring(0, addressWithPort.lastIndexOf(':'));
        }
        else
        {
            address = addressWithPort;
        }

        try
        {
            return InetAddress.getByName(address);
        }
        catch (UnknownHostException e)
        {
            // should not happen as we supply a textual IP address
            throw new IllegalArgumentException("Unable to convert " + addressWithPort + " to InetAddress", e);
        }
    }

    protected Integer stringToPort(String addressWithPort)
    {
        final String port;

        if (addressWithPort == null || addressWithPort.length() == 0)
        {
            return null;
        }

        if (addressWithPort.lastIndexOf(':') > 0)
        {
            port = addressWithPort.substring(addressWithPort.lastIndexOf(':') + 1);
        }
        else
        {
            return null;
        }

        return Integer.parseInt(port);
    }
}
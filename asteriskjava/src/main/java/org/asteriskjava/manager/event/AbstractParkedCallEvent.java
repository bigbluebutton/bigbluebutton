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
 * Abstract base class for several call parking related events.
 *
 * @author srt
 * @version $Id: AbstractParkedCallEvent.java 1151 2008-08-21 20:20:21Z srt $
 * @since 0.2
 */
public abstract class AbstractParkedCallEvent extends ManagerEvent
{
    private static final long serialVersionUID = 0L;
    private String exten;
    private String channel;
    private String parkingLot;
    private String callerIdNum;
    private String callerIdName;
    private String uniqueId;

    protected AbstractParkedCallEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the extension the channel is or was parked at.
     *
     * @return the extension the channel is or was parked at.
     */
    public String getExten()
    {
        return exten;
    }

    public void setExten(String exten)
    {
        this.exten = exten;
    }

    /**
     * Returns the name of the channel that is or was parked.
     *
     * @return the name of the channel that is or was parked.
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
     * Returns the parking lot.<p>
     * Available since Asterisk 1.6.
     *
     * @return the parking lot.
     * @since 1.0.0
     */
    public String getParkingLot()
    {
        return parkingLot;
    }

    /**
     * Sets the parking lot.
     *
     * @param parkingLot the parking lot.
     */
    public void setParkingLot(String parkingLot)
    {
        this.parkingLot = parkingLot;
    }

    /**
     * Returns the Caller*ID number of the parked channel.
     *
     * @return the Caller*ID number of the parked channel.
     * @since 1.0.0
     */
    public String getCallerIdNum()
    {
        return callerIdNum;
    }

    public void setCallerIdNum(String callerIdNum)
    {
        this.callerIdNum = callerIdNum;
    }

    /**
     * Returns the Caller*ID number of the parked channel.
     *
     * @return the Caller*ID number of the parked channel.
     * @deprecated since 1.0.0. Use {@link #getCallerIdNum()} instead.
     */
    public String getCallerId()
    {
        return callerIdNum;
    }

    public void setCallerId(String callerId)
    {
        this.callerIdNum = callerId;
    }

    /**
     * Returns the Caller*ID name of the parked channel.
     *
     * @return the Caller*ID name of the parked channel.
     */
    public String getCallerIdName()
    {
        return callerIdName;
    }

    /**
     * Sets the Caller*ID name of the parked channel.
     *
     * @param callerIdName the Caller*ID name of the parked channel.
     */
    public void setCallerIdName(String callerIdName)
    {
        this.callerIdName = callerIdName;
    }

    /**
     * Returns the unique id of the parked channel.<p>
     * Note: This property is not set properly by all versions of Asterisk, see
     * <a href="http://bugs.digium.com/view.php?id=13323">http://bugs.digium.com/view.php?id=13323</a>
     * and
     * <a href="http://bugs.digium.com/view.php?id=13358">http://bugs.digium.com/view.php?id=13358</a>
     * for more information. Use {@link #getChannel()} instead.
     *
     * @return the unique id of the parked channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }
}

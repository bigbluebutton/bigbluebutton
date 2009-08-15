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
 * A FaxReceivedEvent is triggered by spandsp after a new fax has been received.
 * <p>
 * It is only available if you installed the spandsp patches to Asterisk.
 * <p>
 * See http://soft-switch.org/installing-spandsp.html for details.
 * <p>
 * Implemented in <code>apps/app_rxfax.c</code>.
 * 
 * @author srt
 * @version $Id: FaxReceivedEvent.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class FaxReceivedEvent extends ManagerEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = -1409738380177538949L;

    private String channel;
    private String exten;
    private String callerId;
    private String remoteStationId;
    private String localStationId;
    private Integer pagesTransferred;
    private Integer resolution;
    private Integer transferRate;
    private String filename;

    public FaxReceivedEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel the fax has been recieved on.
     * 
     * @return the name of the channel the fax has been recieved on.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel the fax has been recieved on.
     * 
     * @param channel the name of the channel the fax has been recieved on.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the extension in Asterisk's dialplan the fax was received
     * through.
     * 
     * @return the extension the fax was received through.
     */
    public String getExten()
    {
        return exten;
    }

    /**
     * Sets the extension the fax was received through.
     * 
     * @param exten the extension the fax was received through.
     */
    public void setExten(String exten)
    {
        this.exten = exten;
    }

    /**
     * Returns the Caller*ID of the calling party or an empty string if none is
     * available.
     * 
     * @return the Caller*ID of the calling party.
     */
    public String getCallerId()
    {
        return callerId;
    }

    /**
     * Sets the Caller*ID of the calling party.
     * 
     * @param callerId the Caller*ID of the calling party.
     */
    public void setCallerId(String callerId)
    {
        this.callerId = callerId;
    }

    /**
     * Retruns the identifier of the remote fax station.
     * 
     * @return the identifier of the remote fax station.
     */
    public String getRemoteStationId()
    {
        return remoteStationId;
    }

    /**
     * Sets the identifier of the remote fax station.
     * 
     * @param remoteStationId the identifier of the remote fax station.
     */
    public void setRemoteStationId(String remoteStationId)
    {
        this.remoteStationId = remoteStationId;
    }

    /**
     * Returns the identifier of the local fax station.
     * 
     * @return the identifier of the local fax station.
     */
    public String getLocalStationId()
    {
        return localStationId;
    }

    /**
     * Sets the identifier of the local fax station.
     * 
     * @param localStationId the identifier of the local fax station.
     */
    public void setLocalStationId(String localStationId)
    {
        this.localStationId = localStationId;
    }

    /**
     * Returns the number of pages transferred.
     * 
     * @return the number of pages transferred.
     */
    public Integer getPagesTransferred()
    {
        return pagesTransferred;
    }

    /**
     * Sets the number of pages transferred.
     * 
     * @param pagesTransferred the number of pages transferred.
     */
    public void setPagesTransferred(Integer pagesTransferred)
    {
        this.pagesTransferred = pagesTransferred;
    }

    /**
     * Returns the row resolution of the received fax.
     * 
     * @return the row resolution of the received fax.
     */
    public Integer getResolution()
    {
        return resolution;
    }

    /**
     * Sets the row resolution of the received fax.
     * 
     * @param resolution the row resolution of the received fax.
     */
    public void setResolution(Integer resolution)
    {
        this.resolution = resolution;
    }

    /**
     * Returns the transfer rate in bits/s.
     * 
     * @return the transfer rate in bits/s.
     */
    public Integer getTransferRate()
    {
        return transferRate;
    }

    /**
     * Sets the transfer rate in bits/s.
     * 
     * @param transferRate the transfer rate in bits/s.
     */
    public void setTransferRate(Integer transferRate)
    {
        this.transferRate = transferRate;
    }

    /**
     * Returns the filename of the received fax including its full path on the
     * Asterisk server.
     * 
     * @return the filename of the received fax
     */
    public String getFilename()
    {
        return filename;
    }

    /**
     * Sets the filename of the received fax.
     * 
     * @param filename the filename of the received fax
     */
    public void setFilename(String filename)
    {
        this.filename = filename;
    }
}

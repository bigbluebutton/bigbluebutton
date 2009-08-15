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
 * A ConnectEvent is triggered after successful login to the Asterisk server.<p>
 * It is a pseudo event not directly related to an Asterisk generated event.
 * 
 * @author srt
 * @version $Id: ConnectEvent.java 1046 2008-05-16 13:42:24Z srt $
 * @see org.asteriskjava.manager.event.DisconnectEvent
 */
public class ConnectEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 3257845467831284784L;

    /**
     * The version of the manager protocol.
     */
    private String protocolIdentifier;

    /**
     * @param source
     */
    public ConnectEvent(Object source)
    {
        super(source);
    }
    
    public ConnectEvent(Object source, String protocolIdentifier)
    {
        this(source);
        this.protocolIdentifier = protocolIdentifier;
    }

    /**
     * Returns the version of the protocol. For example "Asterisk Call Manager/1.0" for Asterisk up to 1.4 and
     * "Asterisk Call Manager/1.1" for Asterisk 1.6.
     * 
     * @return the version of the protocol.
     */
    public String getProtocolIdentifier()
    {
        return protocolIdentifier;
    }

    /**
     * Sets the version of the protocol.
     * 
     * @param protocolIdentifier the version of the protocol.
     */
    public void setProtocolIdentifier(String protocolIdentifier)
    {
        this.protocolIdentifier = protocolIdentifier;
    }
}

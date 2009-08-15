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
 * A DisconnectEvent is triggered when the connection to the asterisk server is lost.<p>
 * It is a pseudo event not directly related to an Asterisk generated event.
 * 
 * @author srt
 * @version $Id: DisconnectEvent.java 1046 2008-05-16 13:42:24Z srt $
 * @see org.asteriskjava.manager.event.ConnectEvent
 */
public class DisconnectEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 3689355411862206518L;

    /**
     * @param source
     */
    public DisconnectEvent(Object source)
    {
        super(source);
    }
}

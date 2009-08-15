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
 * A JabberEventEvent is triggered when Asterisk receives a Jabber (XMPP) message.<p>
 * It is implemented in <code>res/res_jabber.c</code><p>
 * Available since Asterisk 1.4
 *
 * @author srt
 * @version $Id: JabberEventEvent.java 1134 2008-08-18 13:33:25Z srt $
 * @since 1.0.0
 */
public class JabberEventEvent extends ManagerEvent
{
    private static final long serialVersionUID = 1L;

    private String account;
    private String packet;

    public JabberEventEvent(Object source)
    {
        super(source);
    }

    public String getAccount()
    {
        return account;
    }

    public void setAccount(String account)
    {
        this.account = account;
    }

    public String getPacket()
    {
        return packet;
    }

    public void setPacket(String packet)
    {
        this.packet = packet;
    }
}
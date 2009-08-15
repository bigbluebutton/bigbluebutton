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
 * A ShutdownEvent is triggered when the asterisk server is shut down or restarted.<p>
 * It is implemented in <code>asterisk.c</code>
 * 
 * @author srt
 * @version $Id: ShutdownEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class ShutdownEvent extends ManagerEvent
{
    /**
     * Serial version identifier
     */
    static final long serialVersionUID = 2028136082664018423L;

    private Boolean restart = Boolean.FALSE;
    private String shutdown;

    /**
     * @param source
     */
    public ShutdownEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the kind of shutdown or restart. Possible values are "Uncleanly" and "Cleanly". A
     * shutdown is considered unclean if there are any active channels when the system is shut down.
     */
    public String getShutdown()
    {
        return shutdown;
    }

    public void setShutdown(String shutdown)
    {
        this.shutdown = shutdown;
    }

    /**
     * Returns <code>true</code> if the server has been restarted; <code>false</code> if it has
     * been halted.
     */
    public Boolean getRestart()
    {
        return restart;
    }

    public void setRestart(Boolean restart)
    {
        this.restart = restart;
    }
}

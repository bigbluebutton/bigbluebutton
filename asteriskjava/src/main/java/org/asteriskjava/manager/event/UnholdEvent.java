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
 * An UnholdEvent is triggered by the SIP channel driver when a channel is no
 * longer put on hold.<p>
 * It is implemented in <code>channels/chan_sip.c</code>.<p>
 * Available since Asterisk 1.2, as of Asterisk 1.6 only {@link org.asteriskjava.manager.event.HoldEvent} is sent
 * with the status set to <code>false</code> to indicate unhold.
 *
 * @author srt
 * @version $Id: UnholdEvent.java 967 2008-02-03 07:28:32Z srt $
 * @see org.asteriskjava.manager.event.HoldEvent
 * @since 0.2
 * @deprecated as of 1.0.0, use {@link org.asteriskjava.manager.event.HoldEvent} and its
 *             {@link #isUnhold()} method instead.
 */
public class UnholdEvent extends HoldEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 1L;

    /**
     * Creates a new UnholdEvent.
     *
     * @param source
     */
    public UnholdEvent(Object source)
    {
        super(source);
        setStatus(false);
    }
}

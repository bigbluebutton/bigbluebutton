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
package org.asteriskjava.live;

import org.asteriskjava.manager.event.QueueMemberEvent;

/**
 * Represents the status of a Queue memeber.
 *
 * <p/>
 * Valid status codes are:
 * <dl>
 * <dt>AST_DEVICE_UNKNOWN (0)</dt>
 * <dd>Queue member is available</dd>
 * <dt>AST_DEVICE_NOT_INUSE (1)</dt>
 * <dd>?</dd>
 * <dt>AST_DEVICE_INUSE (2)</dt>
 * <dd>?</dd>
 * <dt>AST_DEVICE_BUSY (3)</dt>
 * <dd>?</dd>
 * <dt>AST_DEVICE_INVALID (4)</dt>
 * <dd>?</dd>
 * <dt>AST_DEVICE_UNAVAILABLE (5)</dt>
 * <dd>?</dd>
 * </dl>
 *
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
 * @version $Id: QueueMemberState.java 962 2008-02-03 03:34:11Z srt $
 * @since 0.3.1
 * @see org.asteriskjava.manager.event.QueueMemberEvent
 */
public enum QueueMemberState
{
    DEVICE_UNKNOWN(QueueMemberEvent.AST_DEVICE_UNKNOWN),

    /**
     * Queue member is available, eg. Agent is logged in but idle.
     */
    DEVICE_NOT_INUSE(QueueMemberEvent.AST_DEVICE_NOT_INUSE),

    DEVICE_INUSE(QueueMemberEvent.AST_DEVICE_INUSE),

    /**
     * Busy means, phone is in action, eg. is ringing, in call.
     */
    DEVICE_BUSY(QueueMemberEvent.AST_DEVICE_BUSY),

    DEVICE_INVALID(QueueMemberEvent.AST_DEVICE_INVALID),

    /**
     * Device is not availible for call, eg. Agent is logged off.
     */
    DEVICE_UNAVAILABLE(QueueMemberEvent.AST_DEVICE_UNAVAILABLE);

    private final int status;

    /**
     * Creates a new instance.
     *
     * @param status the numerical status code.
     */
    QueueMemberState(int status)
    {
        this.status = status;
    }

    /**
     * Returns the numerical status code.
     *
     * @return the numerical status code.
     * @see org.asteriskjava.manager.event.QueueMemberEvent#getStatus() 
     */
    public int getStatus()
    {
        return status;
    }

    /**
     * Returns value specified by int. Use this to transform
     * {@link org.asteriskjava.manager.event.QueueMemberEvent#getStatus()}.
     *
     * @param status integer representation of the status.
     * @return corresponding QueueMemberState object or <code>null</code> if none matches.
     */
    public static QueueMemberState valueOf(Integer status)
    {
        if (status == null)
        {
            return null;
        }

        for (QueueMemberState tmp : QueueMemberState.values())
        {
            if (tmp.getStatus() == status)
            {
                return tmp;
            }
        }

        return null;
    }
}

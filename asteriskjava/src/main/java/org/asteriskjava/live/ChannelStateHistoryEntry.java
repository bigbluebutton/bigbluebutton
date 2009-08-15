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

import java.io.Serializable;
import java.util.Date;

/**
 * An entry in the channel state history of an {@link AsteriskChannel}.
 *
 * @author srt
 * @version $Id: ChannelStateHistoryEntry.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.3
 */
public class ChannelStateHistoryEntry implements Serializable
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 5437551192335452460L;
    private final Date date;
    private final ChannelState state;

    /**
     * Creates a new instance.
     *
     * @param date  the date the channel entered the state.
     * @param state the state the channel entered.
     */
    public ChannelStateHistoryEntry(Date date, ChannelState state)
    {
        this.date = date;
        this.state = state;
    }

    /**
     * Returns the date the channel entered the state.
     *
     * @return the date the channel entered the state.
     */
    public Date getDate()
    {
        return date;
    }

    /**
     * The state the channel entered.
     *
     * @return the state the channel entered.
     */
    public ChannelState getState()
    {
        return state;
    }

    @Override
    public String toString()
    {
        final StringBuilder sb;

        sb = new StringBuilder("ChannelStateHistoryEntry[");
        sb.append("date=").append(date).append(",");
        sb.append("state=").append(state).append("]");
        return sb.toString();
    }
}

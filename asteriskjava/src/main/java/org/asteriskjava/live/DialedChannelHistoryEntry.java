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

import java.util.Date;

/**
 * An entry in the dialed channels history of an {@link AsteriskChannel}.
 *
 * @author srt
 * @version $Id: DialedChannelHistoryEntry.java 1161 2008-09-18 02:37:49Z sprior $
 * @since 0.3
 */
public class DialedChannelHistoryEntry
{
    private final Date date;
    private final AsteriskChannel channel;

    /**
     * Creates a new instance.
     *
     * @param date    the date the channel was dialed.
     * @param channel the channel that has been dialed.
     */
    public DialedChannelHistoryEntry(Date date, AsteriskChannel channel)
    {
        this.date = date;
        this.channel = channel;
    }

    /**
     * Returns the date the channel was dialed.
     *
     * @return the date the channel was dialed.
     */
    public Date getDate()
    {
        return date;
    }

    /**
     * Returns the channel that has been dialed.
     *
     * @return the channel that has been dialed.
     */
    public AsteriskChannel getChannel()
    {
        return channel;
    }

    @Override
    public String toString()
    {
        final StringBuilder sb;

        sb = new StringBuilder("DialedChannelHistoryEntry[");
        sb.append("date=").append(date).append(",");
        sb.append("channel=").append(channel).append("]");
        return sb.toString();
    }
}

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
 * An entry in the linked channels history of an {@link AsteriskChannel}.
 *
 * @author srt
 * @version $Id: LinkedChannelHistoryEntry.java 1161 2008-09-18 02:37:49Z sprior $
 * @since 0.3
 */
public class LinkedChannelHistoryEntry
{
    private final Date dateLinked;
    private Date dateUnlinked;
    private final AsteriskChannel channel;

    /**
     * Creates a new instance.
     *
     * @param dateLinked the date the channel was linked.
     * @param channel    the channel that has been linked.
     */
    public LinkedChannelHistoryEntry(Date dateLinked, AsteriskChannel channel)
    {
        this.dateLinked = dateLinked;
        this.channel = channel;
    }

    /**
     * Returns the date the channel was linked.
     *
     * @return the date the channel was linked.
     */
    public Date getDateLinked()
    {
        return dateLinked;
    }

    /**
     * Returns the date the channel was unlinked.
     *
     * @return the date the channel was unlinked.
     */
    public Date getDateUnlinked()
    {
        return dateUnlinked;
    }

    /**
     * Sets the date the channel was unlinked.
     *
     * @param dateUnlinked the date the channel was unlinked.
     */
    public void setDateUnlinked(Date dateUnlinked)
    {
        this.dateUnlinked = dateUnlinked;
    }

    /**
     * Returns the channel that has been linked.
     *
     * @return the channel that has been linked.
     */
    public AsteriskChannel getChannel()
    {
        return channel;
    }

    @Override
    public String toString()
    {
        final StringBuilder sb;

        sb = new StringBuilder(100);
        sb.append("LinkedChannelHistoryEntry[");
        sb.append("dateLinked=").append(dateLinked).append(",");
        sb.append("dateUnlinked=").append(dateUnlinked).append(",");
        sb.append("channel=").append(channel).append("]");
        return sb.toString();
    }
}

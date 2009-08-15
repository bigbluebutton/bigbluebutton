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
 * An entry in the extension history of an {@link AsteriskChannel}.
 *
 * @author srt
 * @version $Id: ExtensionHistoryEntry.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.3
 */
public class ExtensionHistoryEntry implements Serializable
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 5437551192335452460L;
    private final Date date;
    private final Extension extension;

    /**
     * Creates a new instance.
     *
     * @param date      the date the extension has been visited.
     * @param extension the extension that has been visited.
     */
    public ExtensionHistoryEntry(Date date, Extension extension)
    {
        this.date = date;
        this.extension = extension;
    }

    /**
     * Returns the date the extension has been visited.
     *
     * @return the date the extension has been visited.
     */
    public Date getDate()
    {
        return date;
    }

    /**
     * Returns the extension that has been visited.
     *
     * @return the extension that has been visited.
     */
    public Extension getExtension()
    {
        return extension;
    }

    @Override
    public String toString()
    {
        final StringBuilder sb;

        sb = new StringBuilder(100);
        sb.append("ExtensionHistoryEntry[");
        sb.append("date=").append(date).append(",");
        sb.append("extension=").append(extension).append("]");
        return sb.toString();
    }
}

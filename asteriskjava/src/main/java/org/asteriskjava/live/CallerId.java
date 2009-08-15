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

import org.asteriskjava.util.AstUtil;

import java.io.Serializable;

/**
 * Represents a Caller*ID containing name and number.
 * <p/>
 * Objects of this type are immutable.
 *
 * @author srt
 * @version $Id: CallerId.java 1286 2009-04-04 09:40:40Z srt $
 * @since 0.3
 */
public class CallerId implements Serializable
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 6498024163374551005L;
    private final String name;
    private final String number;

    /**
     * Creates a new CallerId.
     *
     * @param name   the Caller*ID name.
     * @param number the Caller*ID number.
     */
    public CallerId(String name, String number)
    {
        this.name = (AstUtil.isNull(name)) ? null : name;
        this.number = (AstUtil.isNull(number)) ? null : number;
    }

    /**
     * Returns the Caller*ID name.
     *
     * @return the Caller*ID name.
     */
    public String getName()
    {
        return name;
    }

    /**
     * Returns the the Caller*ID number.
     *
     * @return the Caller*ID number.
     */
    public String getNumber()
    {
        return number;
    }

    /**
     * Parses a caller id string in the form
     * <code>"Some Name" &lt;1234&gt;</code> to a CallerId object.
     *
     * @param s the caller id string to parse.
     * @return the corresponding CallerId object which is never <code>null</code>.
     * @see AstUtil#parseCallerId(String)
     */
    public static CallerId valueOf(String s)
    {
        final String[] parsedCallerId;

        parsedCallerId = AstUtil.parseCallerId(s);
        return new CallerId(parsedCallerId[0], parsedCallerId[1]);
    }

    /**
     * Returns a string representation of this CallerId in the form
     * <code>"Some Name" &lt;1234&gt;</code>.
     */
    @Override
    public String toString()
    {
        final StringBuilder sb;

        sb = new StringBuilder();
        if (name != null)
        {
            sb.append("\"");
            sb.append(name);
            sb.append("\"");
            if (number != null)
            {
                sb.append(" ");
            }
        }

        if (number != null)
        {
            sb.append("<");
            sb.append(number);
            sb.append(">");
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o)
        {
            return true;
        }
        if (o == null || getClass() != o.getClass())
        {
            return false;
        }

        CallerId callerId = (CallerId) o;

        if (name != null ? !name.equals(callerId.name) : callerId.name != null)
        {
            return false;
        }
        if (number != null ? !number.equals(callerId.number) : callerId.number != null)
        {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode()
    {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (number != null ? number.hashCode() : 0);
        return result;
    }
}

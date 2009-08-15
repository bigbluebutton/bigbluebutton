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
package org.asteriskjava.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

/**
 * Utility class to obtain the current date and allows to override with a fixed
 * value for unit testing. Includes some convenience methods for date
 * conversion.
 * <p>
 * Client code is not supposed to use this class.
 * 
 * @author srt
 * @version $Id: DateUtil.java 1314 2009-05-28 12:24:54Z srt $
 */
public class DateUtil
{
    private static final String DATE_TIME_PATTERN = "yy-MM-dd HH:mm:ss";

    private static Date currentDate;

    private DateUtil()
    {
        // hide constructor
    }

    /**
     * If set to a non null value uses the date given as current date on calls
     * to getDate(). Set to null to restore the normal behavior.
     * 
     * @param currentDate the date to return on calls to getDate() or
     *            <code>null</code> to return the real current date.
     */
    public static void overrideCurrentDate(Date currentDate)
    {
        DateUtil.currentDate = currentDate;
    }

    /**
     * Returns the real current date or the date set with overrideCurrentDate().
     * 
     * @return the real current date or the date set with overrideCurrentDate().
     */
    public static Date getDate()
    {
        if (currentDate == null)
        {
            return new Date();
        }
        else
        {
            return currentDate;
        }
    }

    /**
     * Converts a date in the form of "yy-MM-dd HH:mm:ss" to a Date object using
     * the default time zone.
     * 
     * @param s date string in the form of "yy-MM-dd HH:mm:ss"
     * @return the corresponding Java date object or <code>null</code> if it is not parsable.
     */
    public static Date parseDateTime(String s)
    {
        return parseDateTime(s, null);
    }

    /**
     * Converts a date in the form of "yy-MM-dd HH:mm:ss" to a Date object using
     * the given time zone.
     * 
     * @param s date string in the form of "yy-MM-dd HH:mm:ss"
     * @param tz the timezone to use or <code>null</code> for the default time zone.
     * @return the corresponding Java date object or <code>null</code> if it is not parsable.
     */
    public static Date parseDateTime(String s, TimeZone tz)
    {
        DateFormat df;

        if (s == null)
        {
            return null;
        }

        df = new SimpleDateFormat(DATE_TIME_PATTERN);
        if (tz != null)
        {
            df.setTimeZone(tz);
        }
        try
        {
            return df.parse(s);
        }
        catch (ParseException e)
        {
            return null;
        }
    }
}

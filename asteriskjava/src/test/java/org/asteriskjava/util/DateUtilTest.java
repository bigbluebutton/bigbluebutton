package org.asteriskjava.util;

import java.util.TimeZone;
import java.util.Date;

import junit.framework.TestCase;

public class DateUtilTest extends TestCase
{
    TimeZone defaultTimeZone;
    final String dateString = "2006-05-19 11:54:48";

    @Override
    protected void setUp() throws Exception
    {
        defaultTimeZone = TimeZone.getDefault();
        TimeZone.setDefault(TimeZone.getTimeZone("GMT"));
    }

    @Override
    protected void tearDown() throws Exception
    {
        TimeZone.setDefault(defaultTimeZone);
    }

    public void testGetStartTimeAsDate()
    {
        final Date result = DateUtil.parseDateTime(dateString);
        assertEquals(1148039688000L, result.getTime());
        assertEquals("Fri May 19 11:54:48 GMT 2006", result.toString());
    }

    public void testGetStartTimeAsDateWithTimeZone()
    {
        final TimeZone tz = TimeZone.getTimeZone("GMT+2");
        final Date result = DateUtil.parseDateTime(dateString, tz);
        assertEquals(1148032488000L, result.getTime());
        assertEquals("Fri May 19 09:54:48 GMT 2006", result.toString());
    }
}

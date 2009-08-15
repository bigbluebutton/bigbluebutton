package org.asteriskjava.manager.response;

import junit.framework.TestCase;

import java.util.TimeZone;

public class CoreStatusResponseTest extends TestCase
{
    private TimeZone tz = TimeZone.getTimeZone("Europe/Berlin");
    private CoreStatusResponse response;
    private TimeZone defaultTimeZone;

    @Override
    protected void setUp() throws Exception
    {
        this.response = new CoreStatusResponse();
        defaultTimeZone = TimeZone.getDefault();
        TimeZone.setDefault(tz);
    }

    @Override
    protected void tearDown() throws Exception
    {
        TimeZone.setDefault(defaultTimeZone);
    }

    public void testGetCoreStartupTimeAsDate()
    {
        assertNotNull("TimeZone not found", tz);
        response.setCoreStartupDate("2009-05-27");
        response.setCoreStartupTime("02:49:15");

        assertEquals("Wed May 27 02:49:15 CEST 2009", response.getCoreStartupDateTimeAsDate(tz).toString());
    }

    public void testGetCoreStartupTimeAsDateIfDateIsNull()
    {
        assertNotNull("TimeZone not found", tz);
        response.setCoreStartupDate(null); // before Asterisk 1.6.2
        response.setCoreStartupTime("02:49:15");

        assertNull(response.getCoreStartupDateTimeAsDate(tz));
    }
}

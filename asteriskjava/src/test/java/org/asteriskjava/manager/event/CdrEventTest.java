package org.asteriskjava.manager.event;

import java.util.TimeZone;

import junit.framework.TestCase;

public class CdrEventTest extends TestCase
{
    CdrEvent cdrEvent;
    TimeZone defaultTimeZone;
    
    @Override
    protected void setUp() throws Exception
    {
        cdrEvent = new CdrEvent(this);
        cdrEvent.setStartTime("2006-05-19 11:54:48");
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
        assertEquals(1148039688000L, cdrEvent.getStartTimeAsDate().getTime());
    }

    public void testGetStartTimeAsDateWithTimeZone()
    {
        TimeZone tz = TimeZone.getTimeZone("GMT+2");
        assertEquals(1148032488000L, cdrEvent.getStartTimeAsDate(tz).getTime());
    }

    public void testBug()
    {
        TimeZone.setDefault(TimeZone.getTimeZone("Europe/Monaco"));
        
        cdrEvent.setStartTime("2006-05-29 13:17:21");
        assertEquals("Mon May 29 13:17:21 CEST 2006", cdrEvent.getStartTimeAsDate().toString());
    }
}

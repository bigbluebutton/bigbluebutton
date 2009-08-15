package org.asteriskjava.manager.event;

import junit.framework.TestCase;

public class RtcpReceivedEventTest extends TestCase
{
    private RtcpReceivedEvent rtcpReceivedEvent;

    @Override
    public void setUp()
    {
        rtcpReceivedEvent = new RtcpReceivedEvent(this);
    }

    public void testFrom()
    {
        rtcpReceivedEvent.setFrom("192.168.0.1:1234");
        assertEquals("192.168.0.1", rtcpReceivedEvent.getFromAddress().getHostAddress());
        assertEquals(new Integer(1234), rtcpReceivedEvent.getFromPort());
    }

    public void testPt()
    {
        rtcpReceivedEvent.setPt("200(Sender Report)");
        assertEquals(new Long(200), rtcpReceivedEvent.getPt());
        assertEquals(new Long(RtcpReceivedEvent.PT_SENDER_REPORT), rtcpReceivedEvent.getPt());
    }

    public void testDlSr()
    {
        rtcpReceivedEvent.setDlSr("1.2345(sec)");
        assertEquals(1.2345, rtcpReceivedEvent.getDlSr());
    }

    public void testDlSrWithSpace()
    {
        rtcpReceivedEvent.setDlSr("1.2345 (sec)"); // as used in RTCPSent
        assertEquals(1.2345, rtcpReceivedEvent.getDlSr());
    }

    public void testRtt()
    {
        rtcpReceivedEvent.setRtt("12345(sec)");
        assertEquals(new Long(12345), rtcpReceivedEvent.getRtt());
    }
}
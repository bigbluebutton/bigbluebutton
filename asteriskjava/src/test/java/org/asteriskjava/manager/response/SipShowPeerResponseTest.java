package org.asteriskjava.manager.response;

import junit.framework.TestCase;

public class SipShowPeerResponseTest extends TestCase
{
    private SipShowPeerResponse response;
    
    @Override
   public void setUp()
    {
        response = new SipShowPeerResponse();
    }
    
    public void testSetQualifyFreq()
    {
        response.setQualifyFreq("6000 ms");
        assertEquals("Incorrect qualifyFreq", 6000, (int) response.getQualifyFreq());
    }

    public void testSetQualifyFreqWithWorkaround()
    {
        response.setQualifyFreq(": 6000 ms\n");
        assertEquals("Incorrect qualifyFreq", 6000, (int) response.getQualifyFreq());
    }

    public void testSetQualifyFreqWithWorkaroundAndChanVariable()
    {
        response.setQualifyFreq(": 60000 ms\nChanVariable:\n PHBX_ID,191");
        assertEquals("Incorrect qualifyFreq", 60000, (int) response.getQualifyFreq());
    }
}

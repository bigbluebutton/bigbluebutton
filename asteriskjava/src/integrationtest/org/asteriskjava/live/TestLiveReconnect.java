/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

/**
 * @author srt
 * @version $Id: TestLiveReconnect.java 938 2007-12-31 03:23:38Z srt $
 */
public class TestLiveReconnect extends AsteriskServerTestCase
{
    public void testLiveReconnect() throws Exception
    {
        System.out.println("Please stop and restart the Asterisk server...");
        while (true)
        {
            Thread.sleep(300000);
        }
    }
}

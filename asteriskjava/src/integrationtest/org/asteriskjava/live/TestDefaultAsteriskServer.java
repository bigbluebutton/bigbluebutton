/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

import java.util.Arrays;
import java.util.Collection;


/**
 * @author srt
 * @version $Id: TestDefaultAsteriskServer.java 1087 2008-08-08 19:22:24Z srt $
 */
public class TestDefaultAsteriskServer extends AsteriskServerTestCase
{
    public void testGetChannels() throws Exception
    {
        System.out.println("waiting for channels...");

        try
        {
            Thread.sleep(10000);
        }
        catch (InterruptedException e)
        {
        }

        Collection<AsteriskChannel> channels = server.getChannels();

        System.out.println("got channels. waiting to hangup...");

        try
        {
            Thread.sleep(1000);
        }
        catch (InterruptedException e)
        {
        }

        for (AsteriskChannel channel : channels)
        {
            if (!channel.getName().startsWith("SIP/1310"))
            {
                continue;
            }

            System.out.println(channel);
            try
            {
                channel.redirectBothLegs("default", "1399", 1);
                //channel.hangup();
            }
            catch (NoSuchChannelException e)
            {
                System.out.println(e.getMessage());
            }
        }
    }

    public void XtestGetQueues() throws Exception
    {
        System.out.println("waiting for queues...");
        
        try
        {
            Thread.sleep(10000);
        }
        catch (InterruptedException e)
        {
            // swallow
        }

        Collection<AsteriskQueue> queues = server.getQueues();
        for (AsteriskQueue queue : queues)
        {
            System.out.println(queue);
        }
    }

    public void testGetVersion() throws Exception
    {
        System.out.println(Arrays.toString(server.getVersion("cdr_manager.c")));
        System.out.println(server.getVersion());
    }
}

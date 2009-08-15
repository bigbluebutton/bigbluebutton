/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

import java.util.Collection;

/**
 * @author srt
 * @version $Id: TestExtensionHistory.java 938 2007-12-31 03:23:38Z srt $
 */
public class TestExtensionHistory extends AsteriskServerTestCase
{
    public void testGetHistory() throws Exception
    {
        Collection<AsteriskChannel> channels;
        
        try
        {
            Thread.sleep(5000);
        }
        catch (InterruptedException e)
        {
        }

        channels = server.getChannels();
        System.out.println("# of active channels: " + channels.size());
        for (AsteriskChannel channel : channels)
        {
            System.out.println(channel);
            System.out.println("  first extension: " + channel.getFirstExtension());
            System.out.println("  current extension: " + channel.getCurrentExtension());

            for (ExtensionHistoryEntry extensionHistoryEntry : channel.getExtensionHistory())
            {
                System.out.println("  " + extensionHistoryEntry);
            }
        }
    }
}

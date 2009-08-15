/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @author srt
 * @version $Id: OriginateCauseTest.java 938 2007-12-31 03:23:38Z srt $
 */
public class OriginateCauseTest extends AsteriskServerTestCase
{
    private AsteriskChannel channel;
    private Long timeout = 10000L;

    @Override
    public void setUp() throws Exception
    {
        super.setUp();
        this.channel = null;
    }

    public void xtestOriginateInvalidSourceChannel() throws Exception
    {
        try
        {
            server.originateToExtension("Local/none@aj-test", "aj-test", "answer", 1, timeout);
            fail("Originating from an invalid source channel must throw a NoSuchChannelException");
        }
        catch (NoSuchChannelException e)
        {
            // ok
        }
    }

    public void testOriginate() throws Exception
    {
        AsteriskChannel channel;

        channel = server.originateToExtension("Local/answer@aj-test", "aj-test-delayed", "answer", 1, timeout);
        System.err.println(channel);

        Thread.sleep(20000L);
        System.err.println(channel);
    }

    public void xtestOriginateAsync() throws Exception
    {
        final String source;

        //source = "SIP/1310";
        source = "Local/1337@from-local";
        // source = "Local/1310@from-local/n";
        server.originateToExtensionAsync(source, "conference", "1399", 1, timeout, new CallerId("AJ Test Call",
                "08003301000"), null, new OriginateCallback()
        {
            public void onDialing(final AsteriskChannel c)
            {
                channel = c;
                System.err.println("Dialing: " + channel);
                channel.addPropertyChangeListener(new PropertyChangeListener()
                {
                    public void propertyChange(PropertyChangeEvent evt)
                    {
                        System.err.println("PropertyChange (" + ((AsteriskChannel) evt.getSource()).getName() + ") " + evt.getPropertyName() + ": " + evt.getOldValue() + " => " + evt.getNewValue());
                    }
                });
                ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
                scheduler.schedule(new Runnable()
                {
                    public void run()
                    {
                        System.out.println("Tata");
                        try
                        {
                            c.hangup();
                        }
                        catch (Exception e)
                        {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                    }
                }, 10, TimeUnit.SECONDS);
            }

            public void onSuccess(AsteriskChannel c)
            {
                channel = c;
                System.err.println("Success: " + c);
                showInfo(c);
                try
                {
                    /*
                    c.setVariable(AsteriskChannel.VARIABLE_MONITOR_EXEC, "/usr/local/bin/2wav2mp3");
                    c.setVariable(AsteriskChannel.VARIABLE_MONITOR_EXEC_ARGS, "a b");
                    c.startMonitoring("mtest", "wav", true);
                    Thread.sleep(10000L);
                    c.stopMonitoring();
                    c.setAbsoluteTimeout(20);
                    */
                }
                catch (Exception e)
                {
                    e.printStackTrace();
                }
            }

            public void onNoAnswer(AsteriskChannel c)
            {
                channel = c;
                System.err.println("No Answer: " + c);
                showInfo(c);
            }

            public void onBusy(AsteriskChannel c)
            {
                channel = c;
                System.err.println("Busy: " + c);
                showInfo(c);
            }

            public void onFailure(LiveException cause)
            {
                System.err.println("Failed: " + cause.getMessage());
            }
        });

        Thread.sleep(20000L);
        System.err.println("final state: " + channel);
        if (channel != null)
        {
            System.err.println("final state linked channels: " + channel.getLinkedChannelHistory());
        }
    }

    void showInfo(AsteriskChannel channel)
    {
        String name;
        String otherName;
        AsteriskChannel otherChannel;

        System.err.println("linkedChannelHistory: " + channel.getLinkedChannelHistory());
        System.err.println("dialedChannelHistory: " + channel.getDialedChannelHistory());

        name = channel.getName();
        if (name.startsWith("Local/"))
        {
            otherName = name.substring(0, name.length() - 1) + "2";
            System.err.println("other name: " + otherName);
            try
            {
                otherChannel = server.getChannelByName(otherName);
            }
            catch (ManagerCommunicationException e)
            {
                e.printStackTrace();
                return;
            }
            System.err.println("other channel: " + otherChannel);
            System.err.println("other dialedChannel: " + otherChannel.getDialedChannel());
            System.err.println("other linkedChannelHistory: " + otherChannel.getLinkedChannelHistory());
            System.err.println("other dialedChannelHistory: " + otherChannel.getDialedChannelHistory());
        }
    }
}

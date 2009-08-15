/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;


/**
 * @author srt
 * @version $Id: OriginateCauseAsyncTest.java 938 2007-12-31 03:23:38Z srt $
 */
public class OriginateCauseAsyncTest extends AsteriskServerTestCase
{
    private MyStatus status;
    private MyOriginateCallback cb;
    private Long timeout = 10000L;

    @Override
    public void setUp() throws Exception
    {
        super.setUp();
        status = new MyStatus();
        cb = new MyOriginateCallback();
    }

    public void testOriginateFailure() throws Exception
    {
        synchronized (status)
        {
            server.originateToExtensionAsync("Local/none@aj-test", "aj-test", "answer", 1, timeout, cb);
            status.wait();
            assertNotNull(status.failureException);
        }
    }

    public void testOriginateSuccess() throws Exception
    {
        synchronized (status)
        {
            server.originateToExtensionAsync("Local/answer@aj-test", "aj-test", "answer", 1, timeout, cb);
            status.wait();
            status.print();
            assertNotNull(status.dialingChannel);
            assertNotNull(status.successChannel);
        }
    }

    public void testOriginateBusy() throws Exception
    {
        synchronized (status)
        {
            server.originateToExtensionAsync("Local/busy@aj-test", "aj-test", "answer", 1, timeout, cb);
            status.wait();
            status.print();
            assertNotNull(status.busyChannel);
        }
    }

    public void testOriginateCongestion() throws Exception
    {
        synchronized (status)
        {
            server.originateToExtensionAsync("Local/congestion@aj-test", "aj-test", "answer", 1, timeout, cb);
            status.wait();
            status.print();
            // congestion is treated like busy
            assertNotNull(status.busyChannel);
        }
    }

    public void testOriginateNoAnswer() throws Exception
    {
        synchronized (status)
        {
            server.originateToExtensionAsync("Local/noanswer@aj-test", "aj-test", "answer", 1, timeout, cb);
            status.wait();
            status.print();
            assertNotNull(status.noAnswerChannel);
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

    class MyOriginateCallback implements OriginateCallback
    {
        boolean sealed = false;

        public void onDialing(AsteriskChannel channel)
        {
            status.dialingChannel = channel;
        }

        public void onFailure(LiveException cause)
        {
            status.failureException = cause;
            doNotify();
        }

        public void onBusy(AsteriskChannel channel)
        {
            status.busyChannel = channel;
            doNotify();
        }

        public void onNoAnswer(AsteriskChannel channel)
        {
            status.noAnswerChannel = channel;
            doNotify();
        }

        public void onSuccess(AsteriskChannel channel)
        {
            status.successChannel = channel;
            doNotify();
        }

        void doNotify()
        {
            if (sealed)
            {
                System.err.println("!!! Modifying sealed status !!!");
            }

            sealed = true;
            synchronized (status)
            {
                status.notify();
            }
        }
    }

    class MyStatus
    {
        AsteriskChannel dialingChannel;
        AsteriskChannel busyChannel;
        AsteriskChannel noAnswerChannel;
        AsteriskChannel successChannel;
        LiveException failureException;

        void print()
        {
            System.out.println("dialing  = " + dialingChannel);
            System.out.println("busy     = " + busyChannel);
            System.out.println("noAnswer = " + noAnswerChannel);
            System.out.println("success  = " + successChannel);
            System.out.println("failure  = " + failureException);
        }
    }
}

/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Sep 24, 2004
 */
package org.asteriskjava.manager;

import java.util.concurrent.atomic.AtomicInteger;

import junit.framework.TestCase;

import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.event.ManagerEvent;

/**
 * @author srt
 * @version $Id: TestConcurrentUseOfDefaultManagerConnection.java 938 2007-12-31 03:23:38Z srt $
 */
public class TestConcurrentUseOfDefaultManagerConnection extends TestCase
{
    private static final int NUM_THREADS = 400;
    private static final int NUM_LOOPS = 200;
    private DefaultManagerConnection dmc;
    private AtomicInteger succeeded;
    private AtomicInteger failed;
    private AtomicInteger total;
    
    @Override
    protected void setUp() throws Exception
    {
        dmc = new DefaultManagerConnection();
        dmc.setUsername("manager");
        dmc.setPassword("obelisk");
        dmc.setHostname("pbx0");
        
        succeeded = new AtomicInteger(0);
        failed = new AtomicInteger(0);
        total = new AtomicInteger(0);
        
        dmc.login();
    }

    @Override
    protected void tearDown() throws Exception
    {
        dmc.logoff();
    }

    public void testConcurrency() throws Exception
    {
        Thread[] threads = new Thread[NUM_THREADS];
        long start;
        long end;
        
        dmc.addEventListener(new ManagerEventListener()
        {
            public void onManagerEvent(ManagerEvent event)
            {
                //System.out.println("Got event: " + event);
            }
        });
        dmc.setDefaultEventTimeout(20000);
        dmc.setDefaultResponseTimeout(20000);

        for (int i = 0; i < NUM_THREADS; i++)
        {
            threads[i] = new Thread(new Sender());
            threads[i].setName("Sender-" + i);
        }

        start = System.currentTimeMillis();
        for (int i = 0; i < NUM_THREADS; i++)
        {
            threads[i].start();
        }
        
        for (int i = 0; i < NUM_THREADS; i++)
        {
            threads[i].join();
        }
        end = System.currentTimeMillis();
        
        Thread.sleep(1000);

        System.out.println("succeeded: " + succeeded);
        System.out.println("failed:    " + failed);
        System.out.println("total:     " + total);
        System.out.println("duration:  " + (end - start));
        
        assertEquals("failed actions", 0, failed.get());
    }

    private class Sender implements Runnable
    {
        public void run()
        {
            for (int i = 0; i < NUM_LOOPS; i++)
            {
                int id = total.getAndIncrement();
                String actionId = "A_" + id;
                try
                {
                    /*
                    PingAction a = new PingAction();
                    a.setActionId(actionId);
                    dmc.sendAction(a);
                    succeeded.getAndIncrement();
                    */
                    
                    ResponseEvents responseEvents;
                    StatusAction a = new StatusAction();
                    a.setActionId(actionId);
                    responseEvents = dmc.sendEventGeneratingAction(a);
                    if (responseEvents.getEvents().size() == 2)
                    {
                        succeeded.getAndIncrement();
                    }
                    else
                    {
                        failed.getAndIncrement();
                    }
                }
                catch (Exception e)
                {
                    failed.getAndIncrement();
                    System.err.println("Error for " + actionId);
                    e.printStackTrace();
                }
            }
        }
    }
}

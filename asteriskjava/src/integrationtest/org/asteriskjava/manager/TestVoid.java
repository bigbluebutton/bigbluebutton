/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Sep 24, 2004
 */
package org.asteriskjava.manager;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;

import junit.framework.TestCase;

/**
 * @author srt
 * @version $Id: TestVoid.java 981 2008-02-14 03:44:49Z srt $
 */
public class TestVoid extends TestCase
{
    private DefaultManagerConnection getDefaultManagerConnection()
    {
        DefaultManagerConnection dmc;

        dmc = new DefaultManagerConnection();
        dmc.setUsername("manager");
        dmc.setPassword("obelisk");
        dmc.setHostname("pbx0.cologne.reucon.net");
        dmc.setPort(5038);

        return dmc;
    }

    public void testPrintEvents() throws Exception
    {
        DefaultManagerConnection dmc;

        dmc = getDefaultManagerConnection();
        dmc.login();
        dmc.addEventListener(new ManagerEventListener()
        {
            public void onManagerEvent(ManagerEvent event)
            {
                System.out.println("Got event: " + event);
            }
        });
        // dmc.sendAction(new StatusAction());

        Thread.sleep(30000);
        dmc.logoff();
    }
}
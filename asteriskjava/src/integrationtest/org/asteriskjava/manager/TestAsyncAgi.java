/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Sep 24, 2004
 */
package org.asteriskjava.manager;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.action.VoicemailUsersListAction;
import org.asteriskjava.manager.action.AgiAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.AsyncAgiEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerResponse;

import junit.framework.TestCase;

import java.util.Iterator;

/**
 * @author srt
 * @version $Id: TestAsyncAgi.java 956 2008-02-02 14:08:11Z srt $
 */
public class TestAsyncAgi extends AbstractManagerTestCase
{
    public void testDialplanShow() throws Exception
    {
        DefaultManagerConnection managerConnection;

        managerConnection = getDefaultManagerConnection();
        managerConnection.login();

        CommandAction commandAction = new CommandAction("sip show peers");
        ManagerResponse response = managerConnection.sendAction(commandAction);
        if (response instanceof CommandResponse)
        {
            for (String item : ((CommandResponse) response).getResult())
            {
                System.out.println(item);
            }
        }
    }

    public void testAgiAction() throws Exception
    {
        DefaultManagerConnection dmc;

        dmc = getDefaultManagerConnection();
        dmc.addEventListener(new ManagerEventListener()
        {
            public void onManagerEvent(ManagerEvent event)
            {
                System.out.println("Got event: " + event);
                if (event instanceof AsyncAgiEvent)
                {
                    System.out.println("Decoded env: " + ((AsyncAgiEvent) event).decodeEnv());
                }
            }
        });
        dmc.login();
        System.out.println("Dial 1296");
        Thread.sleep(5000);
        ManagerResponse response = dmc.sendAction(new AgiAction(
                "IAX2/iax0-cgn_reucon_net-2",
                "EXEC Playback tt-monkeysintro",
                "myCommandId"));
        System.out.println(response);

        // wait to receive events
        Thread.sleep(20000);
        dmc.logoff();
        Thread.sleep(3000);
    }
}
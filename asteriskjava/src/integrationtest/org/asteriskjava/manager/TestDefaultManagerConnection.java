/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Sep 24, 2004
 */
package org.asteriskjava.manager;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.action.SipShowPeerAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.SipShowPeerResponse;

import junit.framework.TestCase;

/**
 * @author srt
 * @version $Id: TestDefaultManagerConnection.java 1242 2009-03-09 15:49:12Z srt $
 */
public class TestDefaultManagerConnection extends TestCase
{
    private DefaultManagerConnection getDefaultManagerConnection()
    {
        DefaultManagerConnection dmc;

        dmc = new DefaultManagerConnection();
        dmc.setUsername("manager");
        dmc.setPassword("obelisk");
        dmc.setHostname("pbx0.reucon.net");
        dmc.setPort(5038);
        //dmc.setSsl(true);

        return dmc;
    }

    public void XtestLogin() throws Exception
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
        dmc.sendAction(new StatusAction());

        // wait for 3 seconds to receive events
        Thread.sleep(3000);
        dmc.logoff();
    }

    public void testMultipleLogins() throws Exception
    {
        DefaultManagerConnection dmc;
        CommandResponse response;

        dmc = getDefaultManagerConnection();
        dmc.setDefaultResponseTimeout(5000);

        for (int i = 0; i < 10; i++)
        {
            dmc.login();
            response = (CommandResponse) dmc.sendAction(new CommandAction("show version"));
            assertTrue("version does not start with \"Asterisk\"", response.getResult().get(0).startsWith("Asterisk"));
            dmc.logoff();
        }
    }

    public void testLoginAuthenticationFailure() throws Exception
    {
        DefaultManagerConnection dmc;

        dmc = getDefaultManagerConnection();
        dmc.setPassword("");
        
        try
        {
            dmc.login();
            dmc.logoff();
            fail("No AuthenticationFailedException received.");
        }
        catch (AuthenticationFailedException e)
        {
        }
    }

    public void testCommandAction() throws Exception
    {
        DefaultManagerConnection dmc;
        CommandResponse response;

        dmc = getDefaultManagerConnection();
        dmc.login();
        
        response = (CommandResponse) dmc.sendAction(new CommandAction("show voicemail users"));
        System.out.println("Got response: " + response.getResult());
        
        dmc.logoff();
    }

    public void testSipShowPeerAction() throws Exception
    {
        DefaultManagerConnection dmc;
        SipShowPeerResponse response;

        dmc = getDefaultManagerConnection();
        dmc.login();

        response = (SipShowPeerResponse) dmc.sendAction(new SipShowPeerAction("phone-02"));
        System.out.println("Got response: " + response);

        dmc.logoff();
    }
}

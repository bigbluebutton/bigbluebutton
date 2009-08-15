/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Sep 24, 2004
 */
package org.asteriskjava.manager;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.action.VoicemailUsersListAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;

import junit.framework.TestCase;

/**
 * @author srt
 * @version $Id: TestVoicemailUsersListAction.java 947 2008-01-30 03:04:07Z srt $
 */
public class TestVoicemailUsersListAction extends AbstractManagerTestCase
{
    public void testVoicemailUsersListAction() throws Exception
    {
        DefaultManagerConnection dmc;

        dmc = getDefaultManagerConnection();
        dmc.login();
        ResponseEvents events = dmc.sendEventGeneratingAction(new VoicemailUsersListAction());

        System.out.println(events.getResponse());
        for (ManagerEvent event : events.getEvents())
        {
            System.out.println(event);
        }

        // wait for 3 seconds to receive events
        Thread.sleep(3000);
        dmc.logoff();
    }
}
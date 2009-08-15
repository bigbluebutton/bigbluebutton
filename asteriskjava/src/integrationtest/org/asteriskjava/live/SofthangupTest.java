/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

import org.asteriskjava.manager.action.OriginateAction;

/**
 * @author srt
 * @version $Id: SofthangupTest.java 1087 2008-08-08 19:22:24Z srt $
 */
public class SofthangupTest extends AsteriskServerTestCase
{
    public void testSofthangup() throws Exception
    {
        OriginateAction originate;
        
        originate = new OriginateAction();
        originate.setChannel("Local/1310");
        originate.setContext("default");
        originate.setExten("1340");
        originate.setPriority(1);
        
        //ManagerResponse response = managerConnection.sendAction(originate);
        //System.out.println("Response: " + response);
        
        Thread.sleep(10000);
    }
}

package org.asteriskjava.manager;

import junit.framework.TestCase;

public abstract class AbstractManagerTestCase extends TestCase
{
    protected DefaultManagerConnection getDefaultManagerConnection()
    {
        DefaultManagerConnection dmc;

        dmc = new DefaultManagerConnection();
        dmc.setUsername("manager");
        dmc.setPassword("obelisk");
        dmc.setHostname("10.12.0.1");
        dmc.setPort(5038);

        return dmc;
    }
}

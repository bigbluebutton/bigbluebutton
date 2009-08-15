package org.asteriskjava.manager.event;

import junit.framework.TestCase;

public class NewStateEventTest extends TestCase
{
    private NewStateEvent newStateEvent;

    @Override
    public void setUp()
    {
        newStateEvent = new NewStateEvent(this);
    }

    public void testWithState()
    {
        newStateEvent.setState("Ring");
        assertEquals(new Integer(4), newStateEvent.getChannelState());
        assertEquals("Ring", newStateEvent.getChannelStateDesc());
    }

    public void testWithUnknownState()
    {
        newStateEvent.setState("Unknown (4)");
        assertEquals(new Integer(4), newStateEvent.getChannelState());
    }
}
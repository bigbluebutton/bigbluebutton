package org.asteriskjava.live;

import junit.framework.TestCase;

public class QueueMemberStateTest extends TestCase
{
    public void testValueOf()
    {
        assertEquals(QueueMemberState.DEVICE_INUSE, QueueMemberState.valueOf("DEVICE_INUSE"));
        assertEquals(QueueMemberState.DEVICE_INUSE, QueueMemberState.valueOf(2));
    }

    public void testToString()
    {
        assertEquals("DEVICE_INUSE", QueueMemberState.DEVICE_INUSE.toString());
    }
}

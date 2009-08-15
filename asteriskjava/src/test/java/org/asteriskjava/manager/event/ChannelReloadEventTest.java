package org.asteriskjava.manager.event;

import junit.framework.TestCase;

public class ChannelReloadEventTest extends TestCase
{
    private ChannelReloadEvent event;

    @Override
    protected void setUp() throws Exception
    {
        super.setUp();
        this.event = new ChannelReloadEvent(this);
    }

    public void testNullReloadReason()
    {
        event.setReloadReason(null);
        assertNull(event.getReloadReasonCode());
        assertNull(event.getReloadReasonDescription());
    }

    public void testGetReloadReasonCode()
    {
        event.setReloadReason("CLIRELOAD (Channel module reload by CLI command)");
        assertEquals("CLIRELOAD", event.getReloadReasonCode());
        assertEquals(ChannelReloadEvent.REASON_CLI_RELOAD, event.getReloadReasonCode());
    }

    public void testGetReloadReasonDescription()
    {
        event.setReloadReason("CLIRELOAD (Channel module reload by CLI command)");
        assertEquals("Channel module reload by CLI command", event.getReloadReasonDescription());
    }
}

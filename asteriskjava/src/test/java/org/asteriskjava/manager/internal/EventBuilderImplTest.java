/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.manager.internal;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

import junit.framework.TestCase;

import org.asteriskjava.manager.event.*;

public class EventBuilderImplTest extends TestCase
{
    private EventBuilder eventBuilder;
    private Map<String, Object> properties;

    @Override
    public void setUp()
    {
        this.eventBuilder = new EventBuilderImpl();
        this.properties = new HashMap<String, Object>();
    }

    public void testRegisterEvent()
    {
        eventBuilder.registerEventClass(NewChannelEvent.class);
    }

    public void testRegisterUserEventWithA()
    {
        ManagerEvent event;

        eventBuilder.registerEventClass(A.class);
        properties.put("event", "UserEventA");
        event = eventBuilder.buildEvent(this, properties);

        assertTrue("Wrong type", event instanceof A);
    }

    public void testRegisterUserEventWithBEvent()
    {
        ManagerEvent event;

        eventBuilder.registerEventClass(BEvent.class);
        properties.put("event", "UserEventB");
        event = eventBuilder.buildEvent(this, properties);

        assertTrue("Wrong type", event instanceof BEvent);
    }

    public void testRegisterUserEventWithUserEventC()
    {
        ManagerEvent event;

        eventBuilder.registerEventClass(UserEventC.class);
        properties.put("event", "UserEventC");
        event = eventBuilder.buildEvent(this, properties);

        assertTrue("Wrong type", event instanceof UserEventC);
    }

    public void testRegisterUserEventWithUserEventCAndAsterisk14()
    {
        ManagerEvent event;

        eventBuilder.registerEventClass(UserEventC.class);
        properties.put("event", "UserEvent");
        properties.put("userevent", "C");
        event = eventBuilder.buildEvent(this, properties);

        assertTrue("Wrong type", event instanceof UserEventC);
    }

    public void testRegisterUserEventWithUserEventDEvent()
    {
        ManagerEvent event;

        eventBuilder.registerEventClass(UserEventDEvent.class);
        properties.put("event", "UserEventD");
        event = eventBuilder.buildEvent(this, properties);

        assertTrue("Wrong type", event instanceof UserEventDEvent);
    }

    public void testRegisterEventWithAbstractEvent()
    {
        try
        {
            eventBuilder.registerEventClass(AbstractChannelEvent.class);
            fail("registerEvent() must not accept abstract classes");
        }
        catch (IllegalArgumentException ex)
        {
        }
    }

    /*
     * public void testGetSetters() { Map setters; EventBuilderImpl eventBuilder =
     * getEventBuilder(); setters =
     * eventBuilder.getSetters(NewChannelEvent.class); assertTrue("Setter not
     * found", setters.containsKey("callerid")); }
     */

    public void testBuildEventWithMixedCaseSetter()
    {
        String callerid = "1234";
        NewChannelEvent event;

        properties.put("event", "Newchannel");
        properties.put("callerid", callerid);
        event = (NewChannelEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", NewChannelEvent.class, event.getClass());
        assertEquals("String property not set correctly", callerid, event.getCallerIdNum());
        assertEquals("Source not set correctly", this, event.getSource());
    }

    public void testBuildEventWithIntegerProperty()
    {
        String channel = "SIP/1234";
        Integer priority = 1;
        NewExtenEvent event;

        properties.put("event", "newexten");
        properties.put("channel", channel);
        properties.put("priority", priority.toString());
        event = (NewExtenEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", NewExtenEvent.class, event.getClass());
        assertEquals("String property not set correctly", channel, event.getChannel());
        assertEquals("Integer property not set correctly", priority, event.getPriority());
    }

    public void testBuildEventWithBooleanProperty()
    {
        ShutdownEvent event;

        eventBuilder.registerEventClass(ShutdownEvent.class);
        properties.put("event", "shutdown");
        properties.put("restart", "True");
        event = (ShutdownEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", ShutdownEvent.class, event.getClass());
        assertEquals("Boolean property not set correctly", Boolean.TRUE, event.getRestart());
    }

    public void testBuildEventWithBooleanPropertyOfValueYes()
    {
        ShutdownEvent event;

        eventBuilder.registerEventClass(ShutdownEvent.class);
        properties.put("event", "shutdown");
        properties.put("restart", "yes");
        event = (ShutdownEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", ShutdownEvent.class, event.getClass());
        assertEquals("Boolean property not set correctly", Boolean.TRUE, event.getRestart());
    }

    public void testBuildEventWithBooleanPropertyOfValueNo()
    {
        ShutdownEvent event;

        eventBuilder.registerEventClass(ShutdownEvent.class);
        properties.put("event", "shutdown");
        properties.put("restart", "NO");
        event = (ShutdownEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", ShutdownEvent.class, event.getClass());
        assertEquals("Boolean property not set correctly", Boolean.FALSE, event.getRestart());
    }

    public void testBuildEventWithUnregisteredEvent()
    {
        ManagerEvent event;

        properties.put("event", "Nonexisting");
        event = eventBuilder.buildEvent(this, properties);

        assertNull(event);
    }

    public void testBuildEventWithEmptyAttributes()
    {
        ManagerEvent event;

        event = eventBuilder.buildEvent(this, properties);

        assertNull(event);
    }

    public void testBuildEventWithResponseEvent()
    {
        ManagerEvent event;

        properties.put("event", "StatusComplete");
        properties.put("actionid", "1234#origId");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", StatusCompleteEvent.class, event.getClass());
        assertEquals("ActionId not set correctly", "origId", ((ResponseEvent) event).getActionId());
    }

    public void testBuildEventWithSourceProperty()
    {
        ManagerEvent event;

        properties.put("event", "Cdr");
        properties.put("source", "source value");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Src property not set correctly", "source value", ((CdrEvent) event).getSrc());
    }

    public void testBuildEventWithSpecialCharacterProperty()
    {
        ManagerEvent event;

        properties.put("event", "Hangup");
        properties.put("cause-txt", "some text");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("CauseTxt property not set correctly", "some text", ((HangupEvent) event).getCauseTxt());
    }

    public void testBuildEventWithCidCallingPres()
    {
        ManagerEvent event;

        properties.put("event", "Newcallerid");
        properties.put("cid-callingpres", "123 (nice description)");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("CidCallingPres property not set correctly", Integer.valueOf(123),
                ((NewCallerIdEvent) event).getCidCallingPres());
        assertEquals("CidCallingPresTxt property not set correctly", "nice description",
                ((NewCallerIdEvent) event).getCidCallingPresTxt());
    }

    public void testBuildEventWithCidCallingPresAndEmptyTxt()
    {
        ManagerEvent event;

        properties.put("event", "Newcallerid");
        properties.put("cid-callingpres", "123 ()");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("CidCallingPres property not set correctly", Integer.valueOf(123),
                ((NewCallerIdEvent) event).getCidCallingPres());
        assertNull("CidCallingPresTxt property not set correctly (must be null)",
                ((NewCallerIdEvent) event).getCidCallingPresTxt());
    }

    public void testBuildEventWithCidCallingPresAndMissingTxt()
    {
        ManagerEvent event;

        properties.put("event", "Newcallerid");
        properties.put("cid-callingpres", "123");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("CidCallingPres property not set correctly", Integer.valueOf(123),
                ((NewCallerIdEvent) event).getCidCallingPres());
        assertNull("CidCallingPresTxt property not set correctly (must be null)",
                ((NewCallerIdEvent) event).getCidCallingPresTxt());
    }

    public void testBuildEventWithInvalidCidCallingPres()
    {
        ManagerEvent event;

        properties.put("event", "Newcallerid");
        properties.put("cid-callingpres", "abc");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertNull("CidCallingPres property not set correctly (must be null)",
                ((NewCallerIdEvent) event).getCidCallingPres());
        assertNull("CidCallingPresTxt property not set correctly (must be null)",
                ((NewCallerIdEvent) event).getCidCallingPresTxt());
    }

    public void testBuildEventWithReason()
    {
        ManagerEvent event;

        properties.put("event", "LogChannel");
        properties.put("reason", "123 - a reason");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Reason property not set correctly", Integer.valueOf(123),
                ((LogChannelEvent) event).getReason());
        assertEquals("ReasonTxt property not set correctly", "a reason",
                ((LogChannelEvent) event).getReasonTxt());
    }

    public void testBuildEventWithTimestamp()
    {
        ManagerEvent event;

        properties.put("event", "NewChannel");
        properties.put("timestamp", "1159310429.569108");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Timestamp property not set correctly", 1159310429.569108D, event.getTimestamp());
    }

    public void testBuildEventWithLong()
    {
        ManagerEvent event;

        properties.put("event", "MeetmeLeave");
        properties.put("duration", "569108");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Duration property not set correctly", new Long(569108),
                ((MeetMeLeaveEvent) event).getDuration());
    }

    public void testBuildEventWithDouble()
    {
        ManagerEvent event;

        properties.put("event", "RTPReceiverStat");
        properties.put("transit", "12.3456");
        event = eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Transit property not set correctly", 12.3456,
                ((RtpReceiverStatEvent) event).getTransit());
    }

    public void testBuildEventWithNullLiteral()
    {
        CdrEvent event;

        properties.put("event", "Cdr");
        properties.put("channel", "<none>");
        event = (CdrEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", CdrEvent.class, event.getClass());
        assertNull("Property with value \"<none>\" is not null", event.getChannel());
    }

    public void testBuildEventWithDashInPropertyName()
    {
        TransferEvent event;

        properties.put("event", "Transfer");
        properties.put("sip-callid", "12345");
        event = (TransferEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", TransferEvent.class, event.getClass());
        assertEquals("Property SIP-Callid is not set correctly", "12345", event.getSipCallId());
    }

    public void testBuildEventForRtpReceiverStatEventAJ162()
    {
        RtpReceiverStatEvent event;

        properties.put("event", "RtpReceiverStat");
        properties.put("ssrc", "3776236237");
        properties.put("receivedpackets", "0");
        event = (RtpReceiverStatEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", RtpReceiverStatEvent.class, event.getClass());
        assertEquals("Property SSRC is not set correctly", 3776236237l, (long) event.getSsrc());
    }

    public void testBuildEventForRtpReceiverStatEventAJ139()
    {
        RtpReceiverStatEvent event;

        properties.put("event", "RtpReceiverStat");
        properties.put("receivedpackets", "0");
        event = (RtpReceiverStatEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", RtpReceiverStatEvent.class, event.getClass());
        assertEquals("Property receivedPacket is not set correctly", 0, (long) event.getReceivedPackets());
    }

    public void testBuildEventWithMapProperty()
    {
        AgentCalledEvent event;

        properties.put("event", "AgentCalled");
        properties.put("variable", Arrays.asList("var1=val1", "var2=val2"));
        event = (AgentCalledEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", AgentCalledEvent.class, event.getClass());
        assertEquals("Property variables[var1] is not set correctly", "val1", event.getVariables().get("var1"));
        assertEquals("Property variables[var2] is not set correctly", "val2", event.getVariables().get("var2"));
        assertEquals("Invalid size of variables property", 2, event.getVariables().size());
    }

    public void testBuildEventWithMapPropertyAndOnlyOneEntry()
    {
        AgentCalledEvent event;

        properties.put("event", "AgentCalled");
        properties.put("variable", "var1=val1");
        event = (AgentCalledEvent) eventBuilder.buildEvent(this, properties);

        assertNotNull(event);
        assertEquals("Returned event is of wrong type", AgentCalledEvent.class, event.getClass());
        assertEquals("Property variables[var1] is not set correctly", "val1", event.getVariables().get("var1"));
        assertEquals("Invalid size of variables property", 1, event.getVariables().size());
    }

}

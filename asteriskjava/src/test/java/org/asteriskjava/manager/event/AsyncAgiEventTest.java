package org.asteriskjava.manager.event;

import junit.framework.TestCase;

import java.util.List;

public class AsyncAgiEventTest extends TestCase
{
    public void testDecodeEnv()
    {
        AsyncAgiEvent event = new AsyncAgiEvent(this);
        List<String> env;

        event.setEnv("agi_request%3a%20async\n" +
                "agi_channel%3a%20SIP%2f1312-b70020a8\n" +
                "agi_language%3a%20en\n" +
                "agi_type%3a%20SIP\n" +
                "agi_uniqueid%3a%201207271023.41\n" +
                "agi_version%3a%20SVN-branch-1.6.0-r110832\n" +
                "agi_callerid%3a%201312\n" +
                "agi_calleridname%3a%20Stefan%20Reuter\n" +
                "agi_callingpres%3a%200\n" +
                "agi_callingani2%3a%200\n" +
                "agi_callington%3a%200\n" +
                "agi_callingtns%3a%200\n" +
                "agi_dnid%3a%203115\n" +
                "agi_rdnis%3a%20unknown\n" +
                "agi_context%3a%20from-local\n" +
                "agi_extension%3a%203115\n" +
                "agi_priority%3a%201\n" +
                "agi_enhanced%3a%200.0\n" +
                "agi_accountcode%3a%20\n" +
                "agi_threadid%3a%20-1231783024\n");

        env = event.decodeEnv();
        assertEquals("agi_calleridname: Stefan Reuter", env.get(7));
        assertEquals("agi_threadid: -1231783024", env.get(19));
    }

    public void testDecodeEnvWithMoreThanTwoDelimiters()
    {
        AsyncAgiEvent event = new AsyncAgiEvent(this);
        List<String> env;

        event.setEnv("agi_request%3a%20async%3a%20bla\n");

        env = event.decodeEnv();
        assertEquals("agi_request: async: bla", env.get(0));
    }
}

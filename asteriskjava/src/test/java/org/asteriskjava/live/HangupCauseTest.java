package org.asteriskjava.live;

import junit.framework.TestCase;

public class HangupCauseTest extends TestCase
{
    public void testGetByCode()
    {
        assertEquals("Valid enum for cause code 18", HangupCause.AST_CAUSE_NO_USER_RESPONSE, HangupCause.getByCode(18));
    }
}

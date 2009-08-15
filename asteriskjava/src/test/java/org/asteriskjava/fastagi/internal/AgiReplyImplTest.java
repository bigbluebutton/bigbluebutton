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
package org.asteriskjava.fastagi.internal;

import java.util.ArrayList;
import java.util.List;

import junit.framework.TestCase;

import org.asteriskjava.fastagi.internal.AgiReplyImpl;

public class AgiReplyImplTest extends TestCase
{
    private List<String> lines;

    @Override
   protected void setUp()
    {
        this.lines = new ArrayList<String>();
    }

    public void testBuildReply()
    {
        AgiReplyImpl reply;

        lines.add("200 result=49");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 49, reply.getResultCode());
        assertEquals("Incorrect result as character", '1', reply.getResultCodeAsChar());
        assertEquals("Incorrect result when get via getAttribute()", "49", reply.getAttribute("result"));
    }

    public void testBuildReplyWithAdditionalAttribute()
    {
        AgiReplyImpl reply;

        lines.add("200 result=49 endpos=2240");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 49, reply.getResultCode());
        assertEquals("Incorrect result as character", '1', reply.getResultCodeAsChar());
        assertEquals("Incorrect result when get via getAttribute()", "49", reply.getAttribute("result"));
        assertEquals("Incorrect endpos attribute", "2240", reply.getAttribute("endpos"));
    }

    public void testBuildReplyWithMultipleAdditionalAttribute()
    {
        AgiReplyImpl reply;

        lines.add("200 result=49 startpos=1234 endpos=2240");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 49, reply.getResultCode());
        assertEquals("Incorrect result as character", '1', reply.getResultCodeAsChar());
        assertEquals("Incorrect result when get via getAttribute()", "49", reply.getAttribute("result"));
        assertEquals("Incorrect startpos attribute", "1234", reply.getAttribute("startpos"));
        assertEquals("Incorrect endpos attribute", "2240", reply.getAttribute("endpos"));
    }

    public void testBuildReplyWithQuotedAttribute()
    {
        AgiReplyImpl reply;

        lines.add("200 result=1 (speech) endpos=0 results=1 score0=969 text0=\"123456789\" grammar0=digits");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 1, reply.getResultCode());
        assertEquals("Incorrect result when get via getAttribute()", "1", reply.getAttribute("result"));
        assertEquals("Incorrect endpos attribute", "0", reply.getAttribute("endpos"));
        assertEquals("Incorrect extra", "speech", reply.getExtra());
        assertEquals("Incorrect text0 attribute", "123456789", reply.getAttribute("text0"));
    }

    public void testBuildReplyWithQuotedAttribute2()
    {
        AgiReplyImpl reply;

        lines.add("200 result=1 (speech) endpos=0 results=1 score0=969 text0=\"hi \\\"joe!\\\"\" grammar0=digits");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 1, reply.getResultCode());
        assertEquals("Incorrect result when get via getAttribute()", "1", reply.getAttribute("result"));
        assertEquals("Incorrect endpos attribute", "0", reply.getAttribute("endpos"));
        assertEquals("Incorrect extra", "speech", reply.getExtra());
        assertEquals("Incorrect text0 attribute", "hi \"joe!\"", reply.getAttribute("text0"));
    }

    public void testBla()
    {
        System.out.println(005);
    }

    public void testBuildReplyWithParenthesis()
    {
        AgiReplyImpl reply;

        lines.add("200 result=1 ((hello)(world))");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 1, reply.getResultCode());
        assertEquals("Incorrect parenthesis", "(hello)(world)", reply.getExtra());
    }

    public void testBuildReplyWithAdditionalAttributeAndParenthesis()
    {
        AgiReplyImpl reply;

        lines.add("200 result=1 ((hello)(world)) endpos=2240");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect result", 1, reply.getResultCode());
        assertEquals("Incorrect parenthesis", "(hello)(world)", reply.getExtra());
        assertEquals("Incorrect endpos attribute", "2240", reply.getAttribute("endpos"));
    }

    public void testBuildReplyInvalidOrUnknownCommand()
    {
        AgiReplyImpl reply;

        lines.add("510 Invalid or unknown command");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_INVALID_OR_UNKNOWN_COMMAND, reply.getStatus());
    }

    public void testBuildReplyInvalidCommandSyntax()
    {
        AgiReplyImpl reply;

        lines.add("520-Invalid command syntax.  Proper usage follows:");
        lines.add(" Usage: DATABASE DEL <family> <key>");
        lines.add("        Deletes an entry in the Asterisk database for a");
        lines.add(" given family and key.");
        lines.add(" Returns 1 if succesful, 0 otherwise");
        lines.add("520 End of proper usage.");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_INVALID_COMMAND_SYNTAX, reply.getStatus());
        assertEquals("Incorrect synopsis", "DATABASE DEL <family> <key>", reply.getSynopsis());
        assertEquals("Incorrect usage",
                "Deletes an entry in the Asterisk database for a given family and key. Returns 1 if succesful, 0 otherwise",
                reply.getUsage());
    }

    public void testBuildReplyInvalidCommandSyntaxWithOnlyUsage()
    {
        AgiReplyImpl reply;

        lines.add("520-Invalid command syntax.  Proper usage follows:");
        lines.add(" Usage: DATABASE DEL <family> <key>");
        lines.add("        Deletes an entry in the Asterisk database for a");
        lines.add(" given family and key.");
        lines.add(" Returns 1 if succesful, 0 otherwise");
        lines.add("520 End of proper usage.");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_INVALID_COMMAND_SYNTAX, reply.getStatus());
        // due to the lazy initialization in use this getUsage() could fail if we don't call it before getSynopsis()
        assertEquals("Incorrect usage",
                "Deletes an entry in the Asterisk database for a given family and key. Returns 1 if succesful, 0 otherwise",
                reply.getUsage());
        assertEquals("Incorrect synopsis", "DATABASE DEL <family> <key>", reply.getSynopsis());
    }

    public void testBuildReplyWithLeadingSpace()
    {
        AgiReplyImpl reply;

        lines.add("200 result= (timeout)");

        reply = new AgiReplyImpl(lines);

        assertEquals("Incorrect status", AgiReplyImpl.SC_SUCCESS, reply.getStatus());
        assertEquals("Incorrect extra", "timeout", reply.getExtra());
    }
    
    public void testBuildReplyWithEmptyResultAndTimeout()
    {
        AgiReplyImpl reply;

        lines.add("200 result= (timeout)");

        reply = new AgiReplyImpl(lines);

        assertFalse("Incorrect result",reply.getResult().equals("timeout"));
        assertEquals("Incorrect result", "", reply.getResult());
        assertEquals("Incorrect extra", "timeout", reply.getExtra());
        

    }
}

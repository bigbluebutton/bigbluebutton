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

import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.internal.AgiRequestImpl;

public class AgiRequestImplTest extends TestCase
{
    @Override
    protected void setUp()
    {
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequest()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network: yes");
        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_request: agi://host/myscript.agi");
        lines.add("agi_channel: SIP/1234-d715");
        lines.add("agi_language: en");
        lines.add("agi_type: SIP");
        lines.add("agi_uniqueid: 1110023416.6");
        lines.add("agi_callerid: John Doe<1234>");
        lines.add("agi_dnid: 8870");
        lines.add("agi_rdnis: 9876");
        lines.add("agi_context: local");
        lines.add("agi_extension: 8870");
        lines.add("agi_priority: 1");
        lines.add("agi_enhanced: 0.0");
        lines.add("agi_accountcode: ");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL", "agi://host/myscript.agi", request.getRequestURL());
        assertEquals("incorrect channel", "SIP/1234-d715", request.getChannel());
        assertEquals("incorrect uniqueId", "SIP/1234-d715", request.getChannel());
        assertEquals("incorrect type", "SIP", request.getType());
        assertEquals("incorrect uniqueId", "1110023416.6", request.getUniqueId());
        assertEquals("incorrect language", "en", request.getLanguage());
        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdName", "John Doe", request.getCallerIdName());
        assertEquals("incorrect dnid", "8870", request.getDnid());
        assertEquals("incorrect rdnis", "9876", request.getRdnis());
        assertEquals("incorrect context", "local", request.getContext());
        assertEquals("incorrect extension", "8870", request.getExtension());
        assertEquals("incorrect priority", new Integer(1), request.getPriority());
        assertEquals("incorrect enhanced", Boolean.FALSE, request.getEnhanced());
        assertNull("incorrect accountCode must not be set", request.getAccountCode());
    }

    public void testBuildRequestWithAccountCode()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network: yes");
        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_accountcode: 12345");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect accountCode", "12345", request.getAccountCode());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithoutCallerIdName()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: 1234");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        //assertNull("callerIdName must not be set", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithoutCallerIdNameButBracket()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: <1234>");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertNull("callerIdName must not be set", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithoutCallerIdNameButBracketAndQuotesAndSpace()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: \"\" <1234>");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertNull("callerIdName must not be set", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithQuotedCallerIdName()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: \"John Doe\"<1234>");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertEquals("incorrect callerIdName", "John Doe", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithQuotedCallerIdNameAndSpace()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: \"John Doe\" <1234>");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertEquals("incorrect callerIdName", "John Doe", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestWithoutCallerId()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: ");

        request = new AgiRequestImpl(lines);

        assertNull("callerId must not be set", request.getCallerId());
        assertNull("callerIdNumber must not be set", request.getCallerIdNumber());
        assertNull("callerIdName must not be set", request.getCallerIdName());
    }

    /*
     * Asterisk 1.2 now uses agi_callerid and agi_calleridname so we don't need to process
     * it ourselves.
     */
    @SuppressWarnings("deprecation")
    public void testBuildRequestCallerIdAsterisk12()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: 1234");
        lines.add("agi_calleridname: John Doe");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertEquals("incorrect callerIdName", "John Doe", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestCallerIdAsterisk12WithUnknownCallerId()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: unknown");
        lines.add("agi_calleridname: John Doe");

        request = new AgiRequestImpl(lines);

        assertNull("callerId must not be set if \"unknown\"", request.getCallerId());
        assertNull("callerIdNumber must not be set if \"unknown\"", request.getCallerIdNumber());
        assertEquals("incorrect callerIdName", "John Doe", request.getCallerIdName());
    }

    @SuppressWarnings("deprecation")
    public void testBuildRequestCallerIdAsterisk12WithUnknownCallerIdName()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_callerid: 1234");
        lines.add("agi_calleridname: unknown");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect callerId", "1234", request.getCallerId());
        assertEquals("incorrect callerIdNumber", "1234", request.getCallerIdNumber());
        assertNull("callerIdName must not be set if \"unknown\"", request.getCallerIdName());
    }

    public void testBuildRequestCallerIdWithUnknownDnid()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_dnid: unknown");

        request = new AgiRequestImpl(lines);

        assertNull("dnid must not be set if \"unknown\"", request.getDnid());
    }

    public void testBuildRequestCallerIdWithUnknownRdnis()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_rdnis: unknown");

        request = new AgiRequestImpl(lines);

        assertNull("rdnis must not be set if \"unknown\"", request.getRdnis());
    }

    public void testBuildRequestWithNullEnvironment()
    {
        try
        {
            new AgiRequestImpl(null);
            fail("No IllegalArgumentException thrown.");
        }
        catch (IllegalArgumentException e)
        {
        }
    }

    public void testBuildRequestWithUnusualInput()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("var without agi prefix: a value");
        lines.add("agi_without_colon another value");
        lines.add("agi_without_space_after_colon:");
        lines.add("agi_channel: SIP/1234-a892");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect channel", "SIP/1234-a892", request.getChannel());
    }

    public void testBuildRequestWithoutParameters()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_request: agi://host/myscript.agi");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL", "agi://host/myscript.agi", request.getRequestURL());
        assertEquals("incorrect value for unset parameter 'param1'", null, request.getParameter("param1"));
        assertNotNull("getParameterValues() must not return null", request.getParameterValues("param1"));
        assertEquals("incorrect size of values for unset parameter 'param1'", 0, request.getParameterValues("param1").length);
        assertNotNull("getParameterMap() must not return null", request.getParameterMap());
        assertEquals("incorrect size of getParameterMap()", 0, request.getParameterMap().size());
    }

    public void testBuildRequestWithSingleValueParameters()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi?param1=value1&param2=value2");
        lines.add("agi_request: agi://host/myscript.agi?param1=value1&param2=value2");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL", "agi://host/myscript.agi?param1=value1&param2=value2", request.getRequestURL());
        assertEquals("incorrect value for parameter 'param1'", "value1", request.getParameter("param1"));
        assertEquals("incorrect value for parameter 'param2'", "value2", request.getParameter("param2"));
        assertEquals("incorrect value for unset parameter 'param3'", null, request.getParameter("param3"));
        assertEquals("incorrect size of getParameterMap()", 2, request.getParameterMap().size());
        assertEquals("incorrect value for parameter 'param1' when obtained from map", "value1", ((String[]) request.getParameterMap().get("param1"))[0]);
    }

    public void testBuildRequestWithMultiValueParameter()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi?param1=value1&param1=value2");
        lines.add("agi_request: agi://host/myscript.agi?param1=value1&param1=value2");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL",
                "agi://host/myscript.agi?param1=value1&param1=value2", request.getRequestURL());
        assertEquals("incorrect number of values for parameter 'param1'", 2, request.getParameterValues("param1").length);
        assertEquals("incorrect value[0] for parameter 'param1'", "value1", request.getParameterValues("param1")[0]);
        assertEquals("incorrect value[1] for parameter 'param1'", "value2", request.getParameterValues("param1")[1]);
    }

    public void testBuildRequestWithEmptyValueParameter()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi?param1");
        lines.add("agi_request: agi://host/myscript.agi?param1");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL", "agi://host/myscript.agi?param1", request.getRequestURL());
        assertEquals("incorrect value for parameter 'param1'", "", request.getParameter("param1"));
        assertEquals("incorrect number of values for parameter 'param1'", 1, request.getParameterValues("param1").length);
        assertEquals("incorrect value[0] for parameter 'param1'", "", request.getParameterValues("param1")[0]);
    }

    public void testBuildRequestWithUrlEncodedParameter()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi?param1=my%20value");
        lines.add("agi_request: agi://host/myscript.agi?param1=my%20value");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect script", "myscript.agi", request.getScript());
        assertEquals("incorrect requestURL", "agi://host/myscript.agi?param1=my%20value", request.getRequestURL());
        assertEquals("incorrect value for parameter 'param1'", "my value", request.getParameter("param1"));
    }

    public void testGetParameter()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi?param1=my%20value");
        lines.add("agi_request: agi://host/myscript.agi?param1=my%20value");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect requestURL", "agi://host/myscript.agi?param1=my%20value", request.getRequestURL());
        assertEquals("incorrect value for parameter 'param1'", "my value", request.getParameter("param1"));
    }

    public void testGetArguments()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_request: agi://host/myscript.agi");
        lines.add("agi_arg_1: value1");
        lines.add("agi_arg_2: value2");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect requestURL", "agi://host/myscript.agi", request.getRequestURL());
        assertEquals("invalid number of arguments", 2, request.getArguments().length);
        assertEquals("incorrect value for first argument", "value1", request.getArguments()[0]);
        assertEquals("incorrect value for second argument", "value2", request.getArguments()[1]);
    }

    public void testGetArgumentsWithEmptyArgument()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_request: agi://host/myscript.agi");
        lines.add("agi_arg_1: value1");
        lines.add("agi_arg_2: ");
        lines.add("agi_arg_3: value3");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect requestURL", "agi://host/myscript.agi", request.getRequestURL());
        assertEquals("invalid number of arguments", 3, request.getArguments().length);
        assertEquals("incorrect value for first argument", "value1", request.getArguments()[0]);
        assertEquals("incorrect value for second argument", null, request.getArguments()[1]);
        assertEquals("incorrect value for third argument", "value3", request.getArguments()[2]);
    }

    public void testGetArgumentsWithNoArgumentsPassed()
    {
        List<String> lines;
        AgiRequest request;

        lines = new ArrayList<String>();

        lines.add("agi_network_script: myscript.agi");
        lines.add("agi_request: agi://host/myscript.agi");

        request = new AgiRequestImpl(lines);

        assertEquals("incorrect requestURL", "agi://host/myscript.agi", request.getRequestURL());
        assertNotNull("getArguments() must never return null", request.getArguments());
        assertEquals("invalid number of arguments", 0, request.getArguments().length);
    }
}

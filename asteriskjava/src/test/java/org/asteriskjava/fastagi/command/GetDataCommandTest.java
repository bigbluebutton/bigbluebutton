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
package org.asteriskjava.fastagi.command;

import junit.framework.TestCase;

import org.asteriskjava.fastagi.command.GetDataCommand;

public class GetDataCommandTest extends TestCase
{
    private GetDataCommand getDataCommand;

    public void testDefault()
    {
        getDataCommand = new GetDataCommand("VAR1");
        assertEquals("GET DATA \"VAR1\"", getDataCommand.buildCommand());
    }

    public void testSetTimeout()
    {
        getDataCommand = new GetDataCommand("VAR1");
        getDataCommand.setTimeout(10000);
        assertEquals(10000, getDataCommand.getTimeout());
        assertEquals(1024, getDataCommand.getMaxDigits());
        assertEquals("GET DATA \"VAR1\" 10000", getDataCommand.buildCommand());
    }

    public void testSetMaxDigits()
    {
        getDataCommand = new GetDataCommand("VAR1");
        getDataCommand.setMaxDigits(10);
        assertEquals(0, getDataCommand.getTimeout());
        assertEquals(10, getDataCommand.getMaxDigits());
        assertEquals("GET DATA \"VAR1\" 0 10", getDataCommand.buildCommand());
    }

    public void testSetTimeoutAndMaxDigits()
    {
        getDataCommand = new GetDataCommand("VAR1");
        getDataCommand.setTimeout(10000);
        getDataCommand.setMaxDigits(20);
        assertEquals(10000, getDataCommand.getTimeout());
        assertEquals(20, getDataCommand.getMaxDigits());
        assertEquals("GET DATA \"VAR1\" 10000 20", getDataCommand.buildCommand());
    }
}

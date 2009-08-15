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

import org.asteriskjava.fastagi.command.AbstractAgiCommand;

public class AbstractAgiCommandTest extends TestCase
{
    private MyCommand myCommand;

    public void testEscapeAndQuote()
    {
        myCommand = new MyCommand("just a string");

        assertEquals("MY \"just a string\"", myCommand.buildCommand());
    }

    public void testEscapeAndQuoteWithNullString()
    {
        myCommand = new MyCommand(null);

        assertEquals("MY \"\"", myCommand.buildCommand());
    }

    public void testEscapeAndQuoteWithEmptyString()
    {
        myCommand = new MyCommand("");

        assertEquals("MY \"\"", myCommand.buildCommand());
    }

    public void testEscapeAndQuoteWithStringContainingQuotes()
    {
        myCommand = new MyCommand("\"John Doe\" is calling");

        assertEquals("MY \"\\\"John Doe\\\" is calling\"", myCommand.buildCommand());
    }

    public void testEscapeAndQuoteWithStringContainingNewline()
    {
        myCommand = new MyCommand("Caller is:\nJohn Doe");

        assertEquals("MY \"Caller is:John Doe\"", myCommand.buildCommand());
    }

    public class MyCommand extends AbstractAgiCommand
    {
        private static final long serialVersionUID = 3976731484641833012L;
        private String s;

        public MyCommand(String s)
        {
            this.s = s;
        }

        @Override
      public String buildCommand()
        {
            return "MY " + escapeAndQuote(s);
        }
    }
}

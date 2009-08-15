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

import java.util.List;

import junit.framework.TestCase;
import static org.easymock.EasyMock.*;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.InvalidCommandSyntaxException;
import org.asteriskjava.fastagi.InvalidOrUnknownCommandException;
import org.asteriskjava.fastagi.command.NoopCommand;
import org.asteriskjava.fastagi.internal.AgiChannelImpl;
import org.asteriskjava.fastagi.reply.AgiReply;

public class AgiChannelImplTest extends TestCase
{
    private AgiWriter agiWriter;
    private AgiReader agiReader;
    private AgiChannel agiChannel;

    @Override
   protected void setUp() throws Exception
    {
        super.setUp();

        this.agiWriter = createMock(AgiWriter.class);
        this.agiReader = createMock(AgiReader.class);
        this.agiChannel = new AgiChannelImpl(null, agiWriter, agiReader);
    }

    public void testSendCommand() throws Exception
    {
        SimpleAgiReply reply;
        NoopCommand command;

        reply = new SimpleAgiReply();
        reply.setStatus(AgiReply.SC_SUCCESS);
        reply.setResult("0");

        command = new NoopCommand();

        agiWriter.sendCommand(command);
        expect(agiReader.readReply()).andReturn(reply);

        replay(agiWriter);
        replay(agiReader);

        assertEquals(reply, agiChannel.sendCommand(command));

        verify(agiWriter);
        verify(agiReader);
    }

    public void testSendCommandWithInvalidOrUnknownCommandResponse()
            throws Exception
    {
        SimpleAgiReply reply;
        NoopCommand command;

        reply = new SimpleAgiReply();
        reply.setStatus(AgiReply.SC_INVALID_OR_UNKNOWN_COMMAND);
        reply.setResult("0");

        command = new NoopCommand();

        agiWriter.sendCommand(command);
        expect(agiReader.readReply()).andReturn(reply);

        replay(agiWriter);
        replay(agiReader);

        try
        {
            agiChannel.sendCommand(command);
            fail("must throw InvalidOrUnknownCommandException");
        }
        catch (InvalidOrUnknownCommandException e)
        {
            assertEquals("Incorrect message",
                    "Invalid or unknown command: NOOP", e.getMessage());
        }

        verify(agiWriter);
        verify(agiReader);
    }

    public void testSendCommandWithInvalidCommandSyntaxResponse()
            throws Exception
    {
        SimpleAgiReply reply;
        NoopCommand command;

        reply = new SimpleAgiReply();
        reply.setStatus(AgiReply.SC_INVALID_COMMAND_SYNTAX);
        reply.setSynopsis("NOOP Synopsis");
        reply.setUsage("NOOP Usage");
        reply.setResult("0");

        command = new NoopCommand();

        agiWriter.sendCommand(command);
        expect(agiReader.readReply()).andReturn(reply);

        replay(agiWriter);
        replay(agiReader);

        try
        {
            agiChannel.sendCommand(command);
            fail("must throw InvalidCommandSyntaxException");
        }
        catch (InvalidCommandSyntaxException e)
        {
            assertEquals("Incorrect message",
                    "Invalid command syntax: NOOP Synopsis", e.getMessage());
            assertEquals("Incorrect sysnopsis", "NOOP Synopsis", e
                    .getSynopsis());
            assertEquals("Incorrect usage", "NOOP Usage", e.getUsage());
        }

        verify(agiWriter);
        verify(agiReader);
    }

    public class SimpleAgiReply implements AgiReply
    {
        private int status;
        private String result;
        private String synopsis;
        private String usage;
        
        public String getFirstLine()
        {
            throw new UnsupportedOperationException();
        }

        public void setUsage(String usage)
        {
            this.usage = usage;
        }

        public void setSynopsis(String synopsis)
        {
            this.synopsis = synopsis;
        }

        public void setResult(String result)
        {
            this.result = result;
        }

        public void setStatus(int status)
        {
            this.status = status;
        }

        public List<String> getLines()
        {
            throw new UnsupportedOperationException();
        }

        public int getResultCode()
        {
            throw new UnsupportedOperationException();
        }

        public char getResultCodeAsChar()
        {
            throw new UnsupportedOperationException();
        }

        public String getResult()
        {
            return result;
        }

        public int getStatus()
        {
            return status;
        }

        public String getAttribute(String name)
        {
            throw new UnsupportedOperationException();
        }

        public String getExtra()
        {
            throw new UnsupportedOperationException();
        }

        public String getSynopsis()
        {
            return synopsis;
        }

        public String getUsage()
        {
            return usage;
        }
    }
}

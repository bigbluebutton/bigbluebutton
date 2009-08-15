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

import junit.framework.TestCase;
import static org.easymock.EasyMock.*;

import org.asteriskjava.fastagi.command.StreamFileCommand;
import org.asteriskjava.fastagi.internal.FastAgiWriter;
import org.asteriskjava.util.SocketConnectionFacade;

public class AgiWriterImplTest extends TestCase
{
    private AgiWriter agiWriter;
    private SocketConnectionFacade socket;

    @Override
   protected void setUp() throws Exception
    {
        super.setUp();
        this.socket = createMock(SocketConnectionFacade.class);
        this.agiWriter = new FastAgiWriter(socket);
    }

    public void testSendCommand() throws Exception
    {
        StreamFileCommand command;
        
        command = new StreamFileCommand("welcome");
        
        socket.write("STREAM FILE \"welcome\" \"\"\n");
        socket.flush();
        
        replay(socket);
        
        agiWriter.sendCommand(command);
        
        verify(socket);
    }
}

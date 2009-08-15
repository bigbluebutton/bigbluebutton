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

import java.io.IOException;

import org.asteriskjava.manager.internal.ManagerReader;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.util.SocketConnectionFacade;

public class ManagerReaderMock implements ManagerReader
{
    public int setSocketCalls = 0;
    public int dieCalls = 0;
    public int runCalls = 0;

    public ManagerReaderMock()
    {

    }

    public void registerEventClass(Class<? extends ManagerEvent> event)
    {
        throw new UnsupportedOperationException();
    }

    public void setSocket(SocketConnectionFacade socket)
    {
        setSocketCalls++;
    }

    public void expectResponseClass(String actionId, Class<? extends ManagerResponse> responseClass)
    {
        
    }

    public void die()
    {
        dieCalls++;
    }

    public boolean isDead()
    {
        return false;
    }
    
    public void run()
    {
        runCalls++;
    }

    public IOException getTerminationException()
    {
        return null;
    }
}

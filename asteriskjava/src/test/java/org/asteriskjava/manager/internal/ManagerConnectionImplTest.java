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

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import junit.framework.TestCase;

import org.asteriskjava.AsteriskVersion;
import org.asteriskjava.manager.AuthenticationFailedException;
import org.asteriskjava.manager.ManagerConnectionState;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.TimeoutException;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.event.ConnectEvent;
import org.asteriskjava.manager.event.DisconnectEvent;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.NewChannelEvent;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.SocketConnectionFacade;

public class ManagerConnectionImplTest extends TestCase
{
    protected SocketConnectionFacade mockSocket;
    protected ManagerWriterMock mockWriter;
    protected ManagerReaderMock mockReader;
    protected MockedManagerConnectionImpl mc;

    @Override
   protected void setUp() throws Exception
    {
        mockWriter = new ManagerWriterMock();
        mockWriter.setExpectedUsername("username");
        // md5 sum of 12345password
        mockWriter.setExpectedKey("40b1b887502902a8ce61a16e44630f7c");

        mockReader = new ManagerReaderMock();
        mockSocket = createMock(SocketConnectionFacade.class);
        mc = new MockedManagerConnectionImpl(mockReader, mockWriter, mockSocket);
        mockWriter.setDispatcher(mc);
    }

    public void testDefaultConstructor()
    {
        assertEquals("Invalid default hostname", "localhost", mc.getHostname());
        assertEquals("Invalid default port", 5038, mc.getPort());
    }

    public void testRegisterUserEventClass()
    {
        ManagerReader managerReader;

        managerReader = createMock(ManagerReader.class);

        managerReader.registerEventClass(MyUserEvent.class);
        replay(managerReader);

        mc = new MockedManagerConnectionImpl(managerReader, mockWriter, mockSocket);
        mc.registerUserEventClass(MyUserEvent.class);

        assertEquals("unexpected call to createSocket", 0, mc.createSocketCalls);
        assertEquals("unexpected call to createWriter", 0, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        verify(managerReader);
    }

    public void testLogin() throws Exception
    {
        MockedManagerEventListener listener;
        long startTime;
        long endTime;
        long duration;

        listener = new MockedManagerEventListener();

        replay(mockSocket);

        mc.setUsername("username");
        mc.setPassword("password");
        mc.addEventListener(listener);
        mc.setDefaultResponseTimeout(5000);
        
        startTime = System.currentTimeMillis();
        mc.login();
        endTime = System.currentTimeMillis();
        duration = endTime - startTime;

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("login action not sent 1 time", 1, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);
        assertEquals("setSocket() not called 1 time", 1, mockReader.setSocketCalls);
        // Some time for the reader thread to be started. Otherwise run() might
        // not yet have been
        // called.
        try
        {
            Thread.sleep(100);
        }
        catch (InterruptedException e)
        {
            // ugly hack to make this work when the thread is interrupted coz a
            // response has been received but the ManagerConnection was not yet 
            // sleeping
            Thread.sleep(100);
        }
        assertEquals("run() not called 1 time", 1, mockReader.runCalls);
        assertEquals("unexpected call to die()", 0, mockReader.dieCalls);

        assertEquals("state is not CONNECTED", ManagerConnectionState.CONNECTED, mc.getState());

        assertEquals("must have handled exactly one events", 1, listener.eventsHandled.size());
/*
        assertTrue(
                "first event handled must be a ProtocolIdentifierReceivedEvent",
                listener.eventsHandled.get(0) instanceof ProtocolIdentifierReceivedEvent);
*/
        assertTrue("event handled must be a ConnectEvent",
                listener.eventsHandled.get(0) instanceof ConnectEvent);

        verify(mockSocket);
        assertTrue("login() took longer than 2 second, probably a notify error (duration was " + duration + " is msec)", duration <= 2000);
    }

    public void testLoginIncorrectKey() throws Exception
    {
        mockSocket.close();
        replay(mockSocket);

        mockWriter.setExpectedUsername("username");
        // md5 sum of 12345password
        mockWriter.setExpectedKey("40b1b887502902a8ce61a16e44630f7c");

        mc.setUsername("username");
        mc.setPassword("wrong password");

        try
        {
            mc.login();
            fail("No AuthenticationFailedException thrown");
        }
        catch (AuthenticationFailedException e)
        {
        }

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("login action not sent 1 time", 1, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);
        assertEquals("setSocket() not called 1 time", 1, mockReader.setSocketCalls);
        // Some time for the reader thread to be started. Otherwise run() might
        // not yet have been
        // called.
        try
        {
            Thread.sleep(100);
        }
        catch (InterruptedException e)
        {
            // ugly hack to make this work when the thread is interrupted coz a
            // response has been received but the ManagerConnection was not yet 
            // sleeping
            Thread.sleep(100);
        }
        assertEquals("run() not called 1 time", 1, mockReader.runCalls);
        assertEquals("unexpected call to die()", 0, mockReader.dieCalls);

        verify(mockSocket);
    }

    public void testLoginIOExceptionOnConnect() throws Exception
    {
        replay(mockSocket);

        mc.setThrowIOExceptionOnFirstSocketCreate(true);
        try
        {
            mc.login();
            fail("No IOException thrown");
        }
        catch (IOException e)
        {
        }

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("unexpected challenge action sent", 0, mockWriter.challengeActionsSent);
        assertEquals("unexpected login action sent", 0, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("unexpected call to setSocket()", 0, mockReader.setSocketCalls);
        assertEquals("unexpected call to run()", 0, mockReader.runCalls);
        assertEquals("unexpected call to die()", 0, mockReader.dieCalls);

        verify(mockSocket);
    }

    public void testLoginTimeoutOnConnect() throws Exception
    {
        mc.setDefaultResponseTimeout(50);

        mockSocket.close();
        replay(mockSocket);

        // provoke timeout
        mockWriter.setSendProtocolIdentifierReceivedEvent(false);

        try
        {
            mc.login();
            fail("No TimeoutException on login()");
        }
        catch (TimeoutException e)
        {
            assertEquals("Timeout waiting for protocol identifier", e.getMessage());
        }

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("unexpected challenge action sent", 0, mockWriter.challengeActionsSent);
        assertEquals("unexpected login action sent", 0, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("setSocket() not called 1 time", 1, mockReader.setSocketCalls);
        // Some time for the reader thread to be started. Otherwise run() might
        // not yet have been
        // called.
        Thread.sleep(10);
        assertEquals("run() not called 1 time", 1, mockReader.runCalls);
        assertEquals("unexpected call to die()", 0, mockReader.dieCalls);

        verify(mockSocket);
    }

    public void testLoginTimeoutOnChallengeAction() throws Exception
    {
        mc.setDefaultResponseTimeout(200);

        mockSocket.close();
        replay(mockSocket);

        // provoke timeout
        mockWriter.setSendResponse(false);

        try
        {
            mc.login();
            fail("No TimeoutException on login()");
        }
        catch (AuthenticationFailedException e)
        {
            assertEquals("Unable to send challenge action", e.getMessage());
            assertEquals("Timeout waiting for response to Challenge", e.getCause().getMessage());
            assertTrue(e.getCause() instanceof TimeoutException);
        }

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("unexpected login action sent", 0, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("setSocket() not called 1 time", 1, mockReader.setSocketCalls);
        // Some time for the reader thread to be started. Otherwise run() might
        // not yet have been
        // called.
        Thread.sleep(10);
        assertEquals("run() not called 1 time", 1, mockReader.runCalls);
        assertEquals("unexpected call to die()", 0, mockReader.dieCalls);

        verify(mockSocket);
    }

    public void testLogoffWhenConnected() throws Exception
    {
        mockSocket.close();
        replay(mockSocket);

        // fake connect
        mc.connect();
        mc.setState(ManagerConnectionState.CONNECTED);

        mc.logoff();

        assertEquals("logoff action not sent 1 time", 1,
                mockWriter.logoffActionsSent);
        verify(mockSocket);
    }

    public void testLogoffWhenNotConnected() throws Exception
    {
        replay(mockSocket);

        try
        {
            mc.logoff();
            fail("Expected IllegalStateException when calling logoff when not connected");
        }
        catch (IllegalStateException e)
        {
            // fine
        }

        assertEquals("unexpected logoff action sent", 0, mockWriter.logoffActionsSent);
        verify(mockSocket);
    }

    public void testSendActionWithNullAction() throws Exception
    {
        // fake connect
        mc.connect();
        try
        {
            mc.sendAction(null);
            fail("No IllgealArgumentException thrown");
        }
        catch (IllegalArgumentException e)
        {
        }
    }

    public void testSendActionWhenNotConnected() throws Exception
    {
        StatusAction statusAction;

        statusAction = new StatusAction();

        try
        {
            mc.sendAction(statusAction);
            fail("No IllegalStateException thrown");
        }
        catch (IllegalStateException e)
        {
        }
    }

    public void testSendAction() throws Exception
    {
        StatusAction statusAction;
        ManagerResponse response;

        statusAction = new StatusAction();
        statusAction.setActionId("123");

        // fake connect
        mc.connect();
        mc.setState(ManagerConnectionState.CONNECTED);
        response = mc.sendAction(statusAction);

        assertEquals("incorrect actionId in action", "123", statusAction.getActionId());
        assertEquals("incorrect actionId in response", "123", response.getActionId());
        assertEquals("incorrect response", "Success", response.getResponse());

        assertEquals("other actions not sent 1 time", 1, mockWriter.otherActionsSent);
    }

    public void testSendActionTimeout() throws Exception
    {
        StatusAction statusAction;

        statusAction = new StatusAction();
        statusAction.setActionId("123");

        mc.setDefaultResponseTimeout(200);
        // fake connect
        mc.connect();
        mc.setState(ManagerConnectionState.CONNECTED);

        // provoke timeout
        mockWriter.setSendResponse(false);
        try
        {
            mc.sendAction(statusAction);
            fail("No TimeoutException thrown");
        }
        catch (TimeoutException e)
        {
        }

        assertEquals("other actions not sent 1 time", 1, mockWriter.otherActionsSent);
    }

    public void testDispatchResponseUnexpectedResponse()
    {
        ManagerResponse response;

        response = new ManagerResponse();
        // internalActionId: 123_0
        response.setActionId("123_0-abc");
        response.setResponse("Success");

        // expected result is ignoring the response and logging
        mc.dispatchResponse(response);
    }

    public void testDispatchResponseMissingInternalActionId()
    {
        ManagerResponse response;

        response = new ManagerResponse();
        response.setActionId("abc");
        response.setResponse("Success");

        // expected result is ignoring the response and logging
        mc.dispatchResponse(response);
    }

    public void testDispatchResponseNullActionId()
    {
        ManagerResponse response;

        response = new ManagerResponse();
        response.setActionId(null);
        response.setResponse("Success");

        // expected result is ignoring the response and logging
        mc.dispatchResponse(response);
    }

    public void testDispatchResponseNullResponse()
    {
        // expected result is ignoring and logging
        mc.dispatchResponse(null);
    }

    public void testReconnect() throws Exception
    {
        DisconnectEvent disconnectEvent;

        replay(mockSocket);
        disconnectEvent = new DisconnectEvent(this);

        // fake successful login
        mc.setState(ManagerConnectionState.CONNECTED);

        mc.setUsername("username");
        mc.setPassword("password");

        mc.dispatchEvent(disconnectEvent);
        
        // wait for reconnect thread to do its work
        Thread.sleep(1000);

        assertEquals("createSocket not called 1 time", 1, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("login action not sent 1 time", 1, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("state is not CONNECTED", ManagerConnectionState.CONNECTED, mc.getState());

        verify(mockSocket);
    }

    public void testReconnectWithIOException() throws Exception
    {
        DisconnectEvent disconnectEvent;

        replay(mockSocket);
        disconnectEvent = new DisconnectEvent(this);

        // fake successful login
        mc.setState(ManagerConnectionState.CONNECTED);

        mc.setThrowIOExceptionOnFirstSocketCreate(true);

        mc.setUsername("username");
        mc.setPassword("password");

        mc.dispatchEvent(disconnectEvent);

        // wait for reconnect thread to do its work
        Thread.sleep(1000);

        assertEquals("createSocket not called 1 time", 2, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("login action not sent 1 time", 1, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("state is not CONNECTED", ManagerConnectionState.CONNECTED, mc.getState());

        verify(mockSocket);
    }


    public void testReconnectWithTimeoutException() throws Exception
    {
        DisconnectEvent disconnectEvent;

        mockSocket.close();
        replay(mockSocket);
        disconnectEvent = new DisconnectEvent(this);

        // fake successful login
        mc.setState(ManagerConnectionState.CONNECTED);

        mc.setThrowTimeoutExceptionOnFirstLogin(true);

        mc.setUsername("username");
        mc.setPassword("password");

        mc.dispatchEvent(disconnectEvent);

        // wait for reconnect thread to do its work
        Thread.sleep(1000);

        assertEquals("createSocket not called 2 time", 2, mc.createSocketCalls);
        assertEquals("createWriter not called 1 time", 1, mc.createWriterCalls);
        assertEquals("createReader not called 1 time", 1, mc.createReaderCalls);

        assertEquals("challenge action not sent 1 time", 1, mockWriter.challengeActionsSent);
        assertEquals("login action not sent 1 time", 1, mockWriter.loginActionsSent);
        assertEquals("unexpected other actions sent", 0, mockWriter.otherActionsSent);

        assertEquals("state is not CONNECTED", ManagerConnectionState.CONNECTED, mc.getState());

        verify(mockSocket);
    }

    @SuppressWarnings("unchecked")
    public void testDispatchEventWithMultipleEventHandlers()
    {
        final int count = 20;
        ManagerEvent event;
        final List<Integer> list;

        // verify that event handlers are called in the correct order
        event = new NewChannelEvent(this);
        list = createMock(List.class);
        for (int i = 0; i < count; i++)
        {
            final int index = i;
            expect(list.add(index)).andReturn(true);
            mc.addEventListener(new ManagerEventListener()
            {
                public void onManagerEvent(ManagerEvent event)
                {
                    list.add(index);
                }
            });
        }

        replay(list);
        mc.dispatchEvent(event);
        verify(list);
    }

    private class MockedManagerEventListener implements ManagerEventListener
    {
        List<ManagerEvent> eventsHandled;

        public MockedManagerEventListener()
        {
            this.eventsHandled = new ArrayList<ManagerEvent>();
        }

        public void onManagerEvent(ManagerEvent event)
        {
            eventsHandled.add(event);
        }
    }

    private class MockedManagerConnectionImpl
            extends
                ManagerConnectionImpl
    {
        ManagerReader mockReader;
        ManagerWriter mockWriter;
        SocketConnectionFacade mockSocket;

        private boolean throwIOExceptionOnFirstSocketCreate = false;
        private boolean throwTimeoutExceptionOnFirstLogin = false;

        public int createReaderCalls = 0;
        public int createWriterCalls = 0;
        public int createSocketCalls = 0;
        
        public int loginCalls = 0;

        public MockedManagerConnectionImpl(ManagerReader mockReader,
                ManagerWriter mockWriter, SocketConnectionFacade mockSocket)
        {
            super();
            this.mockReader = mockReader;
            this.mockWriter = mockWriter;
            this.mockSocket = mockSocket;
        }

        public void setThrowTimeoutExceptionOnFirstLogin(boolean b)
        {
            this.throwTimeoutExceptionOnFirstLogin = b;
        }

        public void setThrowIOExceptionOnFirstSocketCreate(boolean b)
        {
            this.throwIOExceptionOnFirstSocketCreate = b;
        }

        @Override
        public String getUsername()
        {
            return username;
        }

        @Override
        public String getPassword()
        {
            return password;
        }

        public void setState(ManagerConnectionState state)
        {
            this.state = state;
        }

        @Override
        protected ManagerReader createReader(Dispatcher d, Object source)
        {
            createReaderCalls++;
            return mockReader;
        }

        @Override
        protected ManagerWriter createWriter()
        {
            createWriterCalls++;
            return mockWriter;
        }

        @Override
        protected SocketConnectionFacade createSocket() throws IOException
        {
            createSocketCalls++;

            if (throwIOExceptionOnFirstSocketCreate && createSocketCalls == 1)
            {
                throw new IOException();
            }
            return mockSocket;
        }
        
        @Override
        protected void doLogin(long timeout, String events) throws IOException,
            AuthenticationFailedException, TimeoutException
        {
            loginCalls++;

            if (throwTimeoutExceptionOnFirstLogin && loginCalls == 1)
            {
                disconnect();
                throw new TimeoutException("Provoked timeout");
            }
            super.doLogin(timeout, events);
        }
        
        @Override
      protected AsteriskVersion determineVersion()
        {
            return null;
        }
    }
}

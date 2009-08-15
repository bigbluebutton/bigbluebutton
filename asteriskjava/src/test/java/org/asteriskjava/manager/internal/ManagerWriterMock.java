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

import org.asteriskjava.AsteriskVersion;
import org.asteriskjava.manager.action.ChallengeAction;
import org.asteriskjava.manager.action.LoginAction;
import org.asteriskjava.manager.action.LogoffAction;
import org.asteriskjava.manager.action.ManagerAction;
import org.asteriskjava.manager.event.ProtocolIdentifierReceivedEvent;
import org.asteriskjava.manager.response.ChallengeResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.DateUtil;
import org.asteriskjava.util.SocketConnectionFacade;

public class ManagerWriterMock implements ManagerWriter
{
    private static final String CHALLENGE = "12345";
    private static final long CONNECT_LATENCY = 50;
    private static final long RESPONSE_LATENCY = 20;

    private Dispatcher dispatcher;

    private String expectedKey;
    private String expectedUsername;
    private boolean sendResponse = true;
    private boolean sendProtocolIdentifierReceivedEvent = true;

    public int challengeActionsSent = 0;
    public int loginActionsSent = 0;
    public int logoffActionsSent = 0;
    public int otherActionsSent = 0;

    public ManagerWriterMock()
    {
    }

    public void setTargetVersion(AsteriskVersion version)
    {
    }

    public void setDispatcher(Dispatcher dispatcher)
    {
        this.dispatcher = dispatcher;
    }

    public void setExpectedKey(String key)
    {
        this.expectedKey = key;
    }

    public void setExpectedUsername(String username)
    {
        this.expectedUsername = username;
    }

    public void setSendResponse(boolean sendResponse)
    {
        this.sendResponse = sendResponse;
    }

    public void setSendProtocolIdentifierReceivedEvent(boolean sendConnectEvent)
    {
        this.sendProtocolIdentifierReceivedEvent = sendConnectEvent;
    }

    public void setSocket(SocketConnectionFacade socket)
    {
        if (sendProtocolIdentifierReceivedEvent)
        {
            Thread future = new Thread(new Runnable()
            {
                public void run()
                {
                    try
                    {
                        Thread.sleep(CONNECT_LATENCY);
                    }
                    catch (InterruptedException e)
                    {
                        // ignore
                    }
                    ProtocolIdentifierReceivedEvent protocolIdentifierReceivedEvent;
                    protocolIdentifierReceivedEvent = new ProtocolIdentifierReceivedEvent(this);
                    protocolIdentifierReceivedEvent.setProtocolIdentifier("Asterisk Call Manager/1.0");
                    protocolIdentifierReceivedEvent.setDateReceived(DateUtil.getDate());
                    dispatcher.dispatchEvent(protocolIdentifierReceivedEvent);
                }
            });
            future.start();
        }
    }

    public void sendAction(ManagerAction action, String internalActionId) throws IOException
    {
        if (action instanceof ChallengeAction)
        {
            ChallengeAction challengeAction = (ChallengeAction) action;
            String authType = challengeAction.getAuthType();

            if (!authType.equals("MD5"))
            {
                throw new RuntimeException("Expected authType 'MD5' got '" + authType + "'");
            }

            challengeActionsSent++;

            if (sendResponse)
            {
                ChallengeResponse challengeResponse;

                challengeResponse = new ChallengeResponse();
                challengeResponse.setActionId(ManagerUtil.addInternalActionId(action.getActionId(), internalActionId));
                challengeResponse.setChallenge(CHALLENGE);
                dispatchLater(challengeResponse);
            }
        }
        else if (action instanceof LoginAction)
        {

            LoginAction loginAction = (LoginAction) action;
            String username = loginAction.getUsername();
            String key = loginAction.getKey();
            String authType = loginAction.getAuthType();

            if (!"MD5".equals(authType))
            {
                throw new RuntimeException("Expected authType 'MD5' got '" + authType + "'");
            }

            if (!expectedUsername.equals(username))
            {
                throw new RuntimeException("Expected username '" + expectedUsername + "' got '" + username + "'");
            }

            loginActionsSent++;

            if (sendResponse)
            {
                ManagerResponse loginResponse;

                // let testReconnectWithKeepAliveAfterAuthenticationFailure
                // succeed after
                // 3 unsuccessful attempts
                if (key.equals(expectedKey) || loginActionsSent > 2)
                {
                    loginResponse = new ManagerResponse();
                    loginResponse.setResponse("Success");
                }
                else
                {
                    loginResponse = new ManagerError();
                    loginResponse.setResponse("Error");
                    loginResponse.setMessage("Authentication failed");
                }
                loginResponse.setActionId(ManagerUtil.addInternalActionId(action.getActionId(), internalActionId));
                dispatchLater(loginResponse);
            }
        }
        else if (action instanceof LogoffAction)
        {
            logoffActionsSent++;

            if (sendResponse)
            {
                ManagerResponse response;

                response = new ManagerResponse();
                response.setActionId(ManagerUtil.addInternalActionId(action.getActionId(), internalActionId));
                response.setResponse("Success");
                dispatchLater(response);
            }
        }
        else
        {
            otherActionsSent++;

            if (sendResponse)
            {
                ManagerResponse response;

                response = new ManagerResponse();
                response.setActionId(ManagerUtil.addInternalActionId(action.getActionId(), internalActionId));
                response.setResponse("Success");
                dispatchLater(response);
            }
        }
    }

    private void dispatchLater(final ManagerResponse response)
    {
        Thread future = new Thread(new Runnable()
        {
            public void run()
            {
                try
                {
                    Thread.sleep(RESPONSE_LATENCY);
                }
                catch (InterruptedException e)
                {
                    // ignore
                }
                dispatcher.dispatchResponse(response);
            }
        });
        future.start();
    }
}

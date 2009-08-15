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

import org.asteriskjava.manager.event.DisconnectEvent;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.ProtocolIdentifierReceivedEvent;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.DateUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.asteriskjava.util.SocketConnectionFacade;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;


/**
 * Default implementation of the ManagerReader interface.
 *
 * @author srt
 * @version $Id: ManagerReaderImpl.java 1154 2008-08-24 02:05:26Z srt $
 */
public class ManagerReaderImpl implements ManagerReader
{
    /**
     * Instance logger.
     */
    private final Log logger = LogFactory.getLog(getClass());

    /**
     * The event builder utility to convert a map of attributes reveived from asterisk to instances
     * of registered event classes.
     */
    private final EventBuilder eventBuilder;

    /**
     * The response builder utility to convert a map of attributes reveived from asterisk to
     * instances of well known response classes.
     */
    private final ResponseBuilder responseBuilder;

    /**
     * The dispatcher to use for dispatching events and responses.
     */
    private final Dispatcher dispatcher;

    private final Map<String, Class<? extends ManagerResponse>> expectedResponseClasses;

    /**
     * The source to use when creating {@link ManagerEvent}s.
     */
    private final Object source;

    /**
     * The socket to use for reading from the asterisk server.
     */
    private SocketConnectionFacade socket;

    /**
     * If set to <code>true</code>, terminates and closes the reader.
     */
    private volatile boolean die = false;

    /**
     * <code>true</code> if the main loop has finished.
     */
    private boolean dead = false;

    /**
     * Exception that caused this reader to terminate if any.
     */
    private IOException terminationException;

    /**
     * Creates a new ManagerReaderImpl.
     *
     * @param dispatcher the dispatcher to use for dispatching events and responses.
     * @param source     the source to use when creating {@link ManagerEvent}s
     */
    public ManagerReaderImpl(final Dispatcher dispatcher, Object source)
    {
        this.dispatcher = dispatcher;
        this.source = source;

        this.eventBuilder = new EventBuilderImpl();
        this.responseBuilder = new ResponseBuilderImpl();
        this.expectedResponseClasses = new ConcurrentHashMap<String, Class<? extends ManagerResponse>>();
    }

    /**
     * Sets the socket to use for reading from the asterisk server.
     *
     * @param socket the socket to use for reading from the asterisk server.
     */
    public void setSocket(final SocketConnectionFacade socket)
    {
        this.socket = socket;
    }

    public void registerEventClass(Class<? extends ManagerEvent> eventClass)
    {
        eventBuilder.registerEventClass(eventClass);
    }

    public void expectResponseClass(String internalActionId, Class<? extends ManagerResponse> responseClass)
    {
        expectedResponseClasses.put(internalActionId, responseClass);
    }

    /**
     * Reads line by line from the asterisk server, sets the protocol identifier (using a
     * generated {@link org.asteriskjava.manager.event.ProtocolIdentifierReceivedEvent}) as soon as it is
     * received and dispatches the received events and responses via the associated dispatcher.
     *
     * @see org.asteriskjava.manager.internal.Dispatcher#dispatchEvent(ManagerEvent)
     * @see org.asteriskjava.manager.internal.Dispatcher#dispatchResponse(ManagerResponse)
     */
    public void run()
    {
        final Map<String, Object> buffer = new HashMap<String, Object>();
        String line;

        if (socket == null)
        {
            throw new IllegalStateException("Unable to run: socket is null.");
        }

        this.die = false;
        this.dead = false;

        try
        {
            // main loop
            while (!this.die && (line = socket.readLine()) != null)
            {
                // maybe we will find a better way to identify the protocol identifier but for now
                // this works quite well.
                if (line.startsWith("Asterisk Call Manager/") ||
                        line.startsWith("Asterisk Call Manager Proxy/") ||
                        line.startsWith("OpenPBX Call Manager/") ||
                        line.startsWith("CallWeaver Call Manager/"))
                {
                    ProtocolIdentifierReceivedEvent protocolIdentifierReceivedEvent;
                    protocolIdentifierReceivedEvent = new ProtocolIdentifierReceivedEvent(source);
                    protocolIdentifierReceivedEvent.setProtocolIdentifier(line);
                    protocolIdentifierReceivedEvent.setDateReceived(DateUtil.getDate());
                    dispatcher.dispatchEvent(protocolIdentifierReceivedEvent);
                    continue;
                }

                /* Special handling for "Response: Follows" (CommandResponse)
                 * As we are using "\r\n" as the delimiter for line this also handles multiline
                 * results as long as they only contain "\n".
                 */
                if ("Follows".equals(buffer.get("response")) && line.endsWith("--END COMMAND--"))
                {
                    buffer.put(COMMAND_RESULT_RESPONSE_KEY, line);
                    continue;
                }

                if (line.length() > 0)
                {
                    int delimiterIndex;
                    int delimiterLength;

                    //delimiterIndex = line.indexOf(": ");
                    // begin of workaround for Astersik bug 13319
                    // see AJ-77
                    delimiterIndex = line.indexOf(" ");
                    delimiterLength = 1;
                    if (delimiterIndex > 0 && line.charAt(delimiterIndex - 1) == ':')
                    {
                        delimiterIndex--;
                        delimiterLength++;
                    }
                    // end of workaround for Astersik bug 13319

                    if (delimiterIndex > 0 && line.length() > delimiterIndex + delimiterLength)
                    {
                        String name;
                        String value;

                        name = line.substring(0, delimiterIndex).toLowerCase(Locale.ENGLISH);
                        value = line.substring(delimiterIndex + delimiterLength);

                        addToBuffer(buffer, name, value);
                        // TODO tracing
                        //logger.debug("Got name [" + name + "], value: [" + value + "]");
                    }
                }


                // an empty line indicates a normal response's or event's end so we build
                // the corresponding value object and dispatch it through the ManagerConnection.
                if (line.length() == 0)
                {
                    if (buffer.containsKey("event"))
                    {
                        // TODO tracing
                        //logger.debug("attempting to build event: " + buffer.get("event"));
                        ManagerEvent event = buildEvent(source, buffer);
                        if (event != null)
                        {
                            dispatcher.dispatchEvent(event);
                        }
                        else
                        {
                            logger.debug("buildEvent returned null");
                        }
                    }
                    else if (buffer.containsKey("response"))
                    {
                        ManagerResponse response = buildResponse(buffer);
                        // TODO tracing
                        //logger.debug("attempting to build response");
                        if (response != null)
                        {
                            dispatcher.dispatchResponse(response);
                        }
                    }
                    else
                    {
                        if (buffer.size() > 0)
                        {
                            logger.debug("Buffer contains neither response nor event");
                        }
                    }

                    buffer.clear();
                }
            }
            this.dead = true;
            logger.debug("Reached end of stream, terminating reader.");
        }
        catch (IOException e)
        {
            this.terminationException = e;
            this.dead = true;
            logger.info("Terminating reader thread: " + e.getMessage());
        }
        finally
        {
            this.dead = true;
            // cleans resources and reconnects if needed
            DisconnectEvent disconnectEvent = new DisconnectEvent(source);
            disconnectEvent.setDateReceived(DateUtil.getDate());
            dispatcher.dispatchEvent(disconnectEvent);
        }
    }

    @SuppressWarnings("unchecked")
    private void addToBuffer(Map<String, Object> buffer, String name, String value)
    {
        // if we already have a value for that key, convert the value to a list and add
        // the new value to that list.
        if (buffer.containsKey(name))
        {
            Object currentValue = buffer.get(name);
            if (currentValue instanceof List)
            {
                ((List<String>) currentValue).add(value);
                return;
            }
            List<String> list = new ArrayList<String>();
            if (currentValue instanceof String)
            {
                list.add((String) currentValue);
            }
            else
            {
                list.add(currentValue.toString());
            }
            list.add(value);
            buffer.put(name, list);
        }
        else
        {
            buffer.put(name, value);
        }
    }

    public void die()
    {
        this.die = true;
    }

    public boolean isDead()
    {
        return dead;
    }

    public IOException getTerminationException()
    {
        return terminationException;
    }

    private ManagerResponse buildResponse(Map<String, Object> buffer)
    {
        Class<? extends ManagerResponse> responseClass = null;
        final String actionId = (String) buffer.get("actionid");
        final String internalActionId = ManagerUtil.getInternalActionId(actionId);
        if (internalActionId != null)
        {
            responseClass = expectedResponseClasses.get(internalActionId);
            if (responseClass != null)
            {
                expectedResponseClasses.remove(internalActionId);
            }
        }

        final ManagerResponse response = responseBuilder.buildResponse(responseClass, buffer);

        if (response != null)
        {
            response.setDateReceived(DateUtil.getDate());
        }

        return response;
    }

    private ManagerEvent buildEvent(Object source, Map<String, Object> buffer)
    {
        ManagerEvent event;

        event = eventBuilder.buildEvent(source, buffer);

        if (event != null)
        {
            event.setDateReceived(DateUtil.getDate());
        }

        return event;
    }
}

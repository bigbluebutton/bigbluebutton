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
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.MappingStrategy;
import org.asteriskjava.fastagi.command.AsyncAgiBreakCommand;
import org.asteriskjava.manager.event.AsyncAgiEvent;
import org.asteriskjava.manager.ManagerConnection;

/**
 * An AgiConnectionHandler for AsyncAGI.
 * <p/>
 * It reads the request using a AsyncAgiReader and runs the AgiScript configured to
 * handle this type of request. Finally it sends an {@link org.asteriskjava.fastagi.command.AsyncAgiBreakCommand}.
 *
 * @author srt
 * @version $Id: AsyncAgiConnectionHandler.java 1140 2008-08-18 18:49:36Z srt $
 */
public class AsyncAgiConnectionHandler extends AgiConnectionHandler
{
    private final ManagerConnection connection;
    private volatile String channelName;
    private final List<String> environment;
    private final BlockingQueue<AsyncAgiEvent> asyncAgiEvents;
    private AsyncAgiWriter writer;

    /**
     * Creates a new FastAGIConnectionHandler to handle the given FastAGI socket connection.
     *
     * @param mappingStrategy    the strategy to use to determine which script to run.
     * @param asyncAgiStartEvent the AsyncAgiEvent that started this connection, must be a start sub event.
     * @throws IllegalArgumentException if asyncAgiStartEvent is not a start sub type".
     */
    public AsyncAgiConnectionHandler(MappingStrategy mappingStrategy, AsyncAgiEvent asyncAgiStartEvent) throws IllegalArgumentException
    {
        super(mappingStrategy);
        if (!asyncAgiStartEvent.isStart())
        {
            throw new IllegalArgumentException("AsyncAgiEvent passed to AsyncAgiConnectionHandler is not a start sub event");
        }
        connection = (ManagerConnection) asyncAgiStartEvent.getSource();
        channelName = asyncAgiStartEvent.getChannel();
        environment = asyncAgiStartEvent.decodeEnv();
        asyncAgiEvents = new LinkedBlockingQueue<AsyncAgiEvent>();
        setIgnoreMissingScripts(true);
    }

    @Override
    protected AgiReader createReader()
    {
        return new AsyncAgiReader(connection, environment, asyncAgiEvents);
    }

    @Override
    protected AgiWriter createWriter()
    {
        writer = new AsyncAgiWriter(connection, channelName);
        return writer;
    }

    @Override
    protected void release()
    {
        if (writer != null && (getScript() != null || ! isIgnoreMissingScripts()))
        {
            try
            {
                writer.sendCommand(new AsyncAgiBreakCommand());
            }
            catch (AgiException e) // NOPMD
            {
                // ignore
            }
        }
    }

    public void onAsyncAgiExecEvent(AsyncAgiEvent event)
    {
        asyncAgiEvents.offer(event);
    }

    public void onAsyncAgiEndEvent(AsyncAgiEvent event)
    {
        asyncAgiEvents.offer(event);
    }

    public void updateChannelName(String channelName)
    {
        this.channelName = channelName;
        writer.updateChannelName(channelName);
    }
}
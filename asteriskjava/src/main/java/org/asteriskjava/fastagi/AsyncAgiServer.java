package org.asteriskjava.fastagi;

import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.AsyncAgiEvent;
import org.asteriskjava.manager.event.RenameEvent;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.asteriskjava.fastagi.internal.AsyncAgiConnectionHandler;

import java.util.Map;
import java.util.HashMap;

/**
 * AGI server for AGI over the Manager API (AsyncAGI).<p>
 * AsyncAGI is available since Asterisk 1.6.
 *
 * @since 1.0.0
 */
public class AsyncAgiServer extends AbstractAgiServer implements ManagerEventListener
{
    private final Log logger = LogFactory.getLog(getClass());
    private final Map<Integer, AsyncAgiConnectionHandler> connectionHandlers;

    /**
     * Creates a new AsyncAgiServer.<p>
     * Note that you must set a {@link org.asteriskjava.fastagi.MappingStrategy} before using it.
     * @see #setMappingStrategy(MappingStrategy) 
     */
    public AsyncAgiServer()
    {
        this.connectionHandlers = new HashMap<Integer, AsyncAgiConnectionHandler>();
    }

    /**
     * Creates a new AsyncAgiServer with the given MappingStrategy.<p>
     * Please note that Async AGI does not currently support passing a script name, so your
     * MappingStrategy must be aware that the {@link org.asteriskjava.fastagi.AgiRequest#getScript() script}
     * property of the AgiRequests will likely be <code>null</code>.
     *
     * @param mappingStrategy the MappingStrategy to use to determine which AGI script to run
     *                        for a certain request.
     */
    public AsyncAgiServer(MappingStrategy mappingStrategy)
    {
        this();
        setMappingStrategy(mappingStrategy);
    }

    /**
     * Creates a new AsyncAgiServer that will execute the given AGI script for every
     * request.<p>
     * Internally this constructor uses a {@link org.asteriskjava.fastagi.StaticMappingStrategy}.
     *
     * @param agiScript the AGI script to execute.
     */
    public AsyncAgiServer(AgiScript agiScript)
    {
        this();
        setMappingStrategy(new StaticMappingStrategy(agiScript));
    }

    public void onManagerEvent(ManagerEvent event)
    {
        if (event instanceof AsyncAgiEvent)
        {
            handleAsyncAgiEvent((AsyncAgiEvent) event);
        }
        else if (event instanceof RenameEvent)
        {
            handleRenameEvent((RenameEvent) event);
        }
    }

    private void handleAsyncAgiEvent(AsyncAgiEvent asyncAgiEvent)
    {
        final ManagerConnection connection;
        final String channelName;
        final AsyncAgiConnectionHandler connectionHandler;

        connection = (ManagerConnection) asyncAgiEvent.getSource();
        channelName = asyncAgiEvent.getChannel();

        if (asyncAgiEvent.isStart())
        {
            connectionHandler = new AsyncAgiConnectionHandler(getMappingStrategy(), asyncAgiEvent);
            setConnectionHandler(connection, channelName, connectionHandler);
            execute(connectionHandler);
        }
        else
        {
            connectionHandler = getConnectionHandler(connection, channelName);
            if (connectionHandler == null)
            {
                logger.info("No AsyncAgiConnectionHandler registered for channel " + channelName + ": Ignoring AsyncAgiEvent");
                return;
            }

            if (asyncAgiEvent.isExec())
            {
                connectionHandler.onAsyncAgiExecEvent(asyncAgiEvent);
            }
            else if (asyncAgiEvent.isEnd())
            {
                connectionHandler.onAsyncAgiEndEvent(asyncAgiEvent);
                removeConnectionHandler(connection, channelName);
            }
            else
            {
                logger.warn("Ignored unknown AsyncAgiEvent of sub type '" + asyncAgiEvent.getSubEvent() + "'");
            }
        }
    }

    private void handleRenameEvent(RenameEvent renameEvent)
    {
        final ManagerConnection connection = (ManagerConnection) renameEvent.getSource();
        final AsyncAgiConnectionHandler connectionHandler = getConnectionHandler(connection, renameEvent.getChannel());

        if (connectionHandler == null)
        {
            return;
        }

        removeConnectionHandler(connection, renameEvent.getChannel());
        setConnectionHandler(connection, renameEvent.getNewname(), connectionHandler);

        connectionHandler.updateChannelName(renameEvent.getNewname());
    }

    private AsyncAgiConnectionHandler getConnectionHandler(ManagerConnection connection, String channelName)
    {
        synchronized (connectionHandlers)
        {
            return connectionHandlers.get(calculateHashKey(connection, channelName));
        }
    }

    private void setConnectionHandler(ManagerConnection connection, String channelName, AsyncAgiConnectionHandler connectionHandler)
    {
        synchronized (connectionHandlers)
        {
            connectionHandlers.put(calculateHashKey(connection, channelName), connectionHandler);
        }
    }

    private void removeConnectionHandler(ManagerConnection connection, String channelName)
    {
        synchronized (connectionHandlers)
        {
            connectionHandlers.remove(calculateHashKey(connection, channelName));
        }
    }

    private Integer calculateHashKey(ManagerConnection connection, String channelName)
    {
        return connection.hashCode() * 31 + channelName.hashCode();
    }
}

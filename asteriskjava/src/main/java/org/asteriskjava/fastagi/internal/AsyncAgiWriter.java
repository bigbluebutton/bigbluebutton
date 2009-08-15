package org.asteriskjava.fastagi.internal;

import org.asteriskjava.fastagi.command.AgiCommand;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.TimeoutException;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.action.AgiAction;

import java.io.IOException;

/**
 * Implementation of AgiWriter that uses a {@link org.asteriskjava.manager.ManagerConnection} to send
 * {@link org.asteriskjava.fastagi.command.AgiCommand AgiCommands} as part of an AsyncAgi conversation.
 *
 * @see org.asteriskjava.manager.ManagerConnection
 * @see org.asteriskjava.manager.action.AgiAction
 * @since 1.0.0 
 */
public class AsyncAgiWriter implements AgiWriter
{
    private final ManagerConnection connection;
    private volatile String channelName;

    public AsyncAgiWriter(ManagerConnection connection, String channelName)
    {
        this.connection = connection;
        this.channelName = channelName;
    }

    public void sendCommand(AgiCommand command) throws AgiException
    {
        final AgiAction agiAction;
        final ManagerResponse response;

        agiAction = new AgiAction(channelName, command.buildCommand());

        try
        {
            response = connection.sendAction(agiAction);
        }
        catch (IOException e)
        {
            throw new AgiException("Unable to send AsyncAGI command to " + connection.getHostname() +
                    " for channel " + channelName, e);
        }
        catch (TimeoutException e)
        {
            throw new AgiException("Timeout while sending AsyncAGI command to " + connection.getHostname() +
                    " for channel " + channelName , e);
        }

        if (response instanceof ManagerError)
        {
            throw new AgiException("Unable to send AsyncAGI command to " + connection.getHostname() +
                    " for channel " + channelName + ": " + response.getMessage());
        }
    }

    public void updateChannelName(String channelName)
    {
        this.channelName = channelName;
    }
}

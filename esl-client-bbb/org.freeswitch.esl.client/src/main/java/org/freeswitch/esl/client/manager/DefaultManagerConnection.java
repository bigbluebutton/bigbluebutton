package org.freeswitch.esl.client.manager;

import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.internal.ManagerConnectionImpl;

public class DefaultManagerConnection implements ManagerConnection
{
    private ManagerConnectionImpl impl;

    /**
     * Creates a new instance.
     */
    public DefaultManagerConnection()
    {
        this.impl = new ManagerConnectionImpl();
    }

    public DefaultManagerConnection(String hostname, String password)
    {
        this();
        impl.setHostname(hostname);
        impl.setPassword(password);
    }

    public DefaultManagerConnection(String hostname, int port, String password)
    {
        this();
        impl.setHostname(hostname);
        impl.setPort(port);
        impl.setPassword(password);
    }

    public DefaultManagerConnection(String hostname, int port, String password, int timeout)
    {
        this();
        impl.setHostname(hostname);
        impl.setPort(port);
        impl.setPassword(password);
        impl.setTimeout(timeout);
    }

    public void setHostname(String hostname)
    {
        impl.setHostname(hostname);
    }

    public void setPort(int port)
    {
        impl.setPort(port);
    }

    public void setTimeout(int timeout)
    {
        impl.setTimeout(timeout);
    }

    public void setPassword(String password)
    {
        impl.setPassword(password);
    }

    public String getHostname()
    {
        return impl.getHostname();
    }

    public int getPort()
    {
        return impl.getPort();
    }

    public String getPassword()
    {
        return impl.getPassword();
    }

    public Client getESLClient()
    {
	return impl.getESLClient();
    }

    @Override
    public String toString()
    {
        final StringBuilder sb = new StringBuilder("DefaultManagerConnection[");
        sb.append("hostname='").append(getHostname()).append("',");
        sb.append("port=").append(getPort()).append("]");
        return sb.toString();
    }

    public void connect() throws InboundConnectionFailure {
        impl.connect();
    }

    public void disconnect() {
        impl.disconnect();
    }
}

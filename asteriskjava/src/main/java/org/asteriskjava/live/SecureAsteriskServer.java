package org.asteriskjava.live;

import org.asteriskjava.manager.DefaultManagerConnection;
import org.asteriskjava.manager.ManagerConnection;

/**
 * Secure implementation of the AsteriskServer interface.<p>
 * Uses SSL for the connection to Asterisk.
 *
 * @author srt
 * @version $Id: SecureAsteriskServer.java 961 2008-02-03 02:53:56Z srt $
 * @see org.asteriskjava.live.AsteriskServer
 */
public class SecureAsteriskServer extends DefaultAsteriskServer
{
    /**
     * Creates a new instance and a new SSL secured {@link ManagerConnection} with the given
     * connection data.
     *
     * @param hostname the hostname of the Asterisk server to connect to.
     * @param port     the port where Asterisk listens for incoming SSL secured Manager API connections, usually 5039.
     * @param username the username to use for login
     * @param password the password to use for login
     */
    public SecureAsteriskServer(String hostname, int port, String username, String password)
    {
        super(hostname, port, username, password);
    }

    @Override
    protected DefaultManagerConnection createManagerConnection(String hostname, int port, String username, String password)
    {
        DefaultManagerConnection dmc;
        dmc = super.createManagerConnection(hostname, port, username, password);
        dmc.setSsl(true);
        return dmc;
    }
}

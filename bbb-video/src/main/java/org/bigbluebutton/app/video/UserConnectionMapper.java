package org.bigbluebutton.app.video;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * This class maintains the connections mapping of a user.
 * This tracks the connections for a user to manage auto-reconnects.
 * @author ralam
 *
 */
public class UserConnectionMapper {

    private ConcurrentMap<String, UserConnection> users = new ConcurrentHashMap<String, UserConnection>(8, 0.9f, 1);;

    public synchronized Collection<UserConnection> getConnections() {
        return users.values();
    }

    /**
     * Adds a connection for a user.
     * @param connId
     */
    public synchronized void addUserConnection(String connId) {
        UserConnection user = new UserConnection(connId, System.currentTimeMillis());
        users.put(connId, user);
    }

    /**
     * Removed a connection for a user. Returns true if the user doesn't have any
     * connection left and thus can be removed.
     * @param connId
     * @return boolean - no more connections
     */
    public synchronized void userDisconnected(String connId) {
        users.remove(connId);
    }

    public class UserConnection {
        public final String connId;
        public final Long connectedOn;

        public UserConnection(String connId, Long connectedOn) {
            this.connId = connId;
            this.connectedOn = connectedOn;
        }

    }
}

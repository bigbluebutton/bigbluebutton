package org.asteriskjava.manager;

/**
 * The lifecycle status of a {@link org.asteriskjava.manager.ManagerConnection}.
 * 
 * @author srt
 * @since 0.3
 */
public enum ManagerConnectionState
{
    /**
     * The initial state after the ManagerConnection object has been created
     * but the connection has not yet been established.<p>
     * Changes to {@link #CONNECTING} when {@link org.asteriskjava.manager.ManagerConnection#login()}
     * is called.
     */
    INITIAL,
    
    /**
     * The connection is being made and login is performed.<p>
     * Changes to {@link #CONNECTED} when login has successfully completed or
     * {@link #DISCONNECTED} if login fails. 
     */
    CONNECTING,
    
    /**
     * The connection has been successfully established, login has been perfomed and
     * the connection is ready to be used.<p>
     * This is the required state for sending actions to the Asterisk server.<p>
     * Changes to {@link #RECONNECTING} when connection is lost or {@link #DISCONNECTING}
     * when {@link org.asteriskjava.manager.ManagerConnection#logoff()} is called.
     */
    CONNECTED,
    
    /**
     * The connection has been disrupted and is about to be reestablished.<p>
     * Changes to {@link #CONNECTED} when connection is successfully reestablished or
     * {@link #DISCONNECTING} when {@link org.asteriskjava.manager.ManagerConnection#logoff()}
     * is called.
     */
    RECONNECTING,
    
    /**
     * The connection is about to be closed by user request.<p>
     * Changes to {@link #DISCONNECTED} when connection has been closed.
     */
    DISCONNECTING,
    
    /**
     * The connection has been closed on user's request is not about to be reestablished.<p>
     * Can be changed to {@link #CONNECTING} by calling 
     * {@link org.asteriskjava.manager.ManagerConnection#login()}.
     */
    DISCONNECTED
}

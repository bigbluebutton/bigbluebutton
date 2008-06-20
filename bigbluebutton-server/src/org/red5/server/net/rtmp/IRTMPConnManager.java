package org.red5.server.net.rtmp;

import java.util.Collection;

// TODO: Auto-generated Javadoc
/**
 * The Interface IRTMPConnManager.
 */
public interface IRTMPConnManager {
	
	/**
	 * Gets the connection.
	 * 
	 * @param clientId the client id
	 * 
	 * @return the connection
	 */
	RTMPConnection getConnection(int clientId);
	
	/**
	 * Creates the connection.
	 * 
	 * @param connCls the conn cls
	 * 
	 * @return the rTMP connection
	 */
	RTMPConnection createConnection(Class connCls);
	
	/**
	 * Removes the connection.
	 * 
	 * @param clientId the client id
	 * 
	 * @return the rTMP connection
	 */
	RTMPConnection removeConnection(int clientId);
	
	/**
	 * Removes the connections.
	 * 
	 * @return the collection< rtmp connection>
	 */
	Collection<RTMPConnection> removeConnections();
}

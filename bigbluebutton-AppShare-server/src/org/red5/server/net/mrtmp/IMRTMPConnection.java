package org.red5.server.net.mrtmp;

import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * The Interface IMRTMPConnection.
 */
public interface IMRTMPConnection {
	
	/**
	 * Send RTMP packet to other side.
	 * 
	 * @param clientId the client id
	 * @param packet the packet
	 */
	void write(int clientId, Packet packet);
	
	/**
	 * Send connect message to other side.
	 * 
	 * @param clientId the client id
	 */
	void connect(int clientId);
	
	/**
	 * Send disconnect message to other side.
	 * 
	 * @param clientId the client id
	 */
	void disconnect(int clientId);
	
	/**
	 * Close.
	 */
	void close();
}

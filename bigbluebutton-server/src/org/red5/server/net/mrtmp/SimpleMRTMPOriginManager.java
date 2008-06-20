package org.red5.server.net.mrtmp;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.RTMPOriginConnection;

// TODO: Auto-generated Javadoc
/**
 * The Class SimpleMRTMPOriginManager.
 */
public class SimpleMRTMPOriginManager implements IMRTMPOriginManager {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(SimpleMRTMPOriginManager.class);
	
	/** The lock. */
	private ReadWriteLock lock = new ReentrantReadWriteLock();
	
	/** The conn set. */
	private Set<IMRTMPConnection> connSet = new HashSet<IMRTMPConnection>();
	
	/** The client to conn map. */
	private Map<RTMPConnection, IMRTMPConnection> clientToConnMap;
	
	/** The origin mrtmp handler. */
	private OriginMRTMPHandler originMRTMPHandler;
	
	/**
	 * Instantiates a new simple mrtmp origin manager.
	 */
	public SimpleMRTMPOriginManager() {
		// XXX Use HashMap instead of WeakHashMap temporarily
		// to avoid package routing issue before Terracotta
		// integration.
		clientToConnMap = Collections.synchronizedMap(
				new HashMap<RTMPConnection, IMRTMPConnection>());
	}

	/**
	 * Sets the origin mrtmp handler.
	 * 
	 * @param originMRTMPHandler the new origin mrtmp handler
	 */
	public void setOriginMRTMPHandler(OriginMRTMPHandler originMRTMPHandler) {
		this.originMRTMPHandler = originMRTMPHandler;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPManager#registerConnection(org.red5.server.net.mrtmp.IMRTMPConnection)
	 */
	public boolean registerConnection(IMRTMPConnection conn) {
		lock.writeLock().lock();
		try {
			return connSet.add(conn);
		} finally {
			lock.writeLock().unlock();
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPManager#unregisterConnection(org.red5.server.net.mrtmp.IMRTMPConnection)
	 */
	public boolean unregisterConnection(IMRTMPConnection conn) {
		boolean ret;
		ArrayList<RTMPConnection> list = new ArrayList<RTMPConnection>();
		lock.writeLock().lock();
		try {
			ret = connSet.remove(conn);
			if (ret) {
				for (Iterator<Entry<RTMPConnection, IMRTMPConnection>> iter = clientToConnMap.entrySet().iterator(); iter.hasNext(); ) {
					Entry<RTMPConnection, IMRTMPConnection> entry = iter.next();
					if (entry.getValue() == conn) {
						list.add(entry.getKey());
					}
				}
			}
		} finally {
			lock.writeLock().unlock();
		}
		// close all RTMPOriginConnections
		for (RTMPConnection rtmpConn : list) {
			log.debug("Close RTMPOriginConnection " + rtmpConn.getId() + " due to MRTMP Connection closed!");
			originMRTMPHandler.closeConnection((RTMPOriginConnection) rtmpConn);
		}
		return ret;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPOriginManager#associate(org.red5.server.net.rtmp.RTMPConnection, org.red5.server.net.mrtmp.IMRTMPConnection)
	 */
	public void associate(RTMPConnection rtmpConn, IMRTMPConnection mrtmpConn) {
		clientToConnMap.put(rtmpConn, mrtmpConn);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPOriginManager#dissociate(org.red5.server.net.rtmp.RTMPConnection)
	 */
	public void dissociate(RTMPConnection rtmpConn) {
		clientToConnMap.remove(rtmpConn);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPManager#lookupMRTMPConnection(org.red5.server.net.rtmp.RTMPConnection)
	 */
	public IMRTMPConnection lookupMRTMPConnection(RTMPConnection rtmpConn) {
		lock.readLock().lock();
		try {
			IMRTMPConnection conn = clientToConnMap.get(rtmpConn);
			if (conn != null && !connSet.contains(conn)) {
				clientToConnMap.remove(rtmpConn);
				conn = null;
			}
			// mrtmp connection not found, we locate the next mrtmp connection
			// when the connection is not persistent.
			if (conn == null && !rtmpConn.getType().equals(IConnection.PERSISTENT)) {
				if (connSet.size() > 0) {
					conn = connSet.iterator().next();
				}
			}
			// TODO handle conn == null case
			return conn;
		} finally {
			lock.readLock().unlock();
		}
	}

}

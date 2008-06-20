package org.red5.demos.bwcheck;

import org.red5.server.api.IConnection;

/**
 *
 * @author The Red5 Project (red5@osflash.org)
 * @author Dan Rossi
 */
public interface IBandwidthDetection {
	public void checkBandwidth(IConnection p_client);
	public void calculateClientBw(IConnection p_client);
}
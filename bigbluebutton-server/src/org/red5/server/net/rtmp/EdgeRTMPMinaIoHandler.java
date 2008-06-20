package org.red5.server.net.rtmp;

// TODO: Auto-generated Javadoc
/**
 * The Class EdgeRTMPMinaIoHandler.
 */
public class EdgeRTMPMinaIoHandler extends RTMPMinaIoHandler {
	
	/** The rtmp conn manager. */
	private IRTMPConnManager rtmpConnManager;

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaIoHandler#createRTMPMinaConnection()
	 */
	@Override
	protected RTMPMinaConnection createRTMPMinaConnection() {
		return (RTMPMinaConnection) rtmpConnManager.createConnection(EdgeRTMPMinaConnection.class);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaIoHandler#setRtmpConnManager(org.red5.server.net.rtmp.IRTMPConnManager)
	 */
	public void setRtmpConnManager(IRTMPConnManager rtmpConnManager) {
		this.rtmpConnManager = rtmpConnManager;
	}
}

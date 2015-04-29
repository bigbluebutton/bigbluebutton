package org.red5.app.sip;

class SipConnectInfo {

	private final int localPort;
	private final String remoteAddr;
	private final int remotePort;
	
	SipConnectInfo(int localPort, String remoteAddr, int remotePort) {
		this.localPort = localPort;
		this.remoteAddr = remoteAddr;
		this.remotePort = remotePort;
	}

	public int getLocalPort() {
		return localPort;
	}

	public String getRemoteAddr() {
		return remoteAddr;
	}

	public int getRemotePort() {
		return remotePort;
	}
}

package org.bigbluebutton.voiceconf.sip;

import java.net.DatagramSocket;

public class SipConnectInfo {
	private final String remoteAddr;
	private final int remotePort;
	private final DatagramSocket socket;
	
	SipConnectInfo(DatagramSocket socket, String remoteAddr, int remotePort) {
		this.socket = socket;
		this.remoteAddr = remoteAddr;
		this.remotePort = remotePort;
	}

	public DatagramSocket getSocket() {
		return socket;
	}

	public String getRemoteAddr() {
		return remoteAddr;
	}

	public int getRemotePort() {
		return remotePort;
	}
}

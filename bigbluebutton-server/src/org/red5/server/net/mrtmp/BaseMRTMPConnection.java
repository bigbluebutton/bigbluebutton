package org.red5.server.net.mrtmp;

import org.apache.mina.common.IoSession;
import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * The Class BaseMRTMPConnection.
 */
public class BaseMRTMPConnection implements IMRTMPConnection {
	
	/** The io session. */
	private IoSession ioSession;
	
	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPConnection#write(int, org.red5.server.net.rtmp.message.Packet)
	 */
	public void write(int clientId, Packet packet) {
		MRTMPPacket mrtmpPacket = new MRTMPPacket();
		MRTMPPacket.RTMPHeader header = new MRTMPPacket.RTMPHeader();
		MRTMPPacket.RTMPBody body = new MRTMPPacket.RTMPBody();
		mrtmpPacket.setHeader(header);
		mrtmpPacket.setBody(body);
		header.setType(MRTMPPacket.RTMP);
		header.setClientId(clientId);
		// header and body length will be filled in the protocol codec
		header.setRtmpType(packet.getHeader().getDataType());
		body.setRtmpPacket(packet);
		ioSession.write(mrtmpPacket);
	}
	
	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPConnection#connect(int)
	 */
	public void connect(int clientId) {
		MRTMPPacket mrtmpPacket = new MRTMPPacket();
		MRTMPPacket.Header header = new MRTMPPacket.Header();
		MRTMPPacket.Body body = new MRTMPPacket.Body();
		mrtmpPacket.setHeader(header);
		mrtmpPacket.setBody(body);
		header.setType(MRTMPPacket.CONNECT);
		header.setClientId(clientId);
		// header and body length will be filled in the protocol codec
		ioSession.write(mrtmpPacket);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPConnection#disconnect(int)
	 */
	public void disconnect(int clientId) {
		MRTMPPacket mrtmpPacket = new MRTMPPacket();
		MRTMPPacket.Header header = new MRTMPPacket.Header();
		MRTMPPacket.Body body = new MRTMPPacket.Body();
		mrtmpPacket.setHeader(header);
		mrtmpPacket.setBody(body);
		header.setType(MRTMPPacket.CLOSE);
		header.setClientId(clientId);
		// header and body length will be filled in the protocol codec
		ioSession.write(mrtmpPacket);		
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.mrtmp.IMRTMPConnection#close()
	 */
	public void close() {
		ioSession.close();
	}

	/**
	 * Gets the io session.
	 * 
	 * @return the io session
	 */
	public IoSession getIoSession() {
		return ioSession;
	}

	/**
	 * Sets the io session.
	 * 
	 * @param ioSession the new io session
	 */
	public void setIoSession(IoSession ioSession) {
		this.ioSession = ioSession;
	}
}

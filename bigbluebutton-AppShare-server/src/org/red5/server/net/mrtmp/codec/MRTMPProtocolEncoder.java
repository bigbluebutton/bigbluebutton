package org.red5.server.net.mrtmp.codec;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoder;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import org.red5.server.net.mrtmp.MRTMPPacket;

// TODO: Auto-generated Javadoc
/**
 * The Class MRTMPProtocolEncoder.
 */
public class MRTMPProtocolEncoder implements ProtocolEncoder {

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolEncoder#dispose(org.apache.mina.common.IoSession)
	 */
	public void dispose(IoSession session) throws Exception {
		// TODO Auto-generated method stub

	}

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolEncoder#encode(org.apache.mina.common.IoSession, java.lang.Object, org.apache.mina.filter.codec.ProtocolEncoderOutput)
	 */
	public void encode(IoSession session, Object message,
			ProtocolEncoderOutput out) throws Exception {
		MRTMPPacket packet = (MRTMPPacket) message;
		MRTMPPacket.Header header = packet.getHeader();
		ByteBuffer buf = null;
		switch (header.getType()) {
			case MRTMPPacket.CONNECT:
			case MRTMPPacket.CLOSE:
				buf = ByteBuffer.allocate(MRTMPPacket.COMMON_HEADER_LENGTH);
				buf.setAutoExpand(true);
				break;
			case MRTMPPacket.RTMP:
				buf = ByteBuffer.allocate(MRTMPPacket.RTMP_HEADER_LENGTH);
				buf.setAutoExpand(true);
				break;
			default:
				break;
		}
		if (buf == null) {
			return;
		}
		buf.putShort(header.getType());
		buf.putShort(MRTMPPacket.JAVA_ENCODING);
		int preserved = header.isDynamic() ? 0x80000000 : 0;
		buf.putInt(preserved);
		buf.putInt(header.getClientId());
		if (header.getType() == MRTMPPacket.CONNECT ||
				header.getType() == MRTMPPacket.CLOSE) {
			buf.putInt(MRTMPPacket.COMMON_HEADER_LENGTH);
			buf.putInt(0);
		} else if (header.getType() == MRTMPPacket.RTMP) {
			buf.putInt(MRTMPPacket.RTMP_HEADER_LENGTH);
			int bodyLengthPos = buf.position();
			buf.putInt(0);
			MRTMPPacket.RTMPHeader rtmpHeader = (MRTMPPacket.RTMPHeader) packet.getHeader();
			buf.putInt(rtmpHeader.getRtmpType());
			MRTMPPacket.RTMPBody body = (MRTMPPacket.RTMPBody) packet.getBody();
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			ObjectOutputStream oos = new ObjectOutputStream(baos);
			oos.writeObject(body.getRtmpPacket());
			oos.close();
			buf.put(baos.toByteArray());
			// substract the 8-byte body length field and rtmp type field
			buf.putInt(bodyLengthPos, buf.position() - bodyLengthPos - 8);
		}
		buf.flip();
		out.write(buf);
	}
}

package org.red5.server.net.mrtmp.codec;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoSession;
import org.apache.mina.filter.codec.ProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import org.red5.server.net.mrtmp.MRTMPPacket;
import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * The Class MRTMPProtocolDecoder.
 */
public class MRTMPProtocolDecoder implements ProtocolDecoder {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(MRTMPProtocolDecoder.class);

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolDecoder#decode(org.apache.mina.common.IoSession, org.apache.mina.common.ByteBuffer, org.apache.mina.filter.codec.ProtocolDecoderOutput)
	 */
	public void decode(IoSession session, ByteBuffer in,
			ProtocolDecoderOutput out) throws Exception {
		ByteBuffer buffer = (ByteBuffer) session.getAttribute("buffer");
		if (buffer == null) {
			buffer = ByteBuffer.allocate(16 * 1024);
			buffer.setAutoExpand(true);
			session.setAttribute("buffer", buffer);
		}
		buffer.put(in);
		buffer.flip();
		while (true) {
			if (buffer.remaining() < MRTMPPacket.COMMON_HEADER_LENGTH) {
				break;
			}
			int pos = buffer.position();
			MRTMPPacket.Header header = decodeHeader(buffer);
			if (header == null) {
				buffer.position(pos);
				break;
			}
			if (buffer.remaining() < header.getBodyLength()) {
				buffer.position(pos);
				break;
			}
			MRTMPPacket.Body body = decodeBody(buffer, header);
			MRTMPPacket packet = new MRTMPPacket();
			packet.setHeader(header);
			packet.setBody(body);
			if (log.isDebugEnabled()) {
				log.debug(packet.toString());
			}
			out.write(packet);
		}
		buffer.compact();
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolDecoder#dispose(org.apache.mina.common.IoSession)
	 */
	public void dispose(IoSession session) throws Exception {
		// nothing to dispose for decoding
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolDecoder#finishDecode(org.apache.mina.common.IoSession, org.apache.mina.filter.codec.ProtocolDecoderOutput)
	 */
	public void finishDecode(IoSession session, ProtocolDecoderOutput out)
			throws Exception {
		ByteBuffer buffer = (ByteBuffer) session.getAttribute("buffer");
		if (buffer != null) {
			buffer.release();
		}
	}
	
	/**
	 * Decode header.
	 * 
	 * @param buffer the buffer
	 * 
	 * @return the mRTMP packet. header
	 */
	public MRTMPPacket.Header decodeHeader(ByteBuffer buffer) {
		short type = buffer.getShort();
		short bodyEncoding = buffer.getShort();
		int preserved = buffer.getInt();
		int clientId = buffer.getInt();
		int headerLength = buffer.getInt();
		int bodyLength = buffer.getInt();
		if (buffer.remaining() < headerLength - MRTMPPacket.COMMON_HEADER_LENGTH) {
			return null;
		}
		MRTMPPacket.Header header = null;
		if (type == MRTMPPacket.RTMP && headerLength != MRTMPPacket.RTMP_HEADER_LENGTH) {
			// XXX errrh, something weird happens
			log.warn("Codec error: wrong RTMP header length " + headerLength);
			header = new MRTMPPacket.Header();
			buffer.skip(headerLength - MRTMPPacket.COMMON_HEADER_LENGTH);
		} else if (type == MRTMPPacket.RTMP) {
			header = new MRTMPPacket.RTMPHeader();
			MRTMPPacket.RTMPHeader rtmpHeader = (MRTMPPacket.RTMPHeader) header;
			rtmpHeader.setRtmpType(buffer.getInt());
		} else {
			header = new MRTMPPacket.Header();
			buffer.skip(headerLength - MRTMPPacket.COMMON_HEADER_LENGTH);
		}
		header.setType(type);
		header.setBodyEncoding(bodyEncoding);
		header.setDynamic((preserved & 0x8000000) != 0);
		header.setClientId(clientId);
		header.setHeaderLength(headerLength);
		header.setBodyLength(bodyLength);
		return header;
	}

	/**
	 * Decode body.
	 * 
	 * @param buffer the buffer
	 * @param header the header
	 * 
	 * @return the mRTMP packet. body
	 */
	public MRTMPPacket.Body decodeBody(ByteBuffer buffer, MRTMPPacket.Header header) {
		MRTMPPacket.Body body = null;
		switch (header.getType()) {
			case MRTMPPacket.CONNECT:
			case MRTMPPacket.CLOSE:
				if (header.getBodyLength() != 0) {
					// XXX something weird happens
					log.warn("Codec error: wrong connect/close body length " + header.getBodyLength());
				}
				return new MRTMPPacket.Body();
			case MRTMPPacket.RTMP:
				byte[] byteArray = new byte[header.getBodyLength()];
				buffer.get(byteArray);
				ObjectInputStream ois = null;
				try {
					ois = new ObjectInputStream(new ByteArrayInputStream(byteArray));
					Packet packet = (Packet) ois.readObject();
					body = new MRTMPPacket.RTMPBody();
					MRTMPPacket.RTMPBody rtmpBody = (MRTMPPacket.RTMPBody) body;
					rtmpBody.setRtmpPacket(packet);
				} catch (IOException e) {
					// XXX should not happen
					log.error("", e);
				} catch (ClassNotFoundException e) {
					// XXX should not happen
					log.error("", e);
				}
				break;
			default:
				byteArray = new byte[header.getBodyLength()];
				buffer.get(byteArray);
				body = new MRTMPPacket.Body();
				body.setRawBuf(ByteBuffer.wrap(byteArray));
				break;
		}
		return body;
	}
}

package org.red5.server.net.mrtmp;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * The Class MRTMPPacket.
 */
public class MRTMPPacket {
	
	/** The Constant CONNECT. */
	public static final short CONNECT = 0;
	
	/** The Constant CLOSE. */
	public static final short CLOSE = 1;
	
	/** The Constant RTMP. */
	public static final short RTMP = 2;
	
	/** The Constant JAVA_ENCODING. */
	public static final short JAVA_ENCODING = 0;
	
	/** The Constant COMMON_HEADER_LENGTH. */
	public static final int COMMON_HEADER_LENGTH = 20;
	
	/** The Constant RTMP_HEADER_LENGTH. */
	public static final int RTMP_HEADER_LENGTH = COMMON_HEADER_LENGTH + 4;
	
	/** The header. */
	private Header header;
	
	/** The body. */
	private Body body;
	
	/**
	 * The Class Header.
	 */
	static public class Header {
		
		/** The type. */
		private short type;
		
		/** The body encoding. */
		private short bodyEncoding;
		
		/** The dynamic. */
		private boolean dynamic;
		
		/** The client id. */
		private int clientId;
		
		/** The header length. */
		private int headerLength;
		
		/** The body length. */
		private int bodyLength;
		
		/**
		 * Gets the body length.
		 * 
		 * @return the body length
		 */
		public int getBodyLength() {
			return bodyLength;
		}
		
		/**
		 * Sets the body length.
		 * 
		 * @param bodyLength the new body length
		 */
		public void setBodyLength(int bodyLength) {
			this.bodyLength = bodyLength;
		}
		
		/**
		 * Gets the client id.
		 * 
		 * @return the client id
		 */
		public int getClientId() {
			return clientId;
		}
		
		/**
		 * Sets the client id.
		 * 
		 * @param clientId the new client id
		 */
		public void setClientId(int clientId) {
			this.clientId = clientId;
		}
		
		/**
		 * Gets the header length.
		 * 
		 * @return the header length
		 */
		public int getHeaderLength() {
			return headerLength;
		}
		
		/**
		 * Sets the header length.
		 * 
		 * @param headerLength the new header length
		 */
		public void setHeaderLength(int headerLength) {
			this.headerLength = headerLength;
		}
		
		/**
		 * Gets the type.
		 * 
		 * @return the type
		 */
		public short getType() {
			return type;
		}
		
		/**
		 * Sets the type.
		 * 
		 * @param type the new type
		 */
		public void setType(short type) {
			this.type = type;
		}

		/**
		 * Gets the body encoding.
		 * 
		 * @return the body encoding
		 */
		public short getBodyEncoding() {
			return bodyEncoding;
		}

		/**
		 * Sets the body encoding.
		 * 
		 * @param bodyEncoding the new body encoding
		 */
		public void setBodyEncoding(short bodyEncoding) {
			this.bodyEncoding = bodyEncoding;
		}

		/**
		 * Checks if is dynamic.
		 * 
		 * @return true, if is dynamic
		 */
		public boolean isDynamic() {
			return dynamic;
		}

		/**
		 * Sets the dynamic.
		 * 
		 * @param dynamic the new dynamic
		 */
		public void setDynamic(boolean dynamic) {
			this.dynamic = dynamic;
		}
		
	}
	
	/**
	 * The Class Body.
	 */
	static public class Body {
		
		/** The raw buf. */
		private ByteBuffer rawBuf;

		/**
		 * Gets the raw buf.
		 * 
		 * @return the raw buf
		 */
		public ByteBuffer getRawBuf() {
			return rawBuf;
		}

		/**
		 * Sets the raw buf.
		 * 
		 * @param rawBuf the new raw buf
		 */
		public void setRawBuf(ByteBuffer rawBuf) {
			this.rawBuf = rawBuf;
		}
		
	}
	
	/**
	 * The Class RTMPHeader.
	 */
	static public class RTMPHeader extends Header {
		
		/** The rtmp type. */
		private int rtmpType;

		/**
		 * Gets the rtmp type.
		 * 
		 * @return the rtmp type
		 */
		public int getRtmpType() {
			return rtmpType;
		}

		/**
		 * Sets the rtmp type.
		 * 
		 * @param rtmpType the new rtmp type
		 */
		public void setRtmpType(int rtmpType) {
			this.rtmpType = rtmpType;
		}
		
	}
	
	/**
	 * The Class RTMPBody.
	 */
	static public class RTMPBody extends Body {
		
		/** The rtmp packet. */
		private Packet rtmpPacket;

		/**
		 * Gets the rtmp packet.
		 * 
		 * @return the rtmp packet
		 */
		public Packet getRtmpPacket() {
			return rtmpPacket;
		}

		/**
		 * Sets the rtmp packet.
		 * 
		 * @param rtmpPacket the new rtmp packet
		 */
		public void setRtmpPacket(Packet rtmpPacket) {
			this.rtmpPacket = rtmpPacket;
		}
	}

	/**
	 * Gets the body.
	 * 
	 * @return the body
	 */
	public Body getBody() {
		return body;
	}

	/**
	 * Sets the body.
	 * 
	 * @param body the new body
	 */
	public void setBody(Body body) {
		this.body = body;
	}

	/**
	 * Gets the header.
	 * 
	 * @return the header
	 */
	public Header getHeader() {
		return header;
	}

	/**
	 * Sets the header.
	 * 
	 * @param header the new header
	 */
	public void setHeader(Header header) {
		this.header = header;
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		StringBuffer buf = new StringBuffer();
		buf.append("MRTMPPacket: type=");
		switch (header.getType()) {
			case CONNECT:
				buf.append("CONNECT");
				break;
			case CLOSE:
				buf.append("CLOSE");
				break;
			case RTMP:
				buf.append("RTMP");
				break;
			default:
				break;
		}
		buf.append(",isDynamic=" + header.isDynamic());
		buf.append(",clientId=" + header.getClientId());
		if (header.getType() == RTMP) {
			RTMPHeader rtmpHeader = (RTMPHeader) header;
			buf.append(",rtmpType=" + rtmpHeader.rtmpType);
			RTMPBody rtmpBody = (RTMPBody) body;
			buf.append(",rtmpBody=" + rtmpBody.rtmpPacket.getMessage());
		}

		return buf.toString();
	}
}

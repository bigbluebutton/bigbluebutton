package org.red5.server.net.rtmp.event;

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * The Class SerializeUtils.
 */
public class SerializeUtils {
	
	/**
	 * Byte buffer to byte array.
	 * 
	 * @param buf the buf
	 * 
	 * @return the byte[]
	 */
	public static byte[] ByteBufferToByteArray(ByteBuffer buf) {
		byte[] byteBuf = new byte[buf.limit()];
		int pos = buf.position();
		buf.rewind();
		buf.get(byteBuf);
		buf.position(pos);
		return byteBuf;
	}
	
	/**
	 * Byte array to byte buffer.
	 * 
	 * @param byteBuf the byte buf
	 * @param buf the buf
	 */
	public static void ByteArrayToByteBuffer(byte[] byteBuf, ByteBuffer buf) {
		buf.put(byteBuf);
		buf.flip();
	}
}

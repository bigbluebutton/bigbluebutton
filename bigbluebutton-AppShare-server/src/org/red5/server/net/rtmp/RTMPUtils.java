package org.red5.server.net.rtmp;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import org.apache.mina.common.ByteBuffer;
import org.red5.server.net.rtmp.message.Constants;

// TODO: Auto-generated Javadoc
/**
 * RTMP utilities class.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class RTMPUtils implements Constants {
    
    /**
     * Writes reversed integer to buffer.
     * 
     * @param out          Buffer
     * @param value        Integer to write
     */
	public static void writeReverseIntOld(ByteBuffer out, int value) {
		byte[] bytes = new byte[4];
		ByteBuffer rev = ByteBuffer.allocate(4);
		rev.putInt(value);
		rev.flip();
		bytes[3] = rev.get();
		bytes[2] = rev.get();
		bytes[1] = rev.get();
		bytes[0] = rev.get();
		out.put(bytes);
		rev.release();
		rev = null;
	}

    /**
     * Writes reversed integer to buffer.
     * 
     * @param out          Buffer
     * @param value        Integer to write
     */
	public static void writeReverseInt(ByteBuffer out, int value) {
		out.put((byte) (0xFF & value));
		out.put((byte) (0xFF & (value >> 8)));
		out.put((byte) (0xFF & (value >> 16)));
		out.put((byte) (0xFF & (value >> 24)));
	}

    /**
     * Write medium int.
     * 
     * @param out the out
     * @param value the value
     */
	public static void writeMediumInt(ByteBuffer out, int value) {
		out.put((byte) (0xFF & (value >> 16)));
		out.put((byte) (0xFF & (value >> 8)));
		out.put((byte) (0xFF & (value >> 0)));
	}

    /**
     * Read unsigned medium int.
     * 
     * @param in the in
     * 
     * @return the int
     */
	public static int readUnsignedMediumInt(ByteBuffer in) {
		final byte a = in.get();
		final byte b = in.get();
		final byte c = in.get();
		int val = 0;
		// Fix unsigned values
		if (a < 0) {
			val += ((a + 256) << 16);
		} else {
			val += (a << 16);
		}
		if (b < 0) {
			val += ((b + 256) << 8);
		} else {
			val += (b << 8);
		}
		if (c < 0) {
			val += c + 256;
		} else {
			val += c;
		}
		return val;
	}

    /**
     * Read unsigned medium int old.
     * 
     * @param in the in
     * 
     * @return the int
     */
	public static int readUnsignedMediumIntOld(ByteBuffer in) {
		byte[] bytes = new byte[3];
		in.get(bytes);
		int val = 0;
		val += (bytes[0] & 0xFF) * 256 * 256;
		val += (bytes[1] & 0xFF) * 256;
		val += (bytes[2] & 0xFF);
		return val;
	}

    /**
     * Read medium int old.
     * 
     * @param in the in
     * 
     * @return the int
     */
	public static int readMediumIntOld(ByteBuffer in) {
		ByteBuffer buf = ByteBuffer.allocate(4);
		buf.put((byte) 0x00);
		buf.put(in.get());
		buf.put(in.get());
		buf.put(in.get());
		buf.flip();
		int value = buf.getInt();
		buf.release();
		buf = null;
		return value;
	}

    /**
     * Read medium int.
     * 
     * @param in the in
     * 
     * @return the int
     */
	public static int readMediumInt(ByteBuffer in) {
		final byte a = in.get();
		final byte b = in.get();
		final byte c = in.get();
		// Fix unsigned values
		int val = 0;
		if (a < 0) {
			val += ((a + 256) << 16);
		} else {
			val += (a << 16);
		}
		if (b < 0) {
			val += ((b + 256) << 8);
		} else {
			val += (b << 8);
		}
		if (c < 0) {
			val += c + 256;
		} else {
			val += c;
		}
		return val;
	}

    /**
     * Read integer in reversed order.
     * 
     * @param in         Input buffer
     * 
     * @return           Integer
     */
	public static int readReverseInt(ByteBuffer in) {
		final byte a = in.get();
		final byte b = in.get();
		final byte c = in.get();
		final byte d = in.get();
		int val = 0;
		val += d << 24;
		val += c << 16;
		val += b << 8;
		val += a;
		return val;
	}

    /**
     * Read integer in reversed order.
     * 
     * @param in         Input buffer
     * 
     * @return           Integer
     */
	public static int readReverseIntOld(ByteBuffer in) {
		byte[] bytes = new byte[4];
		in.get(bytes);
		int val = 0;
		val += bytes[3] * 256 * 256 * 256;
		val += bytes[2] * 256 * 256;
		val += bytes[1] * 256;
		val += bytes[0];
		return val;
	}

    /**
     * Encodes header size marker and channel id into header marker.
     * 
     * @param headerSize         Header size marker
     * @param channelId          Channel used
     * @param out the out
     * 
     * @return                   Header id
     */
	public static void encodeHeaderByte(ByteBuffer out, byte headerSize, int channelId) {
		if (channelId <= 63) {
			out.put((byte) ((headerSize << 6) + channelId));
		} else if (channelId <= 320) {
			out.put((byte) (headerSize << 6));
			out.put((byte) (channelId - 64));
		} else {
			out.put((byte) ((headerSize << 6) | 1));
			channelId -= 64;
			out.put((byte) (channelId & 0xff));
			out.put((byte) (channelId >> 8));
		}
	}

    /**
     * Decode channel id.
     * 
     * @param header        Header
     * @param byteCount the byte count
     * 
     * @return              Channel id
     */
	public static int decodeChannelId(int header, int byteCount) {
		if (byteCount == 1) {
			return (header & 0x3f);
		} else if (byteCount == 2) {
			return 64 + (header & 0xff);
		} else {
			return 64 + ((header >> 8) & 0xff) + ((header & 0xff) << 8);
		}
	}

    /**
     * Decode header size.
     * 
     * @param header      Header byte
     * @param byteCount the byte count
     * 
     * @return            Header size byte
     */
    public static byte decodeHeaderSize(int header, int byteCount) {
    	if (byteCount == 1) {
    		return (byte) (header >> 6);
    	} else if (byteCount == 2) {
        	return (byte) (header >> 14);
    	} else {
    		return (byte) (header >> 22);
    	}
	}

    /**
     * Return header length from marker value.
     * 
     * @param headerSize       Header size marker value
     * 
     * @return                 Header length
     */
    public static int getHeaderLength(byte headerSize) {
		switch (headerSize) {
			case HEADER_NEW:
				return 12;
			case HEADER_SAME_SOURCE:
				return 8;
			case HEADER_TIMER_CHANGE:
				return 4;
			case HEADER_CONTINUE:
				return 1;
			default:
				return -1;
		}
	}

}

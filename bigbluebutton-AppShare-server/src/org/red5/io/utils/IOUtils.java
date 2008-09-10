package org.red5.io.utils;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
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

import java.nio.charset.Charset;

import org.apache.mina.common.ByteBuffer;
import org.slf4j.Logger;

// TODO: Auto-generated Javadoc
/**
 * Misc I/O util methods.
 */
public class IOUtils {

    /** UTF-8 is used. */
    public static final Charset CHARSET = Charset.forName("UTF-8");

    /**
     * Writes integer in reverse order.
     * 
     * @param out         Data buffer to fill
     * @param value       Integer
     */
    public static void writeReverseInt(ByteBuffer out, int value) {
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
     * Writes medium integer.
     * 
     * @param out           Output buffer
     * @param value         Integer to write
     */
	public static void writeMediumInt(ByteBuffer out, int value) {
		byte[] bytes = new byte[3];
		bytes[0] = (byte) ((value >>> 16) & 0x000000FF);
		bytes[1] = (byte) ((value >>> 8) & 0x000000FF);
		bytes[2] = (byte) (value & 0x00FF);
		out.put(bytes);
	}

    /**
     * Reads unsigned medium integer.
     * 
     * @param in              Unsigned medium int source
     * 
     * @return                int value
     */
    public static int readUnsignedMediumInt(ByteBuffer in) {
		//byte[] bytes = new byte[3];
		//in.get(bytes);
		int val = 0;
		val += (in.get() & 0xFF) * 256 * 256;
		val += (in.get() & 0xFF) * 256;
		val += (in.get() & 0xFF);
		return val;
	}

    /**
     * Reads medium int.
     * 
     * @param in       Source
     * 
     * @return         int value
     */
    public static int readMediumInt(ByteBuffer in) {
		ByteBuffer buf = ByteBuffer.allocate(4);
		buf.put((byte) 0x00);
		buf.put(in.get());
		buf.put(in.get());
		buf.put(in.get());
		buf.flip();
		return buf.getInt();
	}

    /**
     * Alternate method for reading medium int.
     * 
     * @param in       Source
     * 
     * @return         int value
     */
    public static int readMediumInt2(ByteBuffer in) {
		byte[] bytes = new byte[3];
		in.get(bytes);
		int val = 0;
		val += bytes[0] * 256 * 256;
		val += bytes[1] * 256;
		val += bytes[2];
		if (val < 0) {
			val += 256;
		}
		return val;
	}

    /**
     * Reads reverse int.
     * 
     * @param in       Source
     * 
     * @return         int
     */
    public static int readReverseInt(ByteBuffer in) {
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
     * Format debug message.
     * 
     * @param log          Logger
     * @param msg          Message
     * @param buf          Byte buffer to debug
     */
    public static void debug(Logger log, String msg, ByteBuffer buf) {
		if (log.isDebugEnabled()) {

			log.debug(msg);
			log.debug("Size: " + buf.remaining());
			log.debug("Data:\n\n" + HexDump.formatHexDump(buf.getHexDump()));

			final String string = toString(buf);

			log.debug("\n" + string + "\n");

			//log.debug("Data:\n\n" + b);
		}
	}

    /**
     * String representation of byte buffer.
     * 
     * @param buf           Byte buffer
     * 
     * @return              String representation
     */
    public static String toString(ByteBuffer buf) {
		int pos = buf.position();
		int limit = buf.limit();
		final java.nio.ByteBuffer strBuf = buf.buf();
		final String string = CHARSET.decode(strBuf).toString();
		buf.position(pos);
		buf.limit(limit);
		return string;
	}

}

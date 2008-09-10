/*
 * Copyright  1999-2004 The Apache Software Foundation.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.red5.io.utils;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Hexadecimal byte dumper.
 * 
 * @author Niko Schweitzer
 */
public class HexDump {

	/** Logger. */
	private static final Logger logger = LoggerFactory.getLogger(HexDump.class);

	/**
	 * Method prettyPrintHex.
	 * 
	 * @param bbToConvert ByteBuffer to encode
	 * 
	 * @return Hexdump string
	 */
	public static String prettyPrintHex(ByteBuffer bbToConvert) {
		return prettyPrintHex(bbToConvert.array());
	}

	/**
	 * Method prettyPrintHex.
	 * 
	 * @param baToConvert Array of bytes to encode
	 * 
	 * @return Hexdump string
	 */
	public static String prettyPrintHex(byte[] baToConvert) {
		HexCharset hde = (HexCharset) HexCharset.forName("HEX");
		return new String(hde.encode(new String(baToConvert)).array());
	}

	/**
	 * Method prettyPrintHex.
	 * 
	 * @param sToConvert the s to convert
	 * 
	 * @return hexdump string
	 */
	public static String prettyPrintHex(String sToConvert) {
		HexCharset hde = (HexCharset) HexCharset.forName("HEX");
		return new String(hde.encode(sToConvert).array());
	}

	/** Field HEX_DIGITS. */
	private static final char[] HEX_DIGITS = { '0', '1', '2', '3', '4', '5',
			'6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };

	/** Field BIT_DIGIT. */
	private static char[] BIT_DIGIT = { '0', '1' };

	/** Field COMPARE_BITS. */
	private static final byte[] COMPARE_BITS = { (byte) 0x80, (byte) 0x40,
			(byte) 0x20, (byte) 0x10, (byte) 0x08, (byte) 0x04, (byte) 0x02,
			(byte) 0x01 };

	/** Field BYTE_SEPARATOR. */
	private static char BYTE_SEPARATOR = ' ';

	/** Field WITH_BYTE_SEPARATOR. */
	private static boolean WITH_BYTE_SEPARATOR = true;

	/**
	 * Sets the WithByteSeparator attribute of the Convert class.
	 * 
	 * @param bs The new WithByteSeparator value
	 */
	public static void setWithByteSeparator(boolean bs) {
		WITH_BYTE_SEPARATOR = bs;
	}

	/**
	 * Sets the ByteSeparator attribute of the Convert class.
	 * 
	 * @param bs The new ByteSeparator value
	 */
	public static void setByteSeparator(char bs) {
		BYTE_SEPARATOR = bs;
	}

	/**
	 * Sets the BitDigits attribute of the Convert class.
	 * 
	 * @param bd The new BitDigits value
	 * 
	 * @throws Exception the exception
	 * 
	 * @exception Exception
	 * Description of Exception
	 */
	public static void setBitDigits(char[] bd) throws Exception {

		if (bd.length != 2) {
			throw new Exception("wrong number of characters!");
		}

		BIT_DIGIT = bd;
	}

	/**
	 * Method setBitDigits.
	 * 
	 * @param zeroBit the zero bit
	 * @param oneBit the one bit
	 */
	public static void setBitDigits(char zeroBit, char oneBit) {
		BIT_DIGIT[0] = zeroBit;
		BIT_DIGIT[1] = oneBit;
	}

	/*
	 * Converts a byte array to hex string
	 */

	/**
	 * Description of the Method.
	 * 
	 * @param block Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	public static String byteArrayToBinaryString(byte[] block) {

		StringBuffer strBuf = new StringBuffer();
		int iLen = block.length;

		// ---- for all bytes of array
		for (int i = 0; i < iLen; i++) {
			byte2bin(block[i], strBuf);

			// ---- if bit i is set ----//
			if ((i < iLen - 1) & WITH_BYTE_SEPARATOR) {
				strBuf.append(BYTE_SEPARATOR);
			}
		}

		return strBuf.toString();
	}

	/**
	 * Method toBinaryString.
	 * 
	 * @param ba the ba
	 * 
	 * @return the binary representation of the byte array
	 */
	public static String toBinaryString(byte[] ba) {
		return byteArrayToBinaryString(ba);
	}

	/**
	 * Method toBinaryString.
	 * 
	 * @param b the b
	 * 
	 * @return the binary representation of the byte
	 */
	public static String toBinaryString(byte b) {

		byte[] ba = new byte[1];

		ba[0] = b;

		return byteArrayToBinaryString(ba);
	}

	/**
	 * Method toBinaryString.
	 * 
	 * @param s the s
	 * 
	 * @return the binary representation of the short
	 */
	public static String toBinaryString(short s) {
		return toBinaryString(toByteArray(s));
	}

	/**
	 * Method toBinaryString.
	 * 
	 * @param i the i
	 * 
	 * @return the binary representation of the int
	 */
	public static String toBinaryString(int i) {
		return toBinaryString(toByteArray(i));
	}

	/**
	 * Method toBinaryString.
	 * 
	 * @param l the l
	 * 
	 * @return the binary representation of the long
	 */
	public static String toBinaryString(long l) {
		return toBinaryString(toByteArray(l));
	}

	/**
	 * Method toByteArray.
	 * 
	 * @param s the s
	 * 
	 * @return the short as array of bytes
	 */
	public static final byte[] toByteArray(short s) {

		byte[] baTemp = new byte[2];

		baTemp[1] = (byte) (s);
		baTemp[0] = (byte) (s >> 8);

		return baTemp;
	}

	/**
	 * Method toByteArray.
	 * 
	 * @param i the i
	 * 
	 * @return the int as array of bytes
	 */
	public static final byte[] toByteArray(int i) {

		byte[] baTemp = new byte[4];

		baTemp[3] = (byte) i;
		baTemp[2] = (byte) (i >> 8);
		baTemp[1] = (byte) (i >> 16);
		baTemp[0] = (byte) (i >> 24);

		return baTemp;
	}

	/**
	 * Method toByteArray.
	 * 
	 * @param l the l
	 * 
	 * @return the long as array of bytes
	 */
	public static final byte[] toByteArray(long l) {

		byte[] baTemp = new byte[8];

		baTemp[7] = (byte) l;
		baTemp[6] = (byte) (l >> 8);
		baTemp[5] = (byte) (l >> 16);
		baTemp[4] = (byte) (l >> 24);
		baTemp[3] = (byte) (l >> 32);
		baTemp[2] = (byte) (l >> 40);
		baTemp[1] = (byte) (l >> 48);
		baTemp[0] = (byte) (l >> 56);

		return baTemp;
	}

	/**
	 * Description of the Method.
	 * 
	 * @param block Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	public static String byteArrayToHexString(byte[] block) {

		StringBuffer buf = new StringBuffer();
		int len = block.length;

		for (int i = 0; i < len; i++) {
			byte2hex(block[i], buf);

			if ((i < len - 1) & WITH_BYTE_SEPARATOR) {
				buf.append(BYTE_SEPARATOR);
			}
		}

		return buf.toString();
	}

	/**
	 * Description of the Method.
	 * 
	 * @param in string to be converted
	 * 
	 * @return String in readable hex encoding
	 */
	public static String stringToHexString(String in) {

		byte[] ba = in.getBytes();

		return toHexString(ba);
	}

	/**
	 * Description of the Method.
	 * 
	 * @param block Description of Parameter
	 * @param offset Description of Parameter
	 * @param length Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	public static String byteArrayToHexString(byte[] block, int offset,
			int length) {

		StringBuffer buf = new StringBuffer();
		int len = block.length;

		length = length + offset;

		if ((len < length)) {
			length = len;
		}

		for (int i = 0 + offset; i < length; i++) {
			byte2hex(block[i], buf);

			if (i < length - 1) {
				buf.append(':');
			}
		}

		return buf.toString();
	}

	/**
	 * Returns a string of hexadecimal digits from a byte array. Each byte is
	 * converted to 2 hex symbols.
	 * 
	 * @param ba Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	public static String toHexString(byte[] ba) {
		return toHexString(ba, 0, ba.length);
	}

	/**
	 * Method toHexString.
	 * 
	 * @param b the b
	 * 
	 * @return the hexadecimal representation of the byte
	 */
	public static String toHexString(byte b) {

		byte[] ba = new byte[1];

		ba[0] = b;

		return toHexString(ba, 0, ba.length);
	}

	/**
	 * Description of the Method.
	 * 
	 * @param s the s
	 * 
	 * @return Description of the Returned Value
	 */
	public static String toHexString(short s) {
		return toHexString(toByteArray(s));
	}

	/**
	 * Method toHexString.
	 * 
	 * @param i the i
	 * 
	 * @return the hexadecimal representation of the int
	 */
	public static String toHexString(int i) {
		return toHexString(toByteArray(i));
	}

	/**
	 * Method toHexString.
	 * 
	 * @param l the l
	 * 
	 * @return the hexadecimal representation of the long
	 */
	public static String toHexString(long l) {
		return toHexString(toByteArray(l));
	}

	/**
	 * Method toString.
	 * 
	 * @param ba the ba
	 * 
	 * @return the byte array as string
	 */
	public static String toString(byte[] ba) {
		return new String(ba);
	}

	/**
	 * Method toString.
	 * 
	 * @param b the b
	 * 
	 * @return the byte as string
	 */
	public static String toString(byte b) {

		byte[] ba = new byte[1];

		ba[0] = b;

		return new String(ba);
	}

	/**
	 * converts String to Hex String. Example: niko ->6E696B6F
	 * 
	 * @param ba Description of Parameter
	 * @param offset Description of Parameter
	 * @param length Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	public static String toHexString(byte[] ba, int offset, int length) {

		char[] buf;

		if (WITH_BYTE_SEPARATOR) {
			buf = new char[length * 3];
		} else {
			buf = new char[length * 2];
		}

		for (int i = offset, j = 0, k; i < offset + length;) {
			k = ba[i++];
			buf[j++] = HEX_DIGITS[(k >>> 4) & 0x0F];
			buf[j++] = HEX_DIGITS[k & 0x0F];

			if (WITH_BYTE_SEPARATOR) {
				buf[j++] = BYTE_SEPARATOR;
			}
		}

		return new String(buf);
	}

	/**
	 * Converts readable hex-String to byteArray.
	 * 
	 * @param strA the str a
	 * 
	 * @return the hexadecimal string as byte array
	 */
	public static byte[] hexStringToByteArray(String strA) {
		ByteArrayOutputStream result = new ByteArrayOutputStream();

		// alle Hex-Zeichen konvertieren, den Rest Ignorieren
		// jedes Zeichen stellt einen 4-Bit Wert dar
		byte sum = (byte) 0x00;
		boolean nextCharIsUpper = true;

		for (int i = 0; i < strA.length(); i++) {
			char c = strA.charAt(i);

			switch (Character.toUpperCase(c)) {

				case '0':
					if (nextCharIsUpper) {
						sum = (byte) 0x00;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x00;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '1':
					if (nextCharIsUpper) {
						sum = (byte) 0x10;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x01;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '2':
					if (nextCharIsUpper) {
						sum = (byte) 0x20;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x02;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '3':
					if (nextCharIsUpper) {
						sum = (byte) 0x30;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x03;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '4':
					if (nextCharIsUpper) {
						sum = (byte) 0x40;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x04;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '5':
					if (nextCharIsUpper) {
						sum = (byte) 0x50;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x05;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '6':
					if (nextCharIsUpper) {
						sum = (byte) 0x60;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x06;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '7':
					if (nextCharIsUpper) {
						sum = (byte) 0x70;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x07;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '8':
					if (nextCharIsUpper) {
						sum = (byte) 0x80;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x08;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case '9':
					if (nextCharIsUpper) {
						sum = (byte) 0x90;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x09;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'A':
					if (nextCharIsUpper) {
						sum = (byte) 0xA0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0A;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'B':
					if (nextCharIsUpper) {
						sum = (byte) 0xB0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0B;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'C':
					if (nextCharIsUpper) {
						sum = (byte) 0xC0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0C;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'D':
					if (nextCharIsUpper) {
						sum = (byte) 0xD0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0D;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'E':
					if (nextCharIsUpper) {
						sum = (byte) 0xE0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0E;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				case 'F':
					if (nextCharIsUpper) {
						sum = (byte) 0xF0;
						nextCharIsUpper = false;
					} else {
						sum |= (byte) 0x0F;
						result.write(sum);
						nextCharIsUpper = true;
					}
					break;

				default:
					break;
			}
		}

		if (!nextCharIsUpper) {
			throw new RuntimeException(
					"The String did not contain an equal number of hex digits");
		}

		return result.toByteArray();
	}

	/*
	 * Converts a byte to hex digit and writes to the supplied buffer
	 */

	/**
	 * Description of the Method.
	 * 
	 * @param b Description of Parameter
	 * @param buf Description of Parameter
	 */
	private static void byte2hex(byte b, StringBuffer buf) {
		int high = ((b & 0xf0) >> 4);
		int low = (b & 0x0f);
		buf.append(HEX_DIGITS[high]);
		buf.append(HEX_DIGITS[low]);
	}

	/**
	 * Description of the Method.
	 * 
	 * @param b Description of Parameter
	 * @param buf Description of Parameter
	 */
	private static void byte2bin(byte b, StringBuffer buf) {

		// test every 8 bit
		for (int i = 0; i < 8; i++) {

			// ---test if bit is set
			if ((b & COMPARE_BITS[i]) != 0) {
				buf.append(BIT_DIGIT[1]);
			} else {
				buf.append(BIT_DIGIT[0]);
			}
		}
	}

	/**
	 * Returns a string of 8 hexadecimal digits (most significant digit first)
	 * corresponding to the integer <i>n</i> , which is treated as unsigned.
	 * 
	 * @param n Description of Parameter
	 * 
	 * @return Description of the Returned Value
	 */
	private static String intToHexString(int n) {

		char[] buf = new char[8];

		for (int i = 7; i >= 0; i--) {
			buf[i] = HEX_DIGITS[n & 0x0F];
			n >>>= 4;
		}

		return new String(buf);
	}

	/**
	 * test and demo for the Convert class.
	 * 
	 * @param args none needed
	 */
	public static void main(String args[]) {

		logger.info("-test and demo of the converter ");

		String str = "Niko";
		byte[] ba = str.getBytes();

		logger.info("to convert: " + str);
		logger.info("converted1: " + byteArrayToHexString(ba));
		logger.info("converted1: " + byteArrayToHexString(ba, 0, ba.length));
		logger.info("converted3: " + stringToHexString(str));
		logger.info("----Convert integer to hexString...");

		int i = -2;

		logger.info("to convert: " + i + " -> " + intToHexString(i));
		logger.info("----Convert byte[] to binary String...");

		byte[] baToConvert = { (byte) 0xff, (byte) 0x00, (byte) 0x33,
				(byte) 0x11, (byte) 0xff, (byte) 0x5f, (byte) 0x5f,
				(byte) 0x4f, (byte) 0x1f, (byte) 0xff };

		logger.info("to convert: " + toHexString(baToConvert) + " -> "
				+ byteArrayToBinaryString(baToConvert));

		// ---- modify line separator
		setByteSeparator('-');
		logger.info("to convert: " + toHexString(baToConvert) + " -> "
				+ byteArrayToBinaryString(baToConvert));

		// ---- modify line separator
		setByteSeparator('*');
		setWithByteSeparator(true);
		logger.info("to convert: " + toHexString(baToConvert) + " -> "
				+ byteArrayToBinaryString(baToConvert));

		// ---- modify bit digits
		char[] bd = { 'a', 'b' };

		try {
			setBitDigits(bd);
		} catch (Exception ex) {
			logger.debug("", ex);
			// ex.printStackTrace();
		}

		logger.info("to convert: " + toHexString(baToConvert) + " -> "
				+ byteArrayToBinaryString(baToConvert));

		// ------------------------------------------------//
		setBitDigits('0', '1');
		logger.info("---- Convert.toByteArray(int) ");

		for (int iToConvert = -10; iToConvert < 10; iToConvert++) {
			logger.info("to convert = " + iToConvert + " = "
					+ HexDump.toBinaryString(iToConvert));

			byte[] baConvInt = new byte[4];

			baConvInt = HexDump.toByteArray(iToConvert);

			logger.info("convertet byteArray = "
					+ HexDump.toBinaryString(baConvInt));
		}

		logger.info("---- toHexString(int) ");

		i = -1;

		logger.info(i + " = 0x" + toHexString(i) + " = " + toBinaryString(i));

		i++;

		logger.info(i + " = 0x" + toHexString(i) + " = " + toBinaryString(i));

		// ------------------------------------------------//
		logger.info("---- toHexString(long) ");

		long l = 100;

		logger.info(l + " = 0x" + toHexString(l) + " = " + toBinaryString(l));

		java.util.Random rnd = new java.util.Random();

		l = rnd.nextLong();

		logger.info(l + " = 0x" + toHexString(l) + " = " + toBinaryString(l));

		// ------------------------------------------------//
		logger.info("---- toHexString(short) ");

		short s = 100;

		logger.info(s + " = 0x" + toHexString(s) + " = " + toBinaryString(s));

		rnd = new java.util.Random();
		s = (short) rnd.nextInt();

		logger.info(s + " = 0x" + toHexString(s) + " = " + toBinaryString(s));

		// ---------------------------------------------------------------------------//
		// convert dezimal-String to binary
		logger.info("---- read file in Hex-Format ");

		String strToConvert = "12345654321";

		logger.info(strToConvert + " = " + stringToHexString(strToConvert));
		logger.info("Das ist die Hex-Darstellung des obigen Strings");

		logger.info("ba = " + toHexString(ba));
	}

	/**
	 * Format hex dump.
	 * 
	 * @param in the in
	 * 
	 * @return the string
	 */
	public static String formatHexDump(String in) {
		int chunk = 60;
		StringBuffer out = new StringBuffer();
		int from = 0;
		int to = 0;
		int size = in.length();
		while (from < size) {
			if (size < from + chunk) {
				to = size;
			} else {
				to = from + chunk;
			}
			out.append(in.substring(from, to));
			out.append("\n");
			from = to;
		}
		return out.toString();
	}

}

/*
 * $Header: /home/cvs/jakarta-commons/httpclient/src/java/org/apache/commons/httpclient/util/Attic/Base64.java,v 1.6.2.1 2004/02/22 18:21:16 olegk Exp $
 * $Revision: 98512 $
 * $Date: 2011-09-22 13:59:08 -0400 (Thu, 22 Sep 2011) $
 *
 *  Copyright 1999-2004 The Apache Software Foundation
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
 */

package org.imsglobal.basiclti;
// package org.apache.commons.httpclient.util;

// import org.apache.commons.httpclient.HttpConstants;

/**
 * Base64 encoder and decoder.
 * 

 * This class provides encoding/decoding methods for the Base64 encoding as
 * defined by RFC 2045, N. Freed and N. Borenstein. RFC 2045: Multipurpose
 * Internet Mail Extensions (MIME) Part One: Format of Internet Message Bodies.
 * Reference 1996. Available at: 
 * http://www.ietf.org/rfc/rfc2045.txt
 * 


 * 
 * @author Jeffrey Rodriguez
 * @author Mike Bowler
 * @version $Revision: 98512 $ $Date: 2011-09-22 13:59:08 -0400 (Thu, 22 Sep 2011) $
 * 
 */
public final class Base64 {

	/** */
	private static final int  BASELENGTH = 255;

	/** */
	private static final int  LOOKUPLENGTH = 64;

	/** */
	private static final int  TWENTYFOURBITGROUP = 24;

	/** */
	private static final int  EIGHTBIT = 8;

	/** */
	private static final int  SIXTEENBIT = 16;

	/** */
	private static final int  SIXBIT = 6;

	/** */
	private static final int  FOURBYTE = 4;

	/** The sign bit as an int */
	private static final int  SIGN = -128;

	/** The padding character */
	private static final byte PAD = (byte) '=';

	/** The alphabet */
	private static final byte [] BASE64_ALPHABET = new byte[BASELENGTH];

	/** The lookup alphabet */
	private static final byte [] LOOKUP_BASE64_ALPHABET = new byte[LOOKUPLENGTH];

	static {

		for (int i = 0; i < BASELENGTH; i++) {
			BASE64_ALPHABET[i] = -1;
		}
		for (int i = 'Z'; i >= 'A'; i--) {
			BASE64_ALPHABET[i] = (byte) (i - 'A');
		}
		for (int i = 'z'; i >= 'a'; i--) {
			BASE64_ALPHABET[i] = (byte) (i - 'a' + 26);
		}

		for (int i = '9'; i >= '0'; i--) {
			BASE64_ALPHABET[i] = (byte) (i - '0' + 52);
		}

		BASE64_ALPHABET['+']  = 62;
		BASE64_ALPHABET['/']  = 63;

		for (int i = 0; i <= 25; i++) {
			LOOKUP_BASE64_ALPHABET[i] = (byte) ('A' + i);
		}

		for (int i = 26, j = 0; i <= 51; i++, j++) {
			LOOKUP_BASE64_ALPHABET[i] = (byte) ('a' + j);
		}

		for (int i = 52,  j = 0; i <= 61; i++, j++) {
			LOOKUP_BASE64_ALPHABET[i] = (byte) ('0' + j);
		}
		LOOKUP_BASE64_ALPHABET[62] = (byte) '+';
		LOOKUP_BASE64_ALPHABET[63] = (byte) '/';

	}

	/**
	 * Create an instance.
	 */
	private Base64() {
		// the constructor is intentionally private
	}

	/**
	 * Encodes hex octects into Base64
	 *
	 * @param binaryData Array containing binaryData
	 * @return Base64-encoded array
	 */
	public static byte[] encode(byte[] binaryData) {

		int      lengthDataBits    = binaryData.length * EIGHTBIT;
		int      fewerThan24bits   = lengthDataBits % TWENTYFOURBITGROUP;
		int      numberTriplets    = lengthDataBits / TWENTYFOURBITGROUP;
		byte     encodedData[]     = null;


		if (fewerThan24bits != 0) { //data not divisible by 24 bit
			encodedData = new byte[(numberTriplets + 1) * 4];
		} else { // 16 or 8 bit
			encodedData = new byte[numberTriplets * 4];
		}

		byte k = 0;
		byte l = 0;
		byte b1 = 0;
		byte b2 = 0;
		byte b3 = 0;
		int encodedIndex = 0;
		int dataIndex   = 0;
		int i           = 0;
		for (i = 0; i < numberTriplets; i++) {

			dataIndex = i * 3;
			b1 = binaryData[dataIndex];
			b2 = binaryData[dataIndex + 1];
			b3 = binaryData[dataIndex + 2];

			l  = (byte) (b2 & 0x0f);
			k  = (byte) (b1 & 0x03);

			encodedIndex = i * 4;
			byte val1 = ((b1 & SIGN) == 0) ? (byte) (b1 >> 2) 
				: (byte) ((b1) >> 2 ^ 0xc0);

			byte val2 = ((b2 & SIGN) == 0) ? (byte) (b2 >> 4) 
				: (byte) ((b2) >> 4 ^ 0xf0);
			byte val3 = ((b3 & SIGN) == 0) ? (byte) (b3 >> 6) 
				: (byte) ((b3) >> 6 ^ 0xfc);

			encodedData[encodedIndex]   = LOOKUP_BASE64_ALPHABET[val1];
			encodedData[encodedIndex + 1] = LOOKUP_BASE64_ALPHABET[val2
				| (k << 4)];
			encodedData[encodedIndex + 2] = LOOKUP_BASE64_ALPHABET[(l << 2)
				| val3];
			encodedData[encodedIndex + 3] = LOOKUP_BASE64_ALPHABET[b3 & 0x3f];
		}

		// form integral number of 6-bit groups
		dataIndex    = i * 3;
		encodedIndex = i * 4;
		if (fewerThan24bits == EIGHTBIT) {
			b1 = binaryData[dataIndex];
			k = (byte) (b1 & 0x03);
			byte val1 = ((b1 & SIGN) == 0) ? (byte) (b1 >> 2) 
				: (byte) ((b1) >> 2 ^ 0xc0);
			encodedData[encodedIndex]     = LOOKUP_BASE64_ALPHABET[val1];
			encodedData[encodedIndex + 1] = LOOKUP_BASE64_ALPHABET[k << 4];
			encodedData[encodedIndex + 2] = PAD;
			encodedData[encodedIndex + 3] = PAD;
		} else if (fewerThan24bits == SIXTEENBIT) {
			b1 = binaryData[dataIndex];
			b2 = binaryData[dataIndex + 1];
			l = (byte) (b2 & 0x0f);
			k = (byte) (b1 & 0x03);

			byte val1 = ((b1 & SIGN) == 0) ? (byte) (b1 >> 2) 
				: (byte) ((b1) >> 2 ^ 0xc0);
			byte val2 = ((b2 & SIGN) == 0) ? (byte) (b2 >> 4) 
				: (byte) ((b2) >> 4 ^ 0xf0);

			encodedData[encodedIndex]     = LOOKUP_BASE64_ALPHABET[val1];
			encodedData[encodedIndex + 1] = LOOKUP_BASE64_ALPHABET[val2 
				| (k << 4)];
			encodedData[encodedIndex + 2] = LOOKUP_BASE64_ALPHABET[l << 2];
			encodedData[encodedIndex + 3] = PAD;
		}
		return encodedData;
	}


	/**
	 * Decodes Base64 data into octects
	 *
	 * @param base64Data byte array containing Base64 data
	 * @return Array containing decoded data.
	 */
	public static byte[] decode(byte[] base64Data) {
		// Should we throw away anything not in base64Data ?

		// handle the edge case, so we don't have to worry about it later
		if (base64Data.length == 0) {
			return new byte[0];
		}

		int      numberQuadruple    = base64Data.length / FOURBYTE;
		byte     decodedData[]      = null;
		byte     b1 = 0, b2 = 0, b3 = 0, b4 = 0, marker0 = 0, marker1 = 0;

		int encodedIndex = 0;
		int dataIndex    = 0;
		{
			// this block sizes the output array properly - rlw
			int lastData = base64Data.length;
			// ignore the '=' padding
			while (base64Data[lastData - 1] == PAD) {
				if (--lastData == 0) { return new byte[0]; }
			}
			decodedData = new byte[lastData - numberQuadruple];
		}

		for (int i = 0; i < numberQuadruple; i++) {
			dataIndex = i * 4;
			marker0   = base64Data[dataIndex + 2];
			marker1   = base64Data[dataIndex + 3];

			b1 = BASE64_ALPHABET[base64Data[dataIndex]];
			b2 = BASE64_ALPHABET[base64Data[dataIndex + 1]];

			if (marker0 != PAD && marker1 != PAD) {     //No PAD e.g 3cQl
				b3 = BASE64_ALPHABET[marker0];
				b4 = BASE64_ALPHABET[marker1];

				decodedData[encodedIndex]   = (byte) (b1 << 2 | b2 >> 4);
				decodedData[encodedIndex + 1] = (byte) (((b2 & 0xf) << 4)
						| ((b3 >> 2) & 0xf));
				decodedData[encodedIndex + 2] = (byte) (b3 << 6 | b4);
			} else if (marker0 == PAD) {    //Two PAD e.g. 3c[Pad][Pad]
				decodedData[encodedIndex]   = (byte) (b1 << 2 | b2 >> 4) ;
			} else if (marker1 == PAD) {    //One PAD e.g. 3cQ[Pad]
				b3 = BASE64_ALPHABET[marker0];
				decodedData[encodedIndex]   = (byte) (b1 << 2 | b2 >> 4);
				decodedData[encodedIndex + 1] = (byte) (((b2 & 0xf) << 4) 
						| ((b3 >> 2) & 0xf));
			}
			encodedIndex += 3;
		}
		return decodedData;
	}
}

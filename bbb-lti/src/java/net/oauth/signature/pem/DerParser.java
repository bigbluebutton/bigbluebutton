/****************************************************************************
 * Copyright (c) 1998-2009 AOL LLC. 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ****************************************************************************/
package net.oauth.signature.pem;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;

/**
 * A bare-minimum ASN.1 DER decoder, just having enough functions to 
 * decode PKCS#1 private keys. Especially, it doesn't handle explicitly
 * tagged types with an outer tag.
 * 
 * <p/>This parser can only handle one layer. To parse nested constructs,
 * get a new parser for each layer using <code>Asn1Object.getParser()</code>.
 * 
 * <p/>There are many DER decoders in JRE but using them will tie this
 * program to a specific JCE/JVM.
 * 
 * @author zhang
 *
 */
class DerParser {

    // Classes
    public final static int UNIVERSAL = 0x00;
    public final static int APPLICATION = 0x40;
    public final static int CONTEXT = 0x80;
    public final static int PRIVATE = 0xC0;

    // Constructed Flag
    public final static int CONSTRUCTED = 0x20;

    // Tag and data types
    public final static int ANY = 0x00;
    public final static int BOOLEAN = 0x01;
    public final static int INTEGER = 0x02;
    public final static int BIT_STRING = 0x03;
    public final static int OCTET_STRING = 0x04;
    public final static int NULL = 0x05;
    public final static int OBJECT_IDENTIFIER = 0x06;
    public final static int REAL = 0x09;
    public final static int ENUMERATED = 0x0a;
    public final static int RELATIVE_OID = 0x0d;

    public final static int SEQUENCE = 0x10;
    public final static int SET = 0x11;

    public final static int NUMERIC_STRING = 0x12;
    public final static int PRINTABLE_STRING = 0x13;
    public final static int T61_STRING = 0x14;
    public final static int VIDEOTEX_STRING = 0x15;
    public final static int IA5_STRING = 0x16;
    public final static int GRAPHIC_STRING = 0x19;
    public final static int ISO646_STRING = 0x1A;
    public final static int GENERAL_STRING = 0x1B;

    public final static int UTF8_STRING = 0x0C;
    public final static int UNIVERSAL_STRING = 0x1C;
    public final static int BMP_STRING = 0x1E;

    public final static int UTC_TIME = 0x17;
    public final static int GENERALIZED_TIME = 0x18;

    protected InputStream in;

    /**
     * Create a new DER decoder from an input stream.
     * 
     * @param in
     *            The DER encoded stream
     */
    public DerParser(InputStream in) throws IOException {
        this.in = in;
    }

    /**
     * Create a new DER decoder from a byte array.
     * 
     * @param The
     *            encoded bytes
     * @throws IOException 
     */
    public DerParser(byte[] bytes) throws IOException {
        this(new ByteArrayInputStream(bytes));
    }

    /**
     * Read next object. If it's constructed, the value holds
     * encoded content and it should be parsed by a new
     * parser from <code>Asn1Object.getParser</code>.
     * 
     * @return A object
     * @throws IOException
     */
    public Asn1Object read() throws IOException {
        int tag = in.read();

        if (tag == -1)
            throw new IOException("Invalid DER: stream too short, missing tag"); //$NON-NLS-1$

        int length = getLength();

        byte[] value = new byte[length];
        int n = in.read(value);
        if (n < length)
            throw new IOException("Invalid DER: stream too short, missing value"); //$NON-NLS-1$

        Asn1Object o = new Asn1Object(tag, length, value);

        return o;
    }

    /**
     * Decode the length of the field. Can only support length
     * encoding up to 4 octets.
     * 
     * <p/>In BER/DER encoding, length can be encoded in 2 forms,
     * <ul>
     * <li>Short form. One octet. Bit 8 has value "0" and bits 7-1
     * give the length.
     * <li>Long form. Two to 127 octets (only 4 is supported here). 
     * Bit 8 of first octet has value "1" and bits 7-1 give the 
     * number of additional length octets. Second and following 
     * octets give the length, base 256, most significant digit first.
     * </ul>
     * @return The length as integer
     * @throws IOException
     */
    private int getLength() throws IOException {

        int i = in.read();
        if (i == -1)
            throw new IOException("Invalid DER: length missing"); //$NON-NLS-1$

        // A single byte short length
        if ((i & ~0x7F) == 0)
            return i;

        int num = i & 0x7F;

        // We can't handle length longer than 4 bytes
        if ( i >= 0xFF || num > 4) 
            throw new IOException("Invalid DER: length field too big (" //$NON-NLS-1$
                    + i + ")"); //$NON-NLS-1$

        byte[] bytes = new byte[num];                   
        int n = in.read(bytes);
        if (n < num)
            throw new IOException("Invalid DER: length too short"); //$NON-NLS-1$

        return new BigInteger(1, bytes).intValue();
    }

}

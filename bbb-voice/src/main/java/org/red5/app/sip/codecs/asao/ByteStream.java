package org.red5.app.sip.codecs.asao;


/*
 * Copyright (c) 2007 a840bda5870ba11f19698ff6eb9581dfb0f95fa5,
 *                    539459aeb7d425140b62a3ec7dbf6dc8e408a306, and
 *                    520e17cd55896441042b14df2566a6eb610ed444
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

//------------------------------------------------------------------------
//
//		Wrapper class for Byte array containging audio stream bytes
//
//------------------------------------------------------------------------
public final class ByteStream {

    public final byte[] bytes;

    public final int offset;

    public final int length;


    public ByteStream( int i ) {

        this( new byte[ i ] );
    }


    public ByteStream( byte[] abyte0 ) {

        this( abyte0, 0, abyte0.length );
    }


    public ByteStream( byte[] abyte0, int i ) {

        this( abyte0, i, abyte0.length );
    }


    public ByteStream( byte[] abyte0, int i, int j ) {

        bytes = abyte0;
        offset = i;
        length = Math.min( j, abyte0.length - i );
    }
}

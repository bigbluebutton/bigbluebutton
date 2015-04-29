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
//		Utility class methods
//
//------------------------------------------------------------------------
public final class Utility {

    public static final void byte2float( byte[] abyte0, int i, int j, float[] af, int k, boolean flag ) {

        if ( flag ) {
            int l = 0;
            for ( int j1 = j >> 1; l < j1; l++ ) {
                af[ k + l ] = ( abyte0[ i + l * 2 + 0 ] << 8 ) + ( abyte0[ i + l * 2 + 1 ] << 0 );
            }

        }
        else {
            int i1 = 0;
            for ( int k1 = j >> 1; i1 < k1; i1++ ) {
                af[ k + i1 ] = ( abyte0[ i + i1 * 2 + 0 ] << 0 ) + ( abyte0[ i + i1 * 2 + 1 ] << 8 );
            }

        }
    }


    public static final void float2byte( float[] af, int i, int j, byte[] abyte0, int k, boolean flag ) {

        if ( flag ) {
            int l = 0;
            for ( int j1 = j; l < j1; l++ ) {
                int l1 = (int) af[ i + l ];
                abyte0[ k + 2 * l ] = (byte) ( l1 >> 8 & 0xff );
                abyte0[ k + 2 * l + 1 ] = (byte) ( l1 >> 0 & 0xff );
            }

        }
        else {
            int i1 = 0;
            for ( int k1 = j; i1 < k1; i1++ ) {
                int i2 = (int) af[ i + i1 ];
                abyte0[ k + 2 * i1 ] = (byte) ( i2 >> 0 & 0xff );
                abyte0[ k + 2 * i1 + 1 ] = (byte) ( i2 >> 8 & 0xff );
            }

        }
    }
}

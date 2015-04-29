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
//
//
//------------------------------------------------------------------------
class SetupTable {

    public final int parameterA;

    public final int parameterB;


    public SetupTable( int i ) {

        if ( i == 124 ) {
            parameterA = 4228;
            parameterB = 19;
            return;
        }

        if ( i == 0 ) {
            parameterA = 0;
            parameterB = 0;
            return;
        }
        int j = ( ( ~i >>> 31 ) << 1 ) - 1;
        int k = i * j;
        int l;

        for ( l = -1; ( k & 0x8000 ) == 0; l++ ) {
            k <<= 1;
        }

        k >>= 1;
        parameterB = 27 - l;
        short word0 = Codec.f()[ k - 15872 >> 10 ];
        int i1 = k * word0;
        i1 = 0x40000000 - i1;
        i1 = ( i1 += 16384 ) >> 15;
        i1 *= word0;
        i1 = ( i1 += 16384 ) >> 15;
        int j1 = i1;
        i1 *= k;
        i1 = 0x20000000 - i1;
        i1 = ( i1 += 16384 ) >> 15;
        i1 *= j1;
        i1 = ( i1 += 8192 ) >> 14;
        i1 *= j;

        if ( i1 > 32767 && j == 1 ) {
            i1 = 32767;
        }
        else if ( i1 < -32768 && j == -1 ) {
            i1 = -32768;
        }
        parameterA = i1;
    }
}

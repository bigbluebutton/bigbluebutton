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
//		Decoder: Entry point for decoding
//
//------------------------------------------------------------------------
public final class Decoder {

    public Decoder() {

    }


    public DecoderMap decode( DecoderMap d1, byte[] abyte0, int i, float[] af, int j ) {

        if ( d1 == null ) {
            d1 = new NellyDecoderMap( this );
        }

        NellyDecoderMap nellyDecoderMap = (NellyDecoderMap) d1;

        Codec.process(
            nellyDecoderMap.a,
            abyte0,
            i,
            af,
            j,
            nellyDecoderMap.c,
            nellyDecoderMap.d,
            nellyDecoderMap.e,
            nellyDecoderMap.f,
            nellyDecoderMap.g );

        return d1;
    }


    public DecoderMap decode( DecoderMap d1, byte[] abyte0, int i, byte[] abyte1, int j, boolean flag ) {

        if ( d1 == null ) {
            d1 = new NellyDecoderMap( this );
        }

        d1 = decode( d1, abyte0, i, ( (NellyDecoderMap) d1 ).b, 0 );

        Utility.float2byte( ( (NellyDecoderMap) d1 ).b, 0, 256, abyte1, j, flag );

        return d1;
    }
}

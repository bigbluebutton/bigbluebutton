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
//		Common routines for decoing and encoding
//
//------------------------------------------------------------------------
public final class Codec {

    public Codec() {

    }

    private static final float[] i_nelly_init_table = { 3134F, 5342F, 6870F, 7792F, 8569F, 9185F, 9744F, 10191F,
        10631F, 11061F, 11434F, 11770F, 12116F, 12513F, 12925F, 13300F, 13674F, 14027F, 14352F, 14716F, 15117F, 15477F,
        15824F, 16157F, 16513F, 16804F, 17090F, 17401F, 17679F, 17948F, 18238F, 18520F, 18764F, 19078F, 19381F, 19640F,
        19921F, 20205F, 20500F, 20813F, 21162F, 21465F, 21794F, 22137F, 22453F, 22756F, 23067F, 23350F, 23636F, 23926F,
        24227F, 24521F, 24819F, 25107F, 25414F, 25730F, 26120F, 26497F, 26895F, 27344F, 27877F, 28463F, 29426F, 31355F };

    private static final float[] j_nelly_delta_table = { -11725F, -9420F, -7910F, -6801F, -5948F, -5233F, -4599F,
        -4039F, -3507F, -3030F, -2596F, -2170F, -1774F, -1383F, -1016F, -660F, -329F, -1F, 337F, 696F, 1085F, 1512F,
        1962F, 2433F, 2968F, 3569F, 4314F, 5279F, 6622F, 8154F, 10076F, 12975F };

    private static final double[] k__nelly_dequantization_table = { 0.0000000000,

        -0.8472560048, 0.7224709988,

        -1.5247479677, -0.4531480074, 0.3753609955, 1.4717899561,

        -1.9822579622, -1.1929379702, -0.5829370022, -0.0693780035, 0.3909569979, 0.9069200158, 1.4862740040, 2.2215409279,

        -2.3887870312, -1.8067539930, -1.4105420113, -1.0773609877, -0.7995010018, -0.5558109879, -0.3334020078,
        -0.1324490011, 0.0568020009, 0.2548770010, 0.4773550034, 0.7386850119, 1.0443060398, 1.3954459429,
        1.8098750114, 2.3918759823,

        -2.3893830776, -1.9884680510, -1.7514040470, -1.5643119812, -1.3922129869, -1.2164649963, -1.0469499826,
        -0.8905100226, -0.7645580173, -0.6454579830, -0.5259280205, -0.4059549868, -0.3029719889, -0.2096900046,
        -0.1239869967, -0.0479229987, 0.0257730000, 0.1001340002, 0.1737180054, 0.2585540116, 0.3522900045,
        0.4569880068, 0.5767750144, 0.7003160119, 0.8425520062, 1.0093879700, 1.1821349859, 1.3534560204, 1.5320819616,
        1.7332619429, 1.9722349644, 2.3978140354,

        -2.5756309032, -2.0573320389, -1.8984919786, -1.7727810144, -1.6662600040, -1.5742180347, -1.4993319511,
        -1.4316639900, -1.3652280569, -1.3000990152, -1.2280930281, -1.1588579416, -1.0921250582, -1.0135740042,
        -0.9202849865, -0.8287050128, -0.7374889851, -0.6447759867, -0.5590940118, -0.4857139885, -0.4110319912,
        -0.3459700048, -0.2851159871, -0.2341620028, -0.1870580018, -0.1442500055, -0.1107169986, -0.0739680007,
        -0.0365610011, -0.0073290002, 0.0203610007, 0.0479039997, 0.0751969963, 0.0980999991, 0.1220389977,
        0.1458999962, 0.1694349945, 0.1970459968, 0.2252430022, 0.2556869984, 0.2870100141, 0.3197099864, 0.3525829911,
        0.3889069855, 0.4334920049, 0.4769459963, 0.5204820037, 0.5644530058, 0.6122040153, 0.6685929894, 0.7341650128,
        0.8032159805, 0.8784040213, 0.9566209912, 1.0397069454, 1.1293770075, 1.2211159468, 1.3080279827, 1.4024800062,
        1.5056819916, 1.6227730513, 1.7724959850, 1.9430880547, 2.2903931141, 0.0F };

    private static final int[] f = { 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 21, 24, 28, 32, 37, 43, 49, 56, 64, 73, 83, 95,
        109, 124 };

    private static final short[] g = { 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
        0, 0, 0, 0, 0 };

    private static final int[] h = { 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 8, 8, 10, 12, 12, 14, 16, 18, 20, 24, 28, 30, 0 };

    public static final float[] a = makeTableA();

    public static final float[] b = makeTableB();

    public static final float[] c = makeTableC();

    public static final float[] d = makeTableD();

    private static final short[] l = { 32767, 30840, 29127, 27594, 26214, 24966, 23831, 22795, 21845, 20972, 20165,
        19418, 18725, 18079, 17476, 16913, 16384, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

    public static final float[] e = makeTableE();


    public static void process(
        float[] af,
        float[] af1,
        int i1,
        byte[] abyte0,
        int j1,
        float[] af2,
        float[] af3,
        float[] af4,
        float[] af5,
        float[] af6,
        int[] ai ) {

        StateTable j2 = new StateTable( abyte0, j1 );
        process( af, af1, i1, af2, 0, 7 );
        process( af, af1, i1 + 128, af2, 128, 7 );
        for ( int k1 = 0; k1 < 23; k1++ ) {
            double d1 = 0.0D;
            int j4 = f[ k1 ];
            for ( int j5 = f[ k1 + 1 ]; j4 < j5; j4++ ) {
                double d2 = af2[ j4 ];
                double d3 = af2[ j4 + 128 ];
                d1 += d2 * d2 + d3 * d3;
            }

            af3[ k1 ] = Math.round( Math.log( Math.max( 1.0D, d1 / (double) h[ k1 ] ) ) * 1477.3197004799999D );
        }

        int l1 = process( af3[ 0 ], i_nelly_init_table, 0, 64 );
        af4[ 0 ] = i_nelly_init_table[ l1 ];
        j2.state( l1, g[ 0 ] );
        for ( int l2 = 1; l2 < 23; l2++ ) {
            int i2 = process( af3[ l2 ] - af4[ l2 - 1 ], j_nelly_delta_table, 0, 32 );
            af4[ l2 ] = af4[ l2 - 1 ] + j_nelly_delta_table[ i2 ];
            j2.state( i2, g[ l2 ] );
        }

        for ( int i3 = 0; i3 < 23; i3++ ) {
            af3[ i3 ] = (float) ( 1.0D / Math.pow( 2D, (double) af4[ i3 ] * 0.00048828125D ) );
        }

        for ( int j3 = 0; j3 < 23; j3++ ) {
            int l3 = f[ j3 ];
            for ( int k4 = f[ j3 + 1 ]; l3 < k4; l3++ ) {
                af5[ l3 ] = af4[ j3 ];
                af6[ l3 ] = af3[ j3 ];
            }

        }

        int k3 = process( af5, 124, 198, ai );

        for ( int i4 = 0; i4 < 256; i4 += 128 ) {
            for ( int l4 = 0; l4 < 124; l4++ ) {
                int k5 = ai[ l4 ];
                if ( k5 > 0 ) {
                    int l5 = 1 << k5;
                    int k2 = processIt(
                        af6[ l4 ] * af2[ i4 + l4 ],
                        k__nelly_dequantization_table,
                        l5 - 1,
                        ( l5 << 1 ) - 1 );
                    j2.state( k2, k5 );
                }
            }

            int i5 = k3;
            do {
                if ( i5 <= 0 ) {
                    continue;
                }
                if ( i5 > 8 ) {
                    j2.state( 0, 8 );
                }
                else {
                    j2.state( 0, i5 );
                    continue;
                }
                i5 -= 8;
            }
            while ( true );
        }

    }


    public static void process(
        float[] af,
        byte[] abyte0,
        int i1,
        float[] af1,
        int j1,
        float[] af2,
        float[] af3,
        float[] af4,
        byte[] abyte1,
        int[] ai ) {

        StateTable j2 = new StateTable( abyte0, i1 );
        int k1 = j2.state( g[ 0 ] );
        abyte1[ 0 ] = (byte) k1;
        af2[ 0 ] = i_nelly_init_table[ k1 ];
        for ( int k2 = 1; k2 < 23; k2++ ) {
            int l1 = j2.state( g[ k2 ] );
            abyte1[ k2 ] = (byte) l1;
            af2[ k2 ] = af2[ k2 - 1 ] + j_nelly_delta_table[ l1 ];
        }

        for ( int l2 = 0; l2 < 23; l2++ ) {
            float f1 = (float) Math.pow( 2D, (double) af2[ l2 ] * 0.00048828125D );
            int k3 = f[ l2 ];
            for ( int k4 = f[ l2 + 1 ]; k3 < k4; k3++ ) {
                af4[ k3 ] = af2[ l2 ];
                af3[ k3 ] = f1;
            }

        }

        int i3 = process( af4, 124, 198, ai );
        for ( int j3 = 0; j3 < 256; j3 += 128 ) {
            for ( int l3 = 0; l3 < 124; l3++ ) {
                int l4 = ai[ l3 ];
                float f2 = af3[ l3 ];
                if ( l4 > 0 ) {
                    int i5 = 1 << l4;
                    int i2 = j2.state( l4 );
                    abyte1[ l3 ] = (byte) i2;
                    f2 *= k__nelly_dequantization_table[ ( i5 - 1 ) + i2 ];
                }
                else {
                    double d1 = Math.random() * 4294967296D;
                    if ( d1 < 1073758208D ) {
                        f2 = (float) ( (double) f2 * -0.70709997400000002D );
                    }
                    else {
                        f2 = (float) ( (double) f2 * 0.70709997400000002D );
                    }
                }
                af2[ l3 ] = f2;
            }

            for ( int i4 = 124; i4 < 128; i4++ ) {
                af2[ i4 ] = 0.0F;
            }

            int j4 = i3;
            do {
                if ( j4 <= 0 ) {
                    break;
                }
                if ( j4 > 8 ) {
                    j2.state( 8 );
                }
                else {
                    j2.state( j4 );
                    break;
                }
                j4 -= 8;
            }
            while ( true );
            process( af, af2, af1, j3, 7 );
        }

    }


    private static void process( float[] af, float[] af1, float[] af2, int i1, int j1 ) {

        int k1 = 1 << j1;
        int l1 = k1 >> 2;
        int i2 = k1 - 1;
        int j2 = k1 >> 1;
        int k2 = j2 - 1;
        int l2 = 0;
        process( af1, 0, af2, i1, j1 );
        while ( l2 < l1 ) {
            double d1 = af[ l2 ];
            double d2 = af[ k2 ];
            double d3 = af2[ i1 + j2 ];
            double d4 = af2[ i1 + i2 ];
            af[ l2 ] = -af2[ i1 + k2 ];
            af[ k2 ] = -af2[ i1 + l2 ];
            af2[ i1 + l2 ] = (float) ( d1 * (double) d[ i2 ] + d3 * (double) d[ l2 ] );
            af2[ i1 + k2 ] = (float) ( d2 * (double) d[ j2 ] + d4 * (double) d[ k2 ] );
            af2[ i1 + j2 ] = (float) ( (double) d[ j2 ] * -d4 + (double) d[ k2 ] * d2 );
            af2[ i1 + i2 ] = (float) ( (double) d[ i2 ] * -d3 + (double) d[ l2 ] * d1 );
            l2++;
            k2--;
            j2++;
            i2--;
        }
    }


    private static void process( float[] af, float[] af1, int i1, float[] af2, int j1, int k1 ) {

        int l1 = 1 << k1;
        int i2 = l1 >> 2;
        int j2 = l1 - 1;
        int k2 = l1 >> 1;
        int l2 = k2 - 1;
        for ( int i3 = 0; i3 < i2; ) {
            af2[ j1 + k2 ] = af[ i3 ];
            af2[ j1 + j2 ] = af[ l2 ];
            af2[ j1 + i3 ] = -af1[ i1 + l2 ] * d[ k2 ] - af1[ i1 + k2 ] * d[ l2 ];
            af2[ j1 + l2 ] = -af1[ i1 + j2 ] * d[ i3 ] - af1[ i1 + i3 ] * d[ j2 ];
            af[ i3 ] = af1[ i1 + i3 ] * d[ i3 ] - af1[ i1 + j2 ] * d[ j2 ];
            af[ l2 ] = af1[ i1 + l2 ] * d[ l2 ] - af1[ i1 + k2 ] * d[ k2 ];
            i3++;
            k2++;
            j2--;
            l2--;
        }

        process( af2, j1, af2, j1, k1 );
    }


    private static void process( float[] af, int i1, float[] af1, int j1, int k1 ) {

        int l1 = 1 << k1;
        int i2 = ( l1 >> 1 ) - 1;
        int j2 = l1 >> 2;
        for ( int k2 = 0; k2 < j2; k2++ ) {
            int l2 = k2 << 1;
            int i3 = l1 - 1 - l2;
            int k3 = i3 - 1;
            double d1 = af[ i1 + l2 ];
            double d2 = af[ i1 + l2 + 1 ];
            double d4 = af[ i1 + i3 ];
            double d6 = af[ i1 + k3 ];
            af1[ j1 + l2 ] = (float) ( (double) a[ k2 ] * d1 - (double) c[ k2 ] * d4 );
            af1[ j1 + l2 + 1 ] = (float) ( d4 * (double) a[ k2 ] + d1 * (double) c[ k2 ] );
            af1[ j1 + k3 ] = (float) ( (double) a[ i2 - k2 ] * d6 - (double) c[ i2 - k2 ] * d2 );
            af1[ j1 + i3 ] = (float) ( d2 * (double) a[ i2 - k2 ] + d6 * (double) c[ i2 - k2 ] );
        }

        process( af1, j1, k1 - 1 );
        float f1 = af1[ ( j1 + l1 ) - 1 ];
        float f2 = af1[ ( j1 + l1 ) - 2 ];
        af1[ j1 ] = b[ 0 ] * af1[ j1 ];
        af1[ ( j1 + l1 ) - 1 ] = af1[ j1 + 1 ] * -b[ 0 ];
        af1[ ( j1 + l1 ) - 2 ] = b[ i2 ] * af1[ ( j1 + l1 ) - 2 ] + b[ 1 ] * f1;
        af1[ j1 + 1 ] = f2 * b[ 1 ] - f1 * b[ i2 ];
        int j3 = 1;
        int l3 = l1 - 3;
        int i4 = i2;

        for ( int j4 = 3; j3 < j2; j4 += 2 ) {
            double d3 = af1[ j1 + l3 ];
            double d5 = af1[ ( j1 + l3 ) - 1 ];
            double d7 = af1[ j1 + j4 ];
            double d8 = af1[ ( j1 + j4 ) - 1 ];
            af1[ ( j1 + j4 ) - 1 ] = (float) ( (double) b[ i4 ] * d7 + (double) b[ j4 - 1 >> 1 ] * d8 );
            af1[ j1 + j4 ] = (float) ( d5 * (double) b[ j4 + 1 >> 1 ] - d3 * (double) b[ i4 - 1 ] );
            af1[ j1 + l3 ] = (float) ( d8 * (double) b[ i4 ] - d7 * (double) b[ j4 - 1 >> 1 ] );
            af1[ ( j1 + l3 ) - 1 ] = (float) ( (double) b[ j4 + 1 >> 1 ] * d3 + (double) b[ i4 - 1 ] * d5 );
            j3++;
            i4--;
            l3 -= 2;
        }

    }


    private static void process( float[] af, int i1, int j1 ) {

        int k1 = 1 << j1;
        processIt( af, i1, k1 );
        int l1 = 0;
        for ( int j2 = k1 >> 1; j2 > 0; ) {
            float f1 = af[ i1 + l1 ];
            float f3 = af[ i1 + l1 + 1 ];
            float f5 = af[ i1 + l1 + 2 ];
            float f7 = af[ i1 + l1 + 3 ];
            af[ i1 + l1 ] = f1 + f5;
            af[ i1 + l1 + 1 ] = f3 + f7;
            af[ i1 + l1 + 2 ] = f1 - f5;
            af[ i1 + l1 + 3 ] = f3 - f7;
            j2--;
            l1 += 4;
        }

        l1 = 0;
        for ( int k2 = k1 >> 2; k2 > 0; ) {
            float f2 = af[ i1 + l1 ];
            float f4 = af[ i1 + l1 + 1 ];
            float f6 = af[ i1 + l1 + 2 ];
            float f8 = af[ i1 + l1 + 3 ];
            float f9 = af[ i1 + l1 + 4 ];
            float f10 = af[ i1 + l1 + 5 ];
            float f11 = af[ i1 + l1 + 6 ];
            float f12 = af[ i1 + l1 + 7 ];
            af[ i1 + l1 ] = f2 + f9;
            af[ i1 + l1 + 1 ] = f4 + f10;
            af[ i1 + l1 + 2 ] = f6 + f12;
            af[ i1 + l1 + 3 ] = f8 - f11;
            af[ i1 + l1 + 4 ] = f2 - f9;
            af[ i1 + l1 + 5 ] = f4 - f10;
            af[ i1 + l1 + 6 ] = f6 - f12;
            af[ i1 + l1 + 7 ] = f8 + f11;
            k2--;
            l1 += 8;
        }

        int l2 = 0;
        int i3 = k1 >> 3;
        int j3 = 64;
        int k3 = 4;
        for ( int l3 = j1 - 2; l3 > 0; ) {
            int i2 = 0;
            for ( int i4 = i3; i4 != 0; ) {
                for ( int j4 = k3 >> 1; j4 > 0; ) {
                    int l4 = i2 + ( k3 << 1 );
                    double d1 = af[ i1 + i2 ];
                    double d3 = af[ i1 + i2 + 1 ];
                    double d5 = af[ i1 + l4 ];
                    double d7 = af[ i1 + l4 + 1 ];
                    af[ i1 + l4 ] = (float) ( d1 - ( d5 * (double) e[ 128 - l2 ] + d7 * (double) e[ l2 ] ) );
                    af[ i1 + i2 ] = (float) ( d1 + ( d5 * (double) e[ 128 - l2 ] + d7 * (double) e[ l2 ] ) );
                    af[ i1 + l4 + 1 ] = (float) ( d3 + ( d5 * (double) e[ l2 ] - d7 * (double) e[ 128 - l2 ] ) );
                    af[ i1 + i2 + 1 ] = (float) ( d3 - ( d5 * (double) e[ l2 ] - d7 * (double) e[ 128 - l2 ] ) );
                    j4--;
                    i2 += 2;
                    l2 += j3;
                }

                for ( int k4 = k3 >> 1; k4 > 0; ) {
                    int i5 = i2 + ( k3 << 1 );
                    double d2 = af[ i1 + i2 ];
                    double d4 = af[ i1 + i2 + 1 ];
                    double d6 = af[ i1 + i5 ];
                    double d8 = af[ i1 + i5 + 1 ];
                    af[ i1 + i5 ] = (float) ( d2 + ( d6 * (double) e[ 128 - l2 ] - d8 * (double) e[ l2 ] ) );
                    af[ i1 + i2 ] = (float) ( d2 - ( d6 * (double) e[ 128 - l2 ] - d8 * (double) e[ l2 ] ) );
                    af[ i1 + i5 + 1 ] = (float) ( d4 + ( d8 * (double) e[ 128 - l2 ] + d6 * (double) e[ l2 ] ) );
                    af[ i1 + i2 + 1 ] = (float) ( d4 - ( d8 * (double) e[ 128 - l2 ] + d6 * (double) e[ l2 ] ) );
                    k4--;
                    i2 += 2;
                    l2 -= j3;
                }

                i4--;
                i2 += k3 << 1;
            }

            l3--;
            k3 <<= 1;
            j3 >>= 1;
            i3 >>= 1;
        }

    }


    public static int process( int i1 ) {

        return 30 - processIt( Math.abs( i1 ) );
    }


    public static int processIt( int i1 ) {

        if ( i1 == 0 ) {
            return -1;
        }
        int j1 = 0;
        if ( ( i1 & 0xffff0000 ) != 0 ) {
            j1 = 16;
            i1 >>= 16;
        }
        if ( ( i1 & 0xff00 ) != 0 ) {
            j1 += 8;
            i1 >>= 8;
        }
        if ( ( i1 & 0xf0 ) != 0 ) {
            j1 += 4;
            i1 >>= 4;
        }
        if ( ( i1 & 0xc ) != 0 ) {
            j1 += 2;
            i1 >>= 2;
        }
        if ( ( i1 & 2 ) != 0 ) {
            j1++;
        }
        return j1;
    }


    public static int process( float f1, float[] af, int i1, int j1 ) {

        int k1 = 0;
        float f2 = Math.abs( f1 - af[ i1 ] );
        for ( int l1 = i1; l1 < j1; l1++ ) {
            float f3 = Math.abs( f1 - af[ l1 ] );
            if ( f3 < f2 ) {
                k1 = l1 - i1;
                f2 = f3;
            }
        }

        return k1;
    }


    private static void processIt( float[] af, int i1, int j1 ) {

        int k1 = 1;
        int l1 = 1;
        for ( int i2 = j1 << 1; l1 < i2; l1 += 2 ) {
            if ( l1 < k1 ) {
                float f1 = af[ i1 + l1 ];
                af[ i1 + l1 ] = af[ i1 + k1 ];
                af[ i1 + k1 ] = f1;
                float f2 = af[ ( i1 + l1 ) - 1 ];
                af[ ( i1 + l1 ) - 1 ] = af[ ( i1 + k1 ) - 1 ];
                af[ ( i1 + k1 ) - 1 ] = f2;
            }
            int j2;
            for ( j2 = j1; j2 > 1 && j2 < k1; j2 >>= 1 ) {
                k1 -= j2;
            }

            k1 += j2;
        }

    }


    private static int processIt( float f1, double[] af, int i1, int j1 ) {

        int k1 = i1;
        int l1 = j1;
        do {
            int i2 = k1 + l1 >> 1;
            if ( f1 > af[ i2 ] ) {
                k1 = i2;
            }
            else {
                l1 = i2;
            }
        }
        while ( l1 - k1 > 1 );
        if ( l1 != j1 && f1 - af[ k1 ] > af[ l1 ] - f1 ) {
            k1 = l1;
        }
        return k1 - i1;
    }


    static int process( float[] af, int i1, int j1, int[] ai ) {

        float f1 = 0.0F;
        for ( int k1 = 0; k1 < i1; k1++ ) {
            if ( af[ k1 ] > f1 ) {
                f1 = af[ k1 ];
            }
        }

        int l1 = process( (int) f1 ) - 16;
        short[] aword0 = new short[ 124 ];
        if ( l1 < 0 ) {
            for ( int i2 = 0; i2 < i1; i2++ ) {
                aword0[ i2 ] = (short) ( (int) af[ i2 ] >> -l1 );
            }

        }
        else {
            for ( int j2 = 0; j2 < i1; j2++ ) {
                aword0[ j2 ] = (short) ( (int) af[ j2 ] << l1 );
            }

        }

        SetupTable setupTable = new SetupTable( i1 );

        for ( int k2 = 0; k2 < i1; k2++ ) {
            aword0[ k2 ] = (short) ( aword0[ k2 ] * 3 >> 2 );
        }

        int l2 = 0;
        for ( int i3 = 0; i3 < i1; i3++ ) {
            l2 += aword0[ i3 ];
        }

        l1 += 11;
        l2 -= j1 << l1;
        int j3 = 0;
        int k3 = l2 - ( j1 << l1 );
        j3 = ( k3 >> 16 ) * setupTable.parameterA >> 15;
        int l3 = 31 - setupTable.parameterB - process( k3 );
        if ( l3 >= 0 ) {
            j3 <<= l3;
        }
        else {
            j3 >>= -l3;
        }
        k3 = process( aword0, l1, i1, 6, j3 );
        if ( k3 != j1 ) {
            int i4 = k3 - j1;
            int l4 = 0;
            if ( i4 <= 0 ) {
                for ( ; i4 >= -16384; i4 <<= 1 ) {
                    l4++;
                }
            }
            else {
                for ( ; i4 < 16384; i4 <<= 1 ) {
                    l4++;
                }
            }

            int k5 = i4 * setupTable.parameterA >> 15;
            l4 = l1 - ( ( setupTable.parameterB + l4 ) - 15 );
            if ( l4 >= 0 ) {
                k5 <<= l4;
            }
            else {
                k5 >>= -l4;
            }
            int l5 = 1;
            int i6;
            int j6;
            do {
                i6 = k3;
                j6 = j3;
                j3 += k5;
                k3 = process( aword0, l1, i1, 6, j3 );
            }
            while ( ++l5 <= 19 && ( k3 - j1 ) * ( i6 - j1 ) > 0 );
            if ( k3 != j1 ) {
                int k6;
                int l6;
                int i7;
                if ( k3 > j1 ) {
                    k6 = j3;
                    j3 = j6;
                    l6 = k3;
                    i7 = i6;
                }
                else {
                    k6 = j6;
                    l6 = i6;
                    i7 = k3;
                }
                while ( k3 != j1 && l5 < 20 ) {
                    int j7 = j3 + k6 >> 1;
                    k3 = process( aword0, l1, i1, 6, j7 );
                    l5++;
                    if ( k3 > j1 ) {
                        k6 = j7;
                        l6 = k3;
                    }
                    else {
                        j3 = j7;
                        i7 = k3;
                    }
                }
                int k7 = Math.abs( l6 - j1 );
                int l7 = Math.abs( i7 - j1 );
                if ( k7 < l7 ) {
                    j3 = k6;
                    k3 = l6;
                }
                else {
                    k3 = i7;
                }
            }
        }
        for ( int j4 = 0; j4 < i1; j4++ ) {
            int i5 = aword0[ j4 ] - j3;
            if ( i5 >= 0 ) {
                i5 = i5 + ( 1 << l1 - 1 ) >> l1;
            }
            else {
                i5 = 0;
            }
            ai[ j4 ] = Math.min( i5, 6 );
        }

        if ( k3 > j1 ) {
            int k4 = 0;
            int j5;
            for ( j5 = 0; j5 < j1; ) {
                j5 += ai[ k4 ];
                k4++;
            }

            j5 -= ai[ k4 - 1 ];
            ai[ k4 - 1 ] = j1 - j5;
            k3 = j1;
            for ( ; k4 < i1; k4++ ) {
                ai[ k4 ] = 0;
            }

        }
        return j1 - k3;
    }


    private static int process( short[] aword0, int i1, int j1, int k1, int l1 ) {

        if ( j1 <= 0 ) {
            return 0;
        }
        int i2 = 0;
        int j2 = 1 << i1 - 1;
        for ( int k2 = 0; k2 < j1; k2++ ) {
            int l2 = aword0[ k2 ] - l1;
            i2 += Math.min( l2 >= 0 ? l2 + j2 >> i1 : 0, k1 );
        }

        return i2;
    }


    public static float[] makeTableA() {

        float[] af = new float[ 64 ];
        int i1 = 0;
        for ( int j1 = af.length; i1 < j1; i1++ ) {
            af[ i1 ] = (float) Math.cos( ( ( (double) i1 + 0.25D ) / 64D ) * 1.5707963267948966D );
        }

        return af;
    }


    public static float[] makeTableB() {

        float[] af = new float[ 64 ];
        int i1 = 0;
        for ( int j1 = af.length; i1 < j1; i1++ ) {
            af[ i1 ] = (float) ( Math.cos( (double) ( (float) i1 / 64F ) * 1.5707963267948966D ) * Math
                .sqrt( 0.015625D ) );
        }

        return af;
    }


    public static float[] makeTableC() {

        float[] af = new float[ 64 ];
        int i1 = 0;
        for ( int j1 = af.length; i1 < j1; i1++ ) {
            af[ i1 ] = (float) ( -Math.sin( (double) ( ( (float) i1 + 0.25F ) / 64F ) * 1.5707963267948966D ) );
        }

        return af;
    }


    public static float[] makeTableD() {

        float[] af = new float[ 128 ];
        int i1 = 0;
        for ( int j1 = af.length; i1 < j1; i1++ ) {
            af[ i1 ] = (float) Math.sin( (double) ( ( (float) i1 + 0.5F ) / 128F ) * 1.5707963267948966D );
        }

        return af;
    }


    public static float[] makeTableE() {

        float[] af = new float[ 129 ];
        int i1 = 0;
        for ( int j1 = af.length; i1 < j1; i1++ ) {
            af[ i1 ] = (float) Math.sin( (double) ( (float) i1 / 128F ) * 1.5707963267948966D );
        }

        return af;
    }


    static short[] f() {

        return l;
    }

}

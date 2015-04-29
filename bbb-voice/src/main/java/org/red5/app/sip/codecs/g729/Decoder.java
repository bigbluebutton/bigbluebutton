package org.red5.app.sip.codecs.g729;


import org.red5.app.sip.BufferUtils;


public class Decoder {

    float[] synth_buf = new float[ LD8KConstants.L_FRAME + LD8KConstants.M ]; // Synthesis

    float[] Az_dec = new float[ 2 * LD8KConstants.MP1 ];

    float[] pst_out = new float[ LD8KConstants.L_FRAME ]; // postfilter output

    short[] serial = new short[ LD8KConstants.SERIAL_SIZE ]; // Serial stream

    int[] parm = new int[ LD8KConstants.PRM_SIZE + 1 ]; // Synth parameters BFI

    int synth;

    int ptr_Az; // Decoded Az for post-filter

    int voicing; // voicing for previous subframe

    IntegerPointer t0_first = new IntegerPointer();

    IntegerPointer sf_voic = new IntegerPointer( 0 ); // voicing for subframe

    DecLD8K decLD = new DecLD8K();

    PostFil postFil = new PostFil();

    PostPro postPro = new PostPro();


    public Decoder() {

        for ( int i = 0; i < LD8KConstants.M; i++ ) {
            synth_buf[ i ] = (float) 0.0;
        }

        synth = 0 + LD8KConstants.M;

        decLD.init_decod_ld8k();
        postFil.init_post_filter();
        postPro.init_post_process();
        voicing = 60;
    }


    public void decode( byte[] bufferIn, float[] bufferOut ) {

        int inOffset = 0;
        int outOffset = 0;
        int steps = bufferIn.length / LD8KConstants.L_ENC_FRAME;

        for ( int i = 0; i < steps; i++ ) {
            byte[] tempBufferIn = new byte[ LD8KConstants.L_ENC_FRAME ];
            float[] tempBufferOut = new float[ LD8KConstants.L_FRAME ];

            // Encode bufferIn
            BufferUtils.byteBufferIndexedCopy( tempBufferIn, 0, bufferIn, inOffset, LD8KConstants.L_ENC_FRAME );
            tempBufferOut = process( tempBufferIn );

            // Copy decoded data to bufferOut
            BufferUtils.floatBufferIndexedCopy( bufferOut, outOffset, tempBufferOut, 0, LD8KConstants.L_FRAME );

            inOffset += LD8KConstants.L_ENC_FRAME;
            outOffset += LD8KConstants.L_FRAME;
        }
    }


    /**
     * Perform compression.
     * 
     * @param input
     *            media
     * @return compressed media.
     */
    private float[] process( byte[] media ) {

        serial = Bits.fromRealBits( media );
        // serial = Util.byteArrayToShortArray(media);
        Bits.bits2prm_ld8k( serial, 2, parm, 1 );

        /*
         * the hardware detects frame erasures by checking if all bits are set
         * to zero
         */
        parm[ 0 ] = 0; /* No frame erasure */
        for ( int i = 2; i < LD8KConstants.SERIAL_SIZE; i++ ) {
            if ( serial[ i ] == 0 ) {
                parm[ 0 ] = 1; /* frame erased */
            }
        }

        /* check parity and put 1 in parm[4] if parity error */

        parm[ 4 ] = PParity.check_parity_pitch( parm[ 3 ], parm[ 4 ] );

        decLD.decod_ld8k( parm, 0, voicing, synth_buf, synth, Az_dec, t0_first ); /* Decoder */

        /* Post-filter and decision on voicing parameter */
        voicing = 0;
        ptr_Az = 0;// Az_dec;
        for ( int i = 0; i < LD8KConstants.L_FRAME; i += LD8KConstants.L_SUBFR ) {
            postFil.post( t0_first.value, synth_buf, synth + i, Az_dec, ptr_Az, pst_out, i, sf_voic );
            if ( sf_voic.value != 0 ) {
                voicing = sf_voic.value;
            }
            ptr_Az += LD8KConstants.MP1;
        }
        Util.copy( synth_buf, LD8KConstants.L_FRAME, synth_buf, 0, LD8KConstants.M );

        postPro.post_process( pst_out, LD8KConstants.L_FRAME );

        return pst_out;
    }
}

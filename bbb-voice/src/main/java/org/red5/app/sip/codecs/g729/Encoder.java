package org.red5.app.sip.codecs.g729;


import org.red5.app.sip.BufferUtils;


public class Encoder {

    private CodLD8K encoder = new CodLD8K();

    private PreProc preProc = new PreProc();
    
    private short[] serial = new short[ LD8KConstants.SERIAL_SIZE ];
    
    private int[] prm = new int[ LD8KConstants.PRM_SIZE ];


    public Encoder() {

        preProc.init_pre_process();
        encoder.init_coder_ld8k();
    }


    public void encode( float[] bufferIn, byte[] bufferOut ) {

        int inOffset = 0;
        int outOffset = 0;
        int steps = bufferIn.length / LD8KConstants.L_FRAME;

        for ( int i = 0; i < steps; i++ ) {
            byte[] tempBufferOut = new byte[ LD8KConstants.L_ENC_FRAME ];
            float[] tempBufferIn = new float[ LD8KConstants.L_FRAME ];

            // Encode bufferIn
            BufferUtils.floatBufferIndexedCopy( tempBufferIn, 0, bufferIn, inOffset, LD8KConstants.L_FRAME );
            tempBufferOut = process( tempBufferIn );

            // Copy encoded data to bufferOut
            BufferUtils.byteBufferIndexedCopy( bufferOut, outOffset, tempBufferOut, 0, LD8KConstants.L_ENC_FRAME );

            inOffset += LD8KConstants.L_FRAME;
            outOffset += LD8KConstants.L_ENC_FRAME;
        }
    }


    /**
     * Perform G729 encoding
     * 
     * @param input
     *            media
     * @return compressed media.
     */
    private byte[] process( float[] media ) {

        preProc.pre_process( media, LD8KConstants.L_FRAME );

        encoder.loadSpeech( media );
        encoder.coder_ld8k( prm, 0 );

        Bits.prm2bits_ld8k( prm, serial );
        return Bits.toRealBits( serial );
    }
}

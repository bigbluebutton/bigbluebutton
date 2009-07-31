package org.red5.codecs;


import org.red5.codecs.g729.Decoder;
import org.red5.codecs.g729.Encoder;


public class SIPCodecG729 implements SIPCodec {

    // Codec information
    private static final String codecName = "G729";

    private static String[] codecMediaAttributes = { "fmtp:18 annexb=no" };

    private static final int codecId = 18;

    private static int defaultEncodedFrameSize = 20;

    private static int defaultDecodedFrameSize = 160;

    private static int defaultSampleRate = 8000;

    private int outgoingPacketization = 0;

    private int incomingPacketization = 0;

    private Encoder encoder = new Encoder();
    
    private Decoder decoder = new Decoder();


    public SIPCodecG729() {

    }

    public void encodeInit( int defaultEncodePacketization ) {
        
        if ( this.outgoingPacketization == 0 ) {
            
            this.outgoingPacketization = defaultEncodePacketization;
        }
    }

    public void decodeInit( int defaultDecodePacketization ) {
        
        if ( this.incomingPacketization == 0 ) {
            
            this.incomingPacketization = defaultDecodePacketization;
        }
    }

    public String codecNegotiateAttribute( String attributeName, String localAttributeValue, String remoteAttributeValue ) {

        // Not applicable for this codec type
        return null;
    }

    public int getCodecBlankPacket( byte[] buffer, int offset ) {

        // TODO Auto-generated method stub
        return 0;
    }

    public int codecToPcm( byte[] bufferIn, float[] bufferOut ) {

        decoder.decode( bufferIn, bufferOut );

        return bufferOut.length;
    }

    public int pcmToCodec( float[] bufferIn, byte[] bufferOut ) {

        encoder.encode( bufferIn, bufferOut );

        return bufferOut.length;
    }

    public int getIncomingEncodedFrameSize() {

        return ( defaultEncodedFrameSize / SIPCodec.DEFAULT_PACKETIZATION ) * incomingPacketization;
    }

    public int getIncomingDecodedFrameSize() {

        return ( defaultDecodedFrameSize / SIPCodec.DEFAULT_PACKETIZATION ) * incomingPacketization;
    }

    public int getOutgoingEncodedFrameSize() {

        return ( defaultEncodedFrameSize / SIPCodec.DEFAULT_PACKETIZATION ) * outgoingPacketization;
    }

    public int getOutgoingDecodedFrameSize() {

        return ( defaultDecodedFrameSize / SIPCodec.DEFAULT_PACKETIZATION ) * outgoingPacketization;
    }

    public int getIncomingPacketization() {

        return incomingPacketization;
    }

    public int getOutgoingPacketization() {

        return outgoingPacketization;
    }

    public void setLocalPtime( int localPtime ) {
        
        // Test for prior update during attributes negotiation.
        if ( this.incomingPacketization == 0 ) {
            
            incomingPacketization = localPtime;
        }
    }

    public void setRemotePtime( int remotePtime ) {
        
        // Test for prior update during attributes negotiation.
        if ( this.outgoingPacketization == 0 ) {
            
            outgoingPacketization = remotePtime;
        }
    }

    public int getSampleRate() {

        return defaultSampleRate;
    }

    public String getCodecName() {

        return codecName;
    }

    public int getCodecId() {

        return codecId;
    }

    public String[] getCodecMediaAttributes() {

        return codecMediaAttributes;
    }
}

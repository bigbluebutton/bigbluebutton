package org.red5.app.sip.codecs;

import java.util.Arrays;

import local.media.G711;


public class PCMUCodec implements Codec {

    // Codec information
    private static final String codecName = "PCMU";    
    private static final int codecId = 0;
    private static int defaultEncodedFrameSize = 160;
    private static int defaultDecodedFrameSize = 160;        
    private static int defaultSampleRate = 8000;
    private int outgoingPacketization = 0;
    private int incomingPacketization = 0;


    public PCMUCodec() {}


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
        Arrays.fill( buffer, offset, offset + getOutgoingEncodedFrameSize(), (byte)G711.linear2ulaw(0));        
        return getOutgoingEncodedFrameSize();
    }


    public int codecToPcm( byte[] bufferIn, float[] bufferOut ) {

        if ( bufferIn.length > 0 ) {
            for ( int i = 0; i < bufferIn.length; i++ ) {
                bufferOut[ i ] = (float) G711.ulaw2linear( (int) bufferIn[ i ] );
            }
            
            return bufferOut.length;
        }
        else {
            return 0;
        }  
    }


    public int pcmToCodec( float[] bufferIn, byte[] bufferOut ) {

        if ( bufferIn.length > 0 ) {
            for ( int i = 0; i < bufferIn.length; i++ ) {
                bufferOut[ i ] = (byte) G711.linear2ulaw( (int) bufferIn[ i ] );
            }
            
            return bufferOut.length;
        }
        else {
            return 0;
        }        
    }


    public int getIncomingEncodedFrameSize() {

        return ( defaultEncodedFrameSize / Codec.DEFAULT_PACKETIZATION ) * incomingPacketization;
    }


    public int getIncomingDecodedFrameSize() {

        return ( defaultDecodedFrameSize / Codec.DEFAULT_PACKETIZATION ) * incomingPacketization;
    }


    public int getOutgoingEncodedFrameSize() {
        return ( defaultEncodedFrameSize / Codec.DEFAULT_PACKETIZATION ) * outgoingPacketization;
    }


    public int getOutgoingDecodedFrameSize() {

        return ( defaultDecodedFrameSize / Codec.DEFAULT_PACKETIZATION ) * outgoingPacketization;
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

        // TODO Auto-generated method stub
        return null;
    }
}

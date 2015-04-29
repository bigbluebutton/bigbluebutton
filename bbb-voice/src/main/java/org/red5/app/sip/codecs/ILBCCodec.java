package org.red5.app.sip.codecs;


import org.red5.app.sip.codecs.ilbc.bitstream;
import org.red5.app.sip.codecs.ilbc.ilbc_constants;
import org.red5.app.sip.codecs.ilbc.ilbc_decoder;
import org.red5.app.sip.codecs.ilbc.ilbc_encoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class ILBCCodec implements Codec {

    protected static Logger log = LoggerFactory.getLogger( ILBCCodec.class );
    
    
    // Codec information
    private static final String codecName = "ILBC";
    
    private static String[] codecMediaAttributes = { "fmtp:111 mode=30" };

    private static final int codecId = 111;

    private static int sampleFrame20ms = 20;

    private static int sampleFrame30ms = 30;

    private static int defaultEncodedFrameSize20ms = ilbc_constants.NO_OF_BYTES_20MS;

    private static int defaultEncodedFrameSize30ms = ilbc_constants.NO_OF_BYTES_30MS;

    private static int defaultDecodedFrameSize20ms = ilbc_constants.BLOCKL_20MS;

    private static int defaultDecodedFrameSize30ms = ilbc_constants.BLOCKL_30MS;

    private static int defaultSampleRate = 8000;

    // For iLBC we must init this with default "mode" packetization.
    private int outgoingPacketization = 30;

    // For iLBC we must init this with default "mode" packetization.
    private int incomingPacketization = 30;

    private ilbc_encoder ilbcEncoder;

    private ilbc_decoder ilbcDecoder;


    public ILBCCodec() {

    }


    public void encodeInit( int defaultEncodePacketization ) {

        ilbcEncoder = new ilbc_encoder( outgoingPacketization );
    }


    public void decodeInit( int defaultDecodePacketization ) {

        ilbcDecoder = new ilbc_decoder( incomingPacketization, 1 );
    }


    public String codecNegotiateAttribute( String attributeName, String localAttributeValue, String remoteAttributeValue ) {

        Integer localMode = Codec.DEFAULT_PACKETIZATION;
        Integer remoteMode = 0;
        String finalAttributeValue = "";

        printLog( "codecNegotiateAttribute ", 
                "attributeName = [" + attributeName + 
                "localAttributeValue = [" + localAttributeValue + 
                "] remoteAttributeValue = [" + remoteAttributeValue + "]." );
        
        if ( 0 == attributeName.compareTo( Codec.ATTRIBUTE_FMTP ) ) {
            
            if ( ( null == remoteAttributeValue ) || ( remoteAttributeValue.isEmpty() ) ) {
                
                finalAttributeValue = "";
            }
            else {
                remoteMode = extractModeFromFmtpValue( remoteAttributeValue );
                
                if ( ( null != localAttributeValue ) && ( !localAttributeValue.isEmpty() ) ) {
                    
                    localMode = extractModeFromFmtpValue( localAttributeValue );
                }
                
                if ( remoteMode > localMode ) {
                    
                    finalAttributeValue = remoteAttributeValue;
                    
                    outgoingPacketization = remoteMode;
                    incomingPacketization = remoteMode;
                }
                else if ( null == localAttributeValue ) {
                    
                    finalAttributeValue = remoteAttributeValue.substring( 
                            0, remoteAttributeValue.indexOf( " mode=" ) + 6 );
                    finalAttributeValue.concat( localMode.toString() );
                }
            }
        }
        
        printLog( "codecNegotiateAttribute ",  
                "finalAttributeValue = [" + finalAttributeValue + "]." );
        
        return finalAttributeValue;
    }
    
    
    protected int extractModeFromFmtpValue( String fmtpValue ) {
        
        int modePos = fmtpValue.indexOf( " mode=" ) + 6;
        return Integer.parseInt( fmtpValue.substring( modePos ) );
    }


    public int getCodecBlankPacket( byte[] buffer, int offset ) {

        // TODO Auto-generated method stub
        return 0;
    }


    public int codecToPcm( byte[] bufferIn, float[] bufferOut ) {

        short[] encodedData = CodecUtils.byteToShortArray(bufferIn, 0, bufferIn.length, false);

        bitstream encodedBitStream = new bitstream( getOutgoingDecodedFrameSize() * 2 );
        
        for (int i = 0; i < encodedData.length; i++) {
            encodedBitStream.buffer[2*i+1] = (char) (encodedData[i] & 0xff);
            encodedBitStream.buffer[2*i] = (char) ((encodedData[i] >> 8) & 0xff);
        }
        
        ilbcDecoder.iLBC_decode(bufferOut, encodedBitStream, 1);

        return getOutgoingDecodedFrameSize();
    }


    public int pcmToCodec( float[] bufferIn, byte[] bufferOut ) {

        short[] encodedData = new short[ getIncomingEncodedFrameSize() / 2 ];

        bitstream encodedBitStream = new bitstream( getIncomingEncodedFrameSize() * 2 );

        ilbcEncoder.iLBC_encode( encodedBitStream, bufferIn );

        for ( int i = 0; i < encodedData.length; i++ ) {
            encodedData[ i ] = (short) ( ( ( encodedBitStream.buffer[ 2 * i ] << 8 ) & 0xff00 ) | ( ( (short) encodedBitStream.buffer[ 2 * i + 1 ] ) & 0x00ff ) );
        }

        CodecUtils.shortArrToByteArr( encodedData, bufferOut, false );

        return getIncomingEncodedFrameSize();
    }


    public int getIncomingEncodedFrameSize() {

        if ( incomingPacketization == sampleFrame20ms ) {
            return defaultEncodedFrameSize20ms;
        }
        else if ( incomingPacketization == sampleFrame30ms ) {
            return defaultEncodedFrameSize30ms;
        }

        return defaultEncodedFrameSize20ms;
    }


    public int getIncomingDecodedFrameSize() {

        if ( incomingPacketization == sampleFrame20ms ) {
            return defaultDecodedFrameSize20ms;
        }
        else if ( incomingPacketization == sampleFrame30ms ) {
            return defaultDecodedFrameSize30ms;
        }

        return defaultDecodedFrameSize20ms;
    }


    public int getOutgoingEncodedFrameSize() {

        if ( outgoingPacketization == sampleFrame20ms ) {
            return defaultEncodedFrameSize20ms;
        }
        else if ( outgoingPacketization == sampleFrame30ms ) {
            return defaultEncodedFrameSize30ms;
        }

        return defaultEncodedFrameSize20ms;
    }


    public int getOutgoingDecodedFrameSize() {

        if ( outgoingPacketization == sampleFrame20ms ) {
            return defaultDecodedFrameSize20ms;
        }
        else if ( outgoingPacketization == sampleFrame30ms ) {
            return defaultDecodedFrameSize30ms;
        }

        return defaultDecodedFrameSize20ms;
    }

    public int getIncomingPacketization() {

        return incomingPacketization;
    }


    public int getOutgoingPacketization() {

        return outgoingPacketization;
    }


    public void setLocalPtime( int localPtime ) {
        
        // For iLBC we have a "mode" paramater setted and it 
        // overcomes any ptime configuration.
    }

    public void setRemotePtime( int remotePtime ) {
        
        // For iLBC we have a "mode" paramater setted and it 
        // overcomes any ptime configuration.
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


    private static void printLog( String method, String message ) {
        
        log.debug( "SIPCodecUtils - " + method + " -> " + message );
        System.out.println( "SIPCodecUtils - " + method + " -> " + message );
    }
}

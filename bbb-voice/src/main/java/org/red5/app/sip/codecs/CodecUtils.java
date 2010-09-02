package org.red5.app.sip.codecs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zoolu.sdp.AttributeField;
import org.zoolu.sdp.SessionDescriptor;


/**
 * A utility class for determine, instantiate and configure SIP codec,
 * based on payload, local and remote SDP packets
 */
public class CodecUtils {

    protected static Logger log = LoggerFactory.getLogger( CodecUtils.class );
    
    
    public static Codec initSipAudioCodec( Codec audioCodec, int defaultEncodePacketization, 
            int defaultDecodePacketization, SessionDescriptor localSDP, SessionDescriptor remoteSDP ) {
        
        AttributeField remotePtimeAttribute = 
                remoteSDP.getMediaDescriptor( Codec.MEDIA_TYPE_AUDIO ).
                getAttribute( Codec.ATTRIBUTE_PTIME );
        
        if ( remotePtimeAttribute != null ) {
            
            audioCodec.setRemotePtime( 
                    Integer.valueOf( remotePtimeAttribute.getAttributeValue() ) );
        }
        
        AttributeField localPtimeAttribute = 
                localSDP.getMediaDescriptor( Codec.MEDIA_TYPE_AUDIO ).
                getAttribute( Codec.ATTRIBUTE_PTIME );
        
        if ( localPtimeAttribute != null ) {
            audioCodec.setLocalPtime(Integer.valueOf( localPtimeAttribute.getAttributeValue() ) );
        }
    
        printLog( "initSipAudioCodec", 
                "Codec id = [" + audioCodec.getCodecId() + 
                "], codec name = [" + audioCodec.getCodecName() + 
                "], sampleRate = [" + audioCodec.getSampleRate() + 
                "], incomingEndodedFrameSize = [" + audioCodec.getIncomingEncodedFrameSize() + 
                "], incomingDedodedFrameSize = [" + audioCodec.getIncomingDecodedFrameSize() + 
                "], incomingPacketization = [" + audioCodec.getIncomingPacketization() + 
                "], outgoingEndodedFrameSize = [" + audioCodec.getOutgoingEncodedFrameSize() + 
                "], outgoingDedodedFrameSize = [" + audioCodec.getOutgoingDecodedFrameSize() + 
                "], outgoingPacketization = [" + audioCodec.getOutgoingPacketization() + "]." );
        
        // Initialize encode and decode codec.
        audioCodec.encodeInit( defaultEncodePacketization );
        audioCodec.decodeInit( defaultDecodePacketization );
        
        return audioCodec;
    }
    
    /**
     * Converts a byte array into a short array. Since a byte is 8-bits,
     * and a short is 16-bits, the returned short array will be half in
     * length than the byte array. If the length of the byte array is odd,
     * the length of the short array will be
     * <code>(byteArray.length - 1)/2</code>, i.e., the last byte is
     * discarded.
     *
     * @param byteArray a byte array
     * @param offset which byte to start from
     * @param length how many bytes to convert
     * @param little specifies whether the result should be using little endian
     * order or not.
     *
     * @return a short array, or <code>null</code> if byteArray is of zero
     *    length
     *
     * @throws java.lang.ArrayIndexOutOfBoundsException
     * @author Damian Minkov
     */
    public static short[] byteToShortArray
        (byte[] byteArray, int offset, int length, boolean little)
        throws ArrayIndexOutOfBoundsException
    {

        if (0 < length && (offset + length) <= byteArray.length)
        {
            int shortLength = length / 2;
            short[] shortArray = new short[shortLength];
            int temp;
            for (int i = offset, j = 0; j < shortLength;
                 j++, temp = 0x00000000)
            {
                if(little)
                {
                    temp = byteArray[i++] & 0x000000FF;
                    temp |= 0x0000FF00 & (byteArray[i++] << 8);
                }
                else
                {
                    temp = byteArray[i++] << 8;
                    temp |= 0x000000FF & byteArray[i++];
                }

                shortArray[j] = (short) temp;
            }
            return shortArray;
        }
        else
        {
            throw new ArrayIndexOutOfBoundsException
                ("offset: " + offset + ", length: " + length
                 + ", array length: " + byteArray.length);
        }
    }

    /**
     * The result array must be twice as the input one. Since a byte is 8-bits,
     * and a short is 16-bits.
     * @param in the short[] array that we'll be transforming.
     * @param res the byte[] arrays where we'll be setting the converted short
     * values.
     * @param little specifies whether the result should be using little endian
     * order or not.
     * @author Damian Minkov
     */
    public static void shortArrToByteArr(short[] in, byte[] res, boolean little)
    {
        int resIx = 0;

        byte[] tmp = null;
        for (int i = 0; i < in.length; i++)
        {
            tmp = shortToBytes(in[i], little);
            res[resIx++] = tmp[0];
            res[resIx++] = tmp[1];
        }
    }

    /**
     * Get a pair of bytes representing a short value.
     * @param v the short value to convert.
     * @param little specifies whether the result should be using little endian
     * order or no.
     * @return a byte[] array containing the result.
     * @author Damian Minkov
     */
    public static byte[] shortToBytes(short v, boolean little)
    {
        byte[] rtn = new byte[2];
        if (little)
        {
            rtn[0] = (byte) (v & 0xff);
            rtn[1] = (byte) ( (v >>> 8) & 0xff);
        }
        else
        {
            rtn[0] = (byte) ( (v >>> 8) & 0xff);
            rtn[1] = (byte) (v & 0xff);
        }
        return rtn;
    }


    private static void printLog( String method, String message ) {
        
        log.debug( "SIPCodecUtils - " + method + " -> " + message );
        System.out.println( "SIPCodecUtils - " + method + " -> " + message );
    }
}

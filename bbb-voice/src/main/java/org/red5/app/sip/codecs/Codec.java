package org.red5.app.sip.codecs;


/**
 * Interface for audio codecs
 * */
public interface Codec {
    public static final String MEDIA_TYPE_AUDIO = "audio";    
    public static final String MEDIA_TYPE_VIDEO = "video";    
    public static final String ATTRIBUTE_PTIME = "ptime";    
    public static final String ATTRIBUTE_RTPMAP = "rtpmap";   
    public static final String ATTRIBUTE_FMTP = "fmtp";    
    public static final String ATTRIBUTE_AS = "AS";   
    public static final int DEFAULT_PACKETIZATION = 20;
      
    public void encodeInit( int defaultEncodePacketization );
    public void decodeInit( int defaultDecodePacketization );
    public String codecNegotiateAttribute( String attributeName, String localAttributeValue, String remoteAttributeValue );
    public int getCodecBlankPacket( byte[] buffer, int offset );
    public int pcmToCodec( float[] bufferIn, byte[] bufferOut );
    public int codecToPcm( byte[] bufferIn, float[] bufferOut );
    public int getIncomingEncodedFrameSize();
    public int getIncomingDecodedFrameSize();
    public int getOutgoingEncodedFrameSize();
    public int getOutgoingDecodedFrameSize();
    public int getSampleRate();
    public String getCodecName();
    public int getCodecId();    
    public int getIncomingPacketization();    
    public int getOutgoingPacketization();    
    public void setLocalPtime( int localPtime );   
    public void setRemotePtime( int remotePtime );
    
    /**
     * Get codec media attributes used for SDP negotiation
     * Example: iLBC codec will return  "fmtp:111 mode=30"
     * @return String array containing codec attribute
     */
    public String[] getCodecMediaAttributes();
}

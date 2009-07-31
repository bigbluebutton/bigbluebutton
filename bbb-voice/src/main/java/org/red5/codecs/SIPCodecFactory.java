package org.red5.codecs;

import org.red5.server.webapp.sip.SIPUserAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * SIPCodec Factory
 * */
public class SIPCodecFactory {
    
    protected static Logger log = LoggerFactory.getLogger( SIPCodecFactory.class );
    
    // ----------------
    // Available audio codecs
    private static final int audioCodecPCMU = 0; 
    
    private static final int audioCodecPCMA = 8;
    
    private static final int audioCodecG729 = 18;
    
    private static final int audioCodeciLBC = 111;
    
    private int[] availableAudioCodecsId = { audioCodecPCMU, audioCodecPCMA, audioCodecG729, audioCodeciLBC };

    // ----------------
    // Available video codecs
    
    private int[] availableVideoCodecsId = {};
    
    
    private static SIPCodecFactory singletonSIPCodecFactory = new SIPCodecFactory();
    
    private static String[] codecCommonAudioMediaAttributes = { "ptime:20" };
        
    
    public static SIPCodecFactory getInstance() {

        return singletonSIPCodecFactory;
    }
    
    /**
     * Create a new instance of SIPCodec by codec id.
     * @return The codec associated with "codecId".
     * */
    public SIPCodec getSIPAudioCodec( int codecId ) {
        
        SIPCodec sipCodec;
        
        printLog( "getSIPAudioCodec", "Init..." );
        
        printLog( "getSIPAudioCodec", "codecId = [" + codecId + "]." );
        
        switch ( codecId ) {
            case audioCodecPCMU:
                sipCodec = new SIPCodecPCMU();
                break;
            case audioCodecPCMA:
                sipCodec = new SIPCodecPCMA();
                break;
            case audioCodecG729:
                sipCodec = new SIPCodecG729();
                break;
            case audioCodeciLBC:
                sipCodec = new SIPCodeciLBC();
                break;
            default:
                sipCodec = null;
        }
        
        if ( sipCodec != null ) {
            
            printLog( "getSIPAudioCodec", 
                    "codecId = [" + sipCodec.getCodecId() + 
                    "], codecName =  [" + sipCodec.getCodecName() + "]." );
        }
        
        return sipCodec;
    }
    
    /**
     * Get all available audio codecs
     * @return SIPCodec array containing all audio codecs instances
     */
    public SIPCodec[] getAvailableAudioCodecs() {
        
        printLog( "getAvailableAudioCodecs", "Init..." );
        
        SIPCodec[] availableCodecs = new SIPCodec[availableAudioCodecsId.length];
        
        for ( int i = 0; i < availableAudioCodecsId.length; i++ ) {
            int codecId = availableAudioCodecsId[ i ];
            SIPCodec codec = getSIPAudioCodec( codecId );
            availableCodecs[i] = codec;            
        }
        
        return availableCodecs;
        
    }
    
    /**
     * Get all available video codecs
     * @return SIPCodec array containing all video codecs instances
     */
    public SIPCodec[] getAvailableVideoCodecs() {
        
        printLog( "getAvailableVideoCodecs", "Init..." );
        
        SIPCodec[] availableCodecs = new SIPCodec[availableVideoCodecsId.length];
        
        for ( int i = 0; i < availableVideoCodecsId.length; i++ ) {
            int codecId = availableVideoCodecsId[ i ];
            SIPCodec codec = getSIPAudioCodec( codecId );
            availableCodecs[i] = codec;            
        }
        
        return availableCodecs;
        
    }
    
    /**
     * Get all available codecs
     * @param codecsPrecedence semicolon separated ids from the codecs
     * @return SIPCodec array containing all codecs instances
     */
    public SIPCodec[] getAvailableAudioCodecsWithPrecedence( String codecsPrecedence ) {
        
        int initIndex = 0;
        int finalIndex = codecsPrecedence.indexOf( ";" );
        String codecId;
        SIPCodec[] availableCodecs = new SIPCodec[availableAudioCodecsId.length];
        int codecsIndex = 0;
        
        printLog( "getAvailableAudioCodecsWithPrecedence", 
                "codecsPrecedence = [" + codecsPrecedence + 
                "], initIndex =  [" + initIndex + 
                "], finalIndex =  [" + finalIndex + "]." );
        
        while ( initIndex < finalIndex ) {
            
            codecId = codecsPrecedence.substring( initIndex, finalIndex );
            
            printLog( "getAvailableAudioCodecsWithPrecedence", 
                    "codecId = [" + codecId + "]." );
            
            SIPCodec sipCodec = getSIPAudioCodec( 
                    Integer.valueOf( codecId ).intValue() );
            
            if ( sipCodec != null ) {
                
                printLog( "getAvailableAudioCodecsWithPrecedence", 
                        "codecId = [" + sipCodec.getCodecId() + 
                        "], codecName =  [" + sipCodec.getCodecName() + "]." );
                
                availableCodecs[codecsIndex] = sipCodec;
                codecsIndex++;
                
                initIndex = finalIndex+1;
                finalIndex = codecsPrecedence.indexOf( ";", initIndex );
                
                if ( (finalIndex == -1 ) && 
                        ( initIndex <= codecsPrecedence.length() ) ) {

                    finalIndex = codecsPrecedence.length();
                }
                
                printLog( "getAvailableAudioCodecsWithPrecedence", 
                        "codecsIndex = [" + codecsIndex + 
                        "], initIndex =  [" + initIndex + 
                        "], finalIndex =  [" + finalIndex + "]." );
            }
            else {
                
                printLog( "getAvailableAudioCodecsWithPrecedence", 
                        "Problem with value [" + codecId + 
                        "] retrieved from [" + codecsPrecedence + "].");
            }
        }
        
        return availableCodecs;
        
    }
    
    /**
     * @return Count of available audio codecs
     */
    public int getAvailableAudioCodecsCount() {
        
        return availableAudioCodecsId.length;
    }
    
    /**
     * @return Count of available video codecs
     */
    public int getAvailableVideoCodecsCount() {
        
        return availableVideoCodecsId.length;
    }
    
    public String[] getCommonAudioMediaAttributes() {
        
        return codecCommonAudioMediaAttributes;
    }
    
    public String[] getCommonVideoMediaAttributes() {
        
        return null;
    }


    private static void printLog( String method, String message ) {
        
        log.debug( "SIPCodecFactory - " + method + " -> " + message );
        System.out.println( "SIPCodecFactory - " + method + " -> " + message );
    }
}

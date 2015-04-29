package org.red5.app.sip;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class BufferUtils {

    protected static Logger log = Red5LoggerFactory.getLogger( BufferUtils.class, "sip" );


    /**
     * Copy "copySize" floats from "origBuffer", starting on "startOrigBuffer",
     * to "destBuffer", starting on "startDestBuffer".
     */
    public static int floatBufferIndexedCopy(float[] destBuffer, int startDestBuffer, float[] origBuffer, int startOrigBuffer, int copySize ) {

        int destBufferIndex = startDestBuffer;
        int origBufferIndex = startOrigBuffer;
        int counter = 0;

///        println( "floatBufferIndexedCopy",
//                "destBuffer.length = " + destBuffer.length +
//                ", startDestBuffer = " + startDestBuffer +
//                ", origBuffer.length = " + origBuffer.length +
//                ", startOrigBuffer = " + startOrigBuffer +
 //               ", copySize = " + copySize + "." );

        if ( destBuffer.length < ( startDestBuffer + copySize ) ) {
            println( "floatBufferIndexedCopy", "Size copy problem." );
            return -1;
        }

        for ( counter = 0; counter < copySize; counter++ ) {
            destBuffer[ destBufferIndex ] = origBuffer[ origBufferIndex ];

            destBufferIndex++;
            origBufferIndex++;
        }

 //       println( "floatBufferIndexedCopy", counter + " bytes copied." );

        return counter;
    }


    /**
     * Copy "copySize" bytes from "origBuffer", starting on "startOrigBuffer",
     * to "destBuffer", starting on "startDestBuffer".
     */
    public static int byteBufferIndexedCopy(byte[] destBuffer, int startDestBuffer, byte[] origBuffer,
    					int startOrigBuffer, int copySize ) {

        int destBufferIndex = startDestBuffer;
        int origBufferIndex = startOrigBuffer;
        int counter = 0;

//        println( "byteBufferIndexedCopy",
///                "destBuffer.length = " + destBuffer.length +
 //               ", startDestBuffer = " + startDestBuffer +
 //               ", origBuffer.length = " + origBuffer.length +
 //              ", startOrigBuffer = " + startOrigBuffer +
 //               ", copySize = " + copySize + "." );

        if ( destBuffer.length < ( startDestBuffer + copySize ) ) {
            println( "byteBufferIndexedCopy", "size copy problem." );
            return -1;
        }

        for ( counter = 0; counter < copySize; counter++ ) {
            destBuffer[ destBufferIndex ] = origBuffer[ origBufferIndex ];

            destBufferIndex++;
            origBufferIndex++;
        }

//        println( "byteBufferIndexedCopy", counter + " bytes copied." );

        return counter;
    }


    private static void println( String method, String message ) {

//        log.debug( "BufferUtils - " + method + " -> " + message );
        //System.out.println( "BufferUtils - " + method + " -> " + message );
    }
}

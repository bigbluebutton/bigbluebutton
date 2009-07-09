package org.bigbluebutton.deskshare.socket;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;

import javax.imageio.ImageIO;

import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;
import org.bigbluebutton.deskshare.CapturedScreen;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ScreenCaptureProtocolDecoder extends CumulativeProtocolDecoder {
	final private Logger log = Red5LoggerFactory.getLogger(ScreenCaptureProtocolDecoder.class, "deskshare");
	
	private static final String DECODER_STATE_KEY = ScreenCaptureProtocolDecoder.class.getName() + ".STATE";

    public static final int MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    private static class DecoderState {
    	String room;
    	String videoInfo;
        BufferedImage capturedScreen;
    }

    private CapturedScreen capturedScreen;
    
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
//        log.debug("In doDecode");
    	DecoderState decoderState = (DecoderState) session.getAttribute(DECODER_STATE_KEY);
        if (decoderState == null) {
            decoderState = new DecoderState();
            session.setAttribute(DECODER_STATE_KEY, decoderState);
        }
        if (decoderState.room == null) {
        	log.debug("In decoderState.room");
            if (getCrLfTerminatedString(in, decoderState)) {
                capturedScreen = new CapturedScreen();
                capturedScreen.setRoom(decoderState.room);
                log.debug("Decoded room {}", decoderState.room);
                return true;
            } 
            return false;
        }
        if (decoderState.videoInfo == null) {
        	log.debug("In decoderState.videoInfo");
        	if (getCrLfTerminatedString(in, decoderState)) {
                log.debug("Decoded videoInfo {}", decoderState.videoInfo);
                //Get the screen dimensions from the client, i.e. the resolution of the video we need to create
    			String[] screenDimensions = decoderState.videoInfo.split("x");
    			int width = Integer.parseInt(screenDimensions[0]);
    			int height = Integer.parseInt(screenDimensions[1]);
    			int frameRate = Integer.parseInt(screenDimensions[2]);
    			
                capturedScreen.setWidth(width);
                capturedScreen.setHeight(height);
                capturedScreen.setFrameRate(frameRate);
                return true;
            } 
            return false;
        }
        if (decoderState.capturedScreen == null) {
        	//log.debug("Decoding image");
        	if (in.prefixedDataAvailable(4, MAX_IMAGE_SIZE)) {
            //if (in.prefixedDataAvailable(4)) {
                BufferedImage image = readImage(in);
                
                capturedScreen.setScreen(image);
                out.write(capturedScreen);
    			
                decoderState.room = null;
                decoderState.videoInfo = null;
                decoderState.capturedScreen = null;
                capturedScreen = null;
                return true;
            } else {
 //               log.debug("not enough data available to read captured image");
                return false;
            }
        }

        return false;
    }

    private BufferedImage readImage(IoBuffer in) throws IOException {
        int length = in.getInt();
        byte[] bytes = new byte[length];
        log.debug("Reading image with length {}", length);
        in.get(bytes);
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return ImageIO.read(bais);
    }

    private boolean getCrLfTerminatedString(IoBuffer in, DecoderState decoderState) {
    	// Remember the initial position.
        int start = in.position();

        // Now find the first CRLF in the buffer.
        byte previous = 0;
        while (in.hasRemaining()) {
            byte current = in.get();

            if (previous == '\r' && current == '\n') {
                // Remember the current position and limit.
                int position = in.position();
                int limit = in.limit();
                try {
                    in.position(start);
                    in.limit(position);
                    // The bytes between in.position() and in.limit()
                    // now contain a full CRLF terminated line.
                    parseLine(in.slice(), decoderState);
                } finally {
                    // Set the position to point right after the
                    // detected line and set the limit to the old
                    // one.
                    in.position(position);
                    in.limit(limit);
                }
                // Decoded one line; CumulativeProtocolDecoder will
                // call me again until I return false. So just
                // return true until there are no more lines in the
                // buffer.
                return true;
            }

            previous = current;
        }

        // Could not find CRLF in the buffer. Reset the initial
        // position to the one we recorded above.
        in.position(start);

        return false;
    }
    
    private void parseLine(IoBuffer in, DecoderState decoderState) {
    	try {
			String line = in.getString(Charset.forName( "UTF-8" ).newDecoder());
			if (decoderState.room == null) {
				decoderState.room = line.trim();
			} else {
				decoderState.videoInfo = line.trim();
			}
		} catch (CharacterCodingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
    }

}

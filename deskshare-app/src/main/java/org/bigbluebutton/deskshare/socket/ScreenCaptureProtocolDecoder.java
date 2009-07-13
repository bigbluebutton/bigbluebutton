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
	
    private static final int MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final String ROOM = "ROOM";
    private static final String VIDEO_INFO = "VIDEO_INFO";
    private static final String CAPTURED_SCREEN = "CAPTURED_SCREEN";
    
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
    	
    	if (!session.containsAttribute(ROOM)) {
    		return decodeRoom(session, in);
    	} else if (!session.containsAttribute(VIDEO_INFO)) {
    		return decodeRoom(session, in);
    	} else {
    		if (decodeCapturedScreen(session, in)) {
    			BufferedImage screen = (BufferedImage) session.getAttribute(CAPTURED_SCREEN);
    			String room = (String) session.getAttribute(ROOM);
    			String videoInfo = (String) session.getAttribute(VIDEO_INFO);
    			
    			//Get the screen dimensions from the client, i.e. the resolution of the video we need to create
    			String[] screenDimensions = videoInfo.split("x");
    			int width = Integer.parseInt(screenDimensions[0]);
    			int height = Integer.parseInt(screenDimensions[1]);
    			int frameRate = Integer.parseInt(screenDimensions[2]);

    			CapturedScreen cs = new CapturedScreen(screen, room, width, height, frameRate);
    			out.write(cs);
    			
    			reset(session);
    			return true;
    		}
    	}
    	return false;
    }
    
    private boolean decodeCapturedScreen(IoSession session, IoBuffer in) {
        if (in.prefixedDataAvailable(4, MAX_IMAGE_SIZE)) {
        	BufferedImage image;
			try {
				image = readImage(in);
				session.setAttribute(CAPTURED_SCREEN, image);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        	
            return true;
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

    private boolean decodeRoom(IoSession session, IoBuffer in) {
    	return getCrLfTerminatedString(session, in);
    }
    
    private boolean getCrLfTerminatedString(IoSession session, IoBuffer in) {
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
                    parseLine(session, in.slice());
                } finally {
                    // Set the position to point right after the
                    // detected line and set the limit to the old
                    // one.
                    in.position(position);
                    in.limit(limit);
                }
                return true;
            }

            previous = current;
        }

        // Could not find CRLF in the buffer. Reset the initial
        // position to the one we recorded above.
        in.position(start);

        return false;
    }
    
    private void parseLine(IoSession session, IoBuffer in) {
    	try {
			String line = in.getString(Charset.forName( "UTF-8" ).newDecoder());
			if (!session.containsAttribute(ROOM)) {
				session.setAttribute(ROOM, line.trim());
			} else {
				session.setAttribute(VIDEO_INFO, line.trim());
			}
		} catch (CharacterCodingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
    }
    
    private void reset(IoSession session) {
    	session.removeAttribute(ROOM);
    	session.removeAttribute(VIDEO_INFO);
    	session.removeAttribute(CAPTURED_SCREEN);
    }

}

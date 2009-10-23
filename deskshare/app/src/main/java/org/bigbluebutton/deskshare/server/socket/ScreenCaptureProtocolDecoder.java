/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server.socket;

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
import org.bigbluebutton.deskshare.server.CaptureStartEvent;
import org.bigbluebutton.deskshare.server.CaptureUpdateEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ScreenCaptureProtocolDecoder extends CumulativeProtocolDecoder {
	final private Logger log = Red5LoggerFactory.getLogger(ScreenCaptureProtocolDecoder.class, "deskshare");
	
    private static final String ROOM = "ROOM";
    private static final String VIDEO_INFO = "VIDEO_INFO";

    private static final byte CAPTURE_START_EVENT = 0;
    private static final byte CAPTURE_UPDATE_EVENT = 1;
    private static final byte CAPTURE_END_EVENT = 2;
    
    private static final String EVENT_TYPE = "EVENT_TYPE";
    private static final String IS_KEY_FRAME = "IS_KEY_FRAME";
    private static final String ENCODED_DATA = "ENCODED_DATA";
    
    private static final int HEADER_LENGTH = 6;
    
    private long receiveStart;
    
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
     	
    	if (session.containsAttribute(EVENT_TYPE)) {
    		
    		Integer eventType = (Integer) session.getAttribute(EVENT_TYPE);
    		
    		boolean receiveDone = false;
    		
    		// Now we know which event we are dealing with.
    		switch (eventType.intValue()) {
	    		case CAPTURE_START_EVENT:
	    			receiveDone = decodeCaptureStartEvent(session, in, out);
	    			break;
	    		case CAPTURE_UPDATE_EVENT:
	    			receiveDone = decodeCaptureUpdateEvent(session, in, out);
	    			break;
	    		case CAPTURE_END_EVENT: 
	  //  			decodeCaptureEnd(session, in, out);
	    			break;
    		}
    		
    		if (receiveDone) {
    			long receiveComplete = System.currentTimeMillis();
    			System.out.println("Receive took " + (receiveComplete - receiveStart) + "ms.");
    		}
    		
    	} else {
    		// Let's work with a buffer that contains header and the event and room
    		// ten (10) should be enough since header plus event is 8 bytes
    		if (in.remaining() < 10) return false;
    		
    		byte[] header = new byte[HEADER_LENGTH]; 
    		in.get(header, 0, HEADER_LENGTH);
    		int event = in.get();    		
    		System.out.println("Received " + header + " type " + event);    		
    		session.setAttribute(EVENT_TYPE, new Integer(event));
    		receiveStart = System.currentTimeMillis();
    		return true;

    	}
    	return false;
    }
        
    private boolean decodeCaptureStartEvent(IoSession session, IoBuffer in, ProtocolDecoderOutput out) {   	
    	if (session.containsAttribute(ROOM)) {
    		if (decodeVideoInfo(session, in)) {
    			sendCaptureStartMessage(session, out);
    			return true; 
    		}    		
    	} else {
    		decodeRoom(session, in);
    	}
    	return false;
    }
    
    private void decodeRoom(IoSession session, IoBuffer in) {
    	if (in.remaining() < 200) return;
    	
    	int len = in.getInt();
    	String room = decodeString(len, in);
    	if (room != "") {
    		System.out.println("Decoded ROOM " + room);
    		session.setAttribute(ROOM, room);
    	}
    }
    
    private boolean decodeVideoInfo(IoSession session, IoBuffer in) {
    	if (in.remaining() < 200) return false;
    	
    	int len = in.getInt();
    	String videoInfo = decodeString(len, in);
    	if (videoInfo != "") {
    		System.out.println("Decoded VIDEO_INFO " + videoInfo);
    		session.setAttribute(VIDEO_INFO, videoInfo);
    		return true;
    	}
    	return false;
    }
    
    private String decodeString(int length, IoBuffer in) {
    	try {
    		if (in.remaining() >= length) {
    			return in.getString(length, Charset.forName( "UTF-8" ).newDecoder());
    		}
		} catch (CharacterCodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return "";
    }
    
    private void sendCaptureStartMessage(IoSession session, ProtocolDecoderOutput out) {
		String room = (String) session.getAttribute(ROOM);
		String videoInfo = (String) session.getAttribute(VIDEO_INFO);
		log.debug("Room " + room + " videoInfo " + videoInfo);
		System.out.println("Room " + room + " videoInfo " + videoInfo);
		//Get the screen dimensions, i.e. the resolution of the video we need to create
		String[] screenDimensions = videoInfo.split("x");
		int width = Integer.parseInt(screenDimensions[0]);
		int height = Integer.parseInt(screenDimensions[1]);
		
		CaptureStartEvent cse = new CaptureStartEvent(room, width, height); 
		out.write(cse);
		reset(session);
    }
    
    private boolean decodeCaptureUpdateEvent(IoSession session, IoBuffer in, ProtocolDecoderOutput out) {
    	if (session.containsAttribute(ROOM)) {
    		if (decodeScreenVideoData(session, in)) {
    			sendCaptureUpdateEvent(session, out);
    			return true; 
    		}    		
    	} else {
    		decodeRoom(session, in);
    	}
    	return false;
    }
    
    private boolean decodeScreenVideoData(IoSession session, IoBuffer in) {
    	int start = in.position();
    	
    	byte isKeyFrame = in.get();
    	int length = in.getInt();
    	
    	if (in.remaining() < length) {
    		in.position(start);
    		return false;
    	}
    	
    	byte[] data = new byte[length];
    		
    	in.get(data, 0, length);
    	
    	boolean keyFrame = false;
    	
    	if (isKeyFrame == 1) {
    		keyFrame = true;
    	}
    	
    	session.setAttribute(IS_KEY_FRAME, new Boolean(keyFrame));
    	session.setAttribute(ENCODED_DATA, data);
    	
    	return true;    	
    }

    
    private void sendCaptureUpdateEvent(IoSession session, ProtocolDecoderOutput out) {

    	String room = (String) session.getAttribute(ROOM);
		Boolean isKeyFrame = (Boolean) session.getAttribute(IS_KEY_FRAME);
		byte[] data = (byte[]) session.getAttribute(ENCODED_DATA);
		
		IoBuffer buffer = IoBuffer.allocate(data.length, false);
		buffer.put(data);
		
		/* Set the marker back to zero position so that "gets" start from the beginning.
		 * Otherwise, you get BufferUnderFlowException.
		 */		
		buffer.rewind();
		
		System.out.println("Room " + room + " keyFrame " + isKeyFrame 
				+ " data size " + data.length + " buffer size " + buffer.remaining());
		CaptureUpdateEvent cse = new CaptureUpdateEvent(room, buffer);
		out.write(cse);
		reset(session);
    }
        
    private void reset(IoSession session) {
    	session.removeAttribute(EVENT_TYPE);
    	session.removeAttribute(ROOM);
    	session.removeAttribute(IS_KEY_FRAME);
    	session.removeAttribute(ENCODED_DATA);
    }
}

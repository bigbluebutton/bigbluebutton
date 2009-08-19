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
 * $Id: $
 */
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
import org.bigbluebutton.deskshare.CaptureStartEvent;
import org.bigbluebutton.deskshare.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.CapturedScreen;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ScreenCaptureProtocolDecoder extends CumulativeProtocolDecoder {
	final private Logger log = Red5LoggerFactory.getLogger(ScreenCaptureProtocolDecoder.class, "deskshare");
	
    private static final String ROOM = "ROOM";
    private static final String VIDEO_INFO = "VIDEO_INFO";
    private static final String TILE_INFO = "TILE_INFO";
    private static final int CAPTURE_START = 0;
    private static final int CAPTURE_UPDATE = 1;
    private static final int CAPTURE_END = 2;
    
    private static final String MESSAGE_TYPE = "MESSAGE_TYPE";
    
    private static final String TILE_IMAGE = "TILE_IMAGE";
        
    protected boolean doDecode(IoSession session, IoBuffer in, ProtocolDecoderOutput out) throws Exception {
 
    	if (session.containsAttribute(MESSAGE_TYPE)) {
    		Integer messageType = (Integer) session.getAttribute(MESSAGE_TYPE);
    		switch (messageType.intValue()) {
    		case CAPTURE_START:
    			return decodeCaptureStart(session, in, out);
    		case CAPTURE_UPDATE:
    			return decodeCaptureUpdate(session, in, out);
    		case CAPTURE_END: 
  //  			decodeCaptureEnd(session, in, out);
    			break;
    		}
    	} else {
    		if (in.remaining() < 20) return false;
    		int message = in.getInt();
 //   		log.debug("Got message " + message);
    		session.setAttribute(MESSAGE_TYPE, new Integer(message));
    		return true;

    	}
    	return false;
    }
    
    
    private boolean decodeCaptureStart(IoSession session, IoBuffer in, ProtocolDecoderOutput out) {   	
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
    		session.setAttribute(ROOM, room);
    	}
    }
    
    private boolean decodeVideoInfo(IoSession session, IoBuffer in) {
    	if (in.remaining() < 200) return false;
    	
    	int len = in.getInt();
    	String videoInfo = decodeString(len, in);
    	if (videoInfo != "") {
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
		
		//Get the screen dimensions, i.e. the resolution of the video we need to create
		String[] screenDimensions = videoInfo.split("x");
		int width = Integer.parseInt(screenDimensions[0]);
		int height = Integer.parseInt(screenDimensions[1]);
		int frameRate = Integer.parseInt(screenDimensions[2]);
		
		CaptureStartEvent cse = new CaptureStartEvent(room, width, height, frameRate);
		out.write(cse);
		clearMessage(session);
    }
    
    private boolean decodeCaptureUpdate(IoSession session, IoBuffer in, ProtocolDecoderOutput out) {
    	if (! session.containsAttribute(TILE_INFO)) {
    		return decodeTileInfo(session, in);
    	} else {
    		if (decodeTile(session, in)) {
    			sendCaptureUpdateMessage(session, out);
    			return true;    			
    		}
    	}

    	return false;
    }
    
    private boolean decodeTileInfo(IoSession session, IoBuffer in) {
    	if (in.remaining() < 200) return false;

    	int len = in.getInt();
    	String tileInfo = decodeString(len, in);
    	
    	if (tileInfo != "") {
    		session.setAttribute(TILE_INFO, tileInfo);
    		return true;
    	}
    	return true;    	
    }
    
    private boolean decodeTile(IoSession session, IoBuffer in) {
    	if (in.remaining() < 40) return false;

    	int start = in.position();
    	
    	int tileLength = in.getInt();
    	
    	if (in.remaining() >= tileLength) {
       	 	byte[] bytes = new byte[tileLength];
//	        log.debug("Reading image with length {}", bytes.length);
	        in.get(bytes);
	        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
	        
	        try {
	        	BufferedImage image = ImageIO.read(bais);
    	        session.setAttribute(TILE_IMAGE, image);
	        } catch (IOException e) {
	        	log.error("Failed to get captured screen for room ");
	        }    
	        return true;
    	}
    	
//    	log.debug("Can't process image yet . " + tileLength);		
    	in.position(start);
	    return false;        	
    }
    
    private void sendCaptureUpdateMessage(IoSession session, ProtocolDecoderOutput out) {
		String room = (String) session.getAttribute(ROOM);
		String tileInfo = (String) session.getAttribute(TILE_INFO);
//		log.debug("TILE INFO " + tileInfo);
		
		//Get the tile dimensions, i.e. the resolution of the video we need to create
		String[] tileDim = tileInfo.split("x");
		int width = Integer.parseInt(tileDim[0]);
		int height = Integer.parseInt(tileDim[1]);
		int x = Integer.parseInt(tileDim[2]);
		int y = Integer.parseInt(tileDim[3]);
		int pos = Integer.parseInt(tileDim[4]);
		
		BufferedImage tile = (BufferedImage) session.getAttribute(TILE_IMAGE);
		CaptureUpdateEvent cse = new CaptureUpdateEvent(tile, room, width, height, x, y, pos);
		out.write(cse);
		reset(session);
    }
        
    private void clearMessage(IoSession session) {
    	session.removeAttribute(MESSAGE_TYPE);
    }
    
    private void reset(IoSession session) {
    	session.removeAttribute(TILE_INFO);
    	session.removeAttribute(TILE_IMAGE);
    	clearMessage(session);
    }
}

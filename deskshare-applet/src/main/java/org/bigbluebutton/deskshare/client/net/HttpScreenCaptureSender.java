/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.deskshare.client.net;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;

import javax.imageio.ImageIO;

import org.bigbluebutton.deskshare.client.tiles.ChangedTile;
import org.bigbluebutton.deskshare.client.tiles.Tile;


import com.myjavatools.web.ClientHttpRequest;

public class HttpScreenCaptureSender implements ScreenCaptureSender {
	private String host = "localhost";
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	private static final String SCREEN_CAPTURE__URL = "/deskshare/tunnel/screenCapture";
	private URL url;
	URLConnection conn;
	private String videoInfo;
	
	public void connect(String host, String room, int width, int height) {
		this.host = host;
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		
		if (openConnection()) {
			try {
				sendCaptureStartEvent();
			} catch (IOException e) {
				e.printStackTrace();
			}     		
		}
	}

	private boolean openConnection() {
		/**
		 * Need to re-establish connection each time, otherwise, 
		 * we get java.net.ProtocolException: Cannot write output after reading input.
		 * 
		 * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4382944
		 * 
		 */
		try {
			url = new URL("http://" + host + SCREEN_CAPTURE__URL);
			conn = url.openConnection();
			return true;
		} catch (MalformedURLException e) {			
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}	 		
		
		return false;
	}
	
	private void sendCaptureStartEvent() throws IOException {
		ClientHttpRequest chr = new ClientHttpRequest(conn);
		chr.setParameter("room", room);
		
			videoInfo = Integer.toString(videoWidth)
							+ "x" + Integer.toString(videoHeight)
							+ "x" + Integer.toString(frameRate);

		chr.setParameter("videoInfo", videoInfo);
		chr.setParameter("event", CaptureEvents.CAPTURE_START.getEvent());
		chr.post();
	}
	
	public void disconnect() {
		if (openConnection()) {
			try {
				sendCaptureEndEvent();
			} catch (IOException e) {
				e.printStackTrace();
			}			
		}

	}

	private void sendCaptureEndEvent() throws IOException {
		ClientHttpRequest chr = new ClientHttpRequest(conn);
		chr.setParameter("room", room);
		
		chr.setParameter("event", CaptureEvents.CAPTURE_END.getEvent());
		chr.post();
	}
	
	public void send(ByteArrayOutputStream changedTile, boolean isKeyFrame) {
		if (openConnection()) {
//			try {
//				sendTile(changedTile);		
//			} catch (IOException e) {
//				e.printStackTrace();
//			} finally {
				// We need to clear the tile to prevent running out
				// of memory. (ralam Sept 5, 2009)
//				changedTile.imageSent();
//			}			
		}
	}
	
	private void sendTile(Tile changedTile) throws IOException {
	    ClientHttpRequest chr = new ClientHttpRequest(conn);
	    chr.setParameter("room", room);
	    
	    String tileInfo = Integer.toString(changedTile.getWidth())
							+ "x" + Integer.toString(changedTile.getHeight())
							+ "x" + Integer.toString(changedTile.getX())
							+ "x" + Integer.toString(changedTile.getY())
							+ "x" + Integer.toString(changedTile.getTilePosition());
	    
	    chr.setParameter("tileInfo", tileInfo);
	    chr.setParameter("event", CaptureEvents.CAPTURE_UPDATE.getEvent());
	    
	    ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
//		ImageIO.write(changedTile.getImage(), "png", byteConvert);
		byte[] imageData = byteConvert.toByteArray();
		ByteArrayInputStream cap = new ByteArrayInputStream(imageData);
			
		chr.setParameter("tile", "screen", cap);
		System.out.println("Image length = " + imageData.length);
		
		chr.post();		
	}
}

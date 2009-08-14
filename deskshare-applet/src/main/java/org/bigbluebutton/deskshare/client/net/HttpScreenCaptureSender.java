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

import javax.imageio.ImageIO;

import org.bigbluebutton.deskshare.client.IScreenCaptureSender;

import com.myjavatools.web.ClientHttpRequest;

public class HttpScreenCaptureSender implements IScreenCaptureSender {
	private String host = "localhost";
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	private String servletName = "deskshare/sample/showslides";
	private URL url;
	private String videoInfo;
	private boolean startCapture = true;
	
	public void connect(String host, String room, int videoWidth,
			int videoHeight, int frameRate) {
		this.host = host;
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		
		videoInfo = Integer.toString(videoWidth)
				+ "x" + Integer.toString(videoHeight)
				+ "x" + Integer.toString(frameRate);
	}

	public void disconnect() {
		// TODO Auto-generated method stub

	}

	public void send(BufferedImage screenCapture) {
		try {

	    URL url = new URL("http://" + host + "/deskshare/tunnel/screen");
	    URLConnection conn = url.openConnection();
	    ClientHttpRequest chr = new ClientHttpRequest(conn);
	    chr.setParameter("room", room);
	    chr.setParameter("videoInfo", videoInfo);
	    chr.setParameter("startCapture", new Boolean(startCapture).toString());
		System.out.println("Start capture = " + startCapture);
		
	    if (startCapture) {
	    	startCapture = false;
	    }
	    
	    ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
		ImageIO.write(screenCapture, "jpeg", byteConvert);
		byte[] imageData = byteConvert.toByteArray();
		ByteArrayInputStream cap = new ByteArrayInputStream(imageData);
			
		chr.setParameter("upload", "screen", cap);
		System.out.println("Image length = " + imageData.length);
		
		chr.post();
		
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}


}

/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.client.net;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import org.bigbluebutton.deskshare.client.encoder.FlvEncodeException;
import org.bigbluebutton.deskshare.client.encoder.ScreenVideoFlvEncoder;

public class FileScreenCaptureSender implements ScreenCaptureSender {

	private FileOutputStream fo;
	private ScreenVideoFlvEncoder svf = new ScreenVideoFlvEncoder();
	
	public void connect(String host, String room, int width, int height) throws ConnectionException {
    	try {
			fo = new FileOutputStream("D://temp/"+"ScreenVideo.flv");
			
			fo.write(svf.encodeHeader());
		} catch (Exception e) {
			e.printStackTrace();
			throw new ConnectionException("Failed to open file.");
		}
	}

	public void disconnect() throws ConnectionException {
    	try {
    		System.out.println("Closing stream");
			fo.close();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("Fail to clode file.");
		}
	}

	public void send(ByteArrayOutputStream videoData, boolean isKeyFrame) throws ConnectionException {
		try {
			fo.write(svf.encodeFlvData(videoData));
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("Fail to write to file.");
		} catch (FlvEncodeException e) {
			e.printStackTrace();
			throw new ConnectionException("Fail to encode FLV.");
		}
	}

}

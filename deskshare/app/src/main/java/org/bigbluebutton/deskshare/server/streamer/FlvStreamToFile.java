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
package org.bigbluebutton.deskshare.server.streamer;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.deskshare.server.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.server.IDeskShareStream;
import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.slf4j.Logger;

public class FlvStreamToFile implements IDeskShareStream {
	final private Logger log = Red5LoggerFactory.getLogger(FlvStreamToFile.class, "deskshare");
	private BlockingQueue<CaptureUpdateEvent> screenQueue = new LinkedBlockingQueue<CaptureUpdateEvent>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;

	private FileOutputStream fo;
	private ScreenVideoFlvEncoder svf = new ScreenVideoFlvEncoder();
	
	private String flvFilename = "/tmp/screenvideo.flv";
	
	public void accept(CaptureUpdateEvent event) {
		// Make a copy so we can process safely on our own thread.
		CaptureUpdateEvent copy = CaptureUpdateEvent.copy(event);
		try {
			screenQueue.put(copy);
		} catch (InterruptedException e) {
			log.warn("InterruptedException while putting event into queue.");
		}
	}

	public int getHeight() {
		// TODO Auto-generated method stub
		return 0;
	}

	public IScope getScope() {
		// TODO Auto-generated method stub
		return null;
	}

	public int getWidth() {
		// TODO Auto-generated method stub
		return 0;
	}

	public void stream(ScreenVideoFrame frame) {}
	
	public void start() {
		try {
			fo = new FileOutputStream(flvFilename);
			fo.write(svf.encodeHeader());
		} catch (FileNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		sendCapturedScreen = true;
		System.out.println("Starting stream");
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						System.out.println("ScreenQueue size " + screenQueue.size());
						CaptureUpdateEvent newScreen = screenQueue.take();
						sendCapturedScreen(newScreen);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);
	}

	private void sendCapturedScreen(CaptureUpdateEvent event) {
		System.out.println("Sending screen captured - built aug 20 12:39PM");
		try {
			byte[] data = svf.encodeFlvData(event.getData().array());
			fo.write(data);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FlvEncodeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
	
	public void stop() {
    	try {
    		System.out.println("Closing stream");
			fo.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void setFlvFilename(String filename) {
		flvFilename = filename;
	}
}

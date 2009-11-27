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

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.deskshare.server.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.server.IDeskShareStream;
import org.bigbluebutton.deskshare.server.ScreenVideoBroadcastStream;
import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;


/**
 * The DeskShareStream class publishes captured video to a red5 stream.
 * @author Snap
 *
 */
public class DeskShareStream  implements IDeskShareStream {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareStream.class, "deskshare");
	
	private BlockingQueue<CaptureUpdateEvent> screenQueue = new LinkedBlockingQueue<CaptureUpdateEvent>(10);
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;
	
	private ScreenVideoBroadcastStream broadcastStream;
	
	private long timestamp = 0, frameNumber = 0;
	private int width, height, timestampBase;
	private String outStreamName;
	private IScope scope;
	
	public static final int LARGER_DIMENSION = 1280;

	
	/**
	 * The default constructor
	 * The stream which gets published by the streamer has the same name as the scope. One stream allowed per room
	 */
	public DeskShareStream(IScope scope, String streamName, int width, int height) {
		this.scope = scope;
		scope.setName(streamName);
		this.outStreamName = streamName;
		this.width = width;
		this.height = height;		
	}
	
	public void stop() {
		sendCapturedScreen = false;
		streamEnded();
	}
	
	public void start() {
		startPublishing(scope);
		sendCapturedScreen = true;
		System.out.println("DeskShareStream Starting stream " + outStreamName);
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
//						System.out.println("ScreenQueue size " + screenQueue.size());						
						CaptureUpdateEvent newScreen = screenQueue.take();
						if (screenQueue.size() > 9) screenQueue.clear();
						sendCapturedScreen(newScreen);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);
	}
	
	public void stream(ScreenVideoFrame frame) {}
	
	public void accept(CaptureUpdateEvent event) {
		// Make a copy so we can process safely on our own thread.
		CaptureUpdateEvent copy = CaptureUpdateEvent.copy(event);
		try {
			screenQueue.put(copy);
		} catch (InterruptedException e) {
			log.warn("InterruptedException while putting event into queue.");
		}
	}
	
	private void sendCapturedScreen(CaptureUpdateEvent event) {
		long now = System.currentTimeMillis();
		if ((now - event.getTimestamp()) > 3000) {
			System.out.println("Discarding stale update event");
			return;
		}
		
		long startRx = System.currentTimeMillis();		
//		System.out.println("Sending " + event.getData().remaining() + " " 
//				+ event.getData().capacity() + " " + event.getData().position() + " to stream");
		VideoData data = new VideoData(event.getData());
		broadcastStream.dispatchEvent(data);
		data.release();
		long completeRx = System.currentTimeMillis();
//		System.out.println("Send took " + (completeRx - startRx) + "ms.");
	}

	private void streamEnded() {
		broadcastStream.stop();
	    broadcastStream.close();
	    log.debug("stopping and closing stream {}", outStreamName);
	}
	
	/**
	 * Starts outputting captured video to a red5 stream
	 * @param aScope
	 */
	synchronized private void startPublishing(IScope aScope){
		System.out.println("started publishing stream in " + aScope.getName());

		broadcastStream = new ScreenVideoBroadcastStream(outStreamName);
		broadcastStream.setPublishedName(outStreamName);
		broadcastStream.setScope(aScope);
		
		IContext context = aScope.getContext();
		
		IProviderService providerService = (IProviderService) context.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(aScope, outStreamName, broadcastStream)){
			IBroadcastScope bScope = (BroadcastScope) providerService.getLiveProviderInput(aScope, outStreamName, true);
			
			bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, broadcastStream);
		} else{
			log.error("could not register broadcast stream");
			throw new RuntimeException("could not register broadcast stream");
		}
	    
	    broadcastStream.start();
	}
		
	public int getWidth() {
		return width;
	}
	
	public int getHeight() {
		return height;
	}
	
	public IScope getScope() {
		return scope;
	}

}

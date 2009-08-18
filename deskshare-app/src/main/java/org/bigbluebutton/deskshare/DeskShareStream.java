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
package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

import com.xuggle.red5.io.BroadcastStream;
import com.xuggle.red5.io.IRTMPEventIOHandler;
import com.xuggle.red5.io.Red5HandlerFactory;
import com.xuggle.red5.io.Red5Message;
import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IContainerFormat;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IPixelFormat;
import com.xuggle.xuggler.IRational;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.SimpleMediaFile;
import com.xuggle.xuggler.video.ConverterFactory;
import com.xuggle.xuggler.video.IConverter;

/**
 * The DeskShareStream class publishes captured video to a red5 stream.
 * @author Snap
 *
 */
public class DeskShareStream {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareStream.class, "deskshare");
	
	private BlockingQueue<CaptureUpdateEvent> queue = new LinkedBlockingQueue<CaptureUpdateEvent>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable eventHandler;
	private volatile boolean handleEvent = false;
	
	private IStreamCoder outStreamCoder;
	private BroadcastStream broadcastStream;
	private IContainer outContainer;
	private IStream outStream;
	private ImageProcessor imageProcessor;
	
	private static final Red5HandlerFactory factory = Red5HandlerFactory.getFactory();
	private final IRTMPEventIOHandler outputHandler;
	
	private long timestamp = 0, frameNumber = 0;
	private int width, height, frameRate, timestampBase;
	private String outStreamName;
	private IScope scope;
	
	/**
	 * The default constructor
	 * The stream which gets published by the streamer has the same name as the scope. One stream allowed per room
	 */
	public DeskShareStream(IScope scope, String streamName, int width, int height, int frameRate){
		this.scope = scope;
		scope.setName(streamName);
		this.outStreamName = streamName;
		this.width = width;
		this.height = height;
		this.frameRate = frameRate;
		this.timestampBase = 1000000 / this.frameRate;
		this.imageProcessor = new ImageProcessor(width, height);
		
		outputHandler = new IRTMPEventIOHandler(){
			public Red5Message read() throws InterruptedException{
				return null;
			}
			
			public void write(Red5Message message) throws InterruptedException{
				log.debug("Handler writing message to stream " + outStreamName);
				try{
					IRTMPEvent event = message.getData();
					if (event != null){
						broadcastStream.dispatchEvent(event);
						event.release();
					}
				} finally{
					
				}
			}
		};
		
	}

	public void stop() {
		handleEvent = false;
		streamEnded();
	}
	
	public void start() {
		startPublishing(scope);
		setupStreams();
		handleEvent = true;
		log.debug("Starting stream {}", outStreamName);
		eventHandler = new Runnable() {
			public void run() {
				while (handleEvent) {
					try {
						CaptureUpdateEvent event = queue.take();
						handleCaptureEvent(event);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(eventHandler);
	}
	
	private void handleCaptureEvent(CaptureUpdateEvent event) {
		BufferedImage image = event.getScreen();
		imageProcessor.appendTile(image, event.getX(), event.getY());
		imageReceived(imageProcessor.getImage());
	}
	
	public void accept(CaptureUpdateEvent event) {
		try {
			queue.put(event);
		} catch (InterruptedException e) {
			log.warn("InterruptedException while putting event into queue.");
		}
	}
	
	private void imageReceived(BufferedImage image) {
		IPacket packet = IPacket.make();

		IConverter converter = null;
		try{
			converter = ConverterFactory.createConverter(image, IPixelFormat.Type.YUV420P);
		} catch(UnsupportedOperationException e){
			log.error("could not create converter");
		}
		IVideoPicture outFrame = converter.toPicture(image, timestamp);
		timestamp += timestampBase;
		frameNumber ++;

		outFrame.setQuality(0);
		int retval = outStreamCoder.encodeVideo(packet, outFrame, 0);
		if (retval < 0)
			throw new RuntimeException("could not encode video");
		if (packet.isComplete()){
			retval = outContainer.writePacket(packet, false);
			if (retval < 0)
				throw new RuntimeException("could not save packet to container");
		}
		outFrame.delete();
		outFrame = null;
		converter = null;
	}

	private void streamEnded() {
		broadcastStream.stop();
	    broadcastStream.close();
		int retval = outContainer.writeTrailer();
	    if (retval < 0)
	      throw new RuntimeException("Could not write trailer to output file");
	    log.debug("stopping and closing stream {}", outStreamName);
	}
	
	/**
	 * Starts outputting captured video to a red5 stream
	 * @param aScope
	 */
	synchronized private void startPublishing(IScope aScope){
		log.debug("started publishing stream in " + aScope.getName());

		broadcastStream = new BroadcastStream(outStreamName);
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
	
	/**
	 * Sets up Xuggler containers & streams
	 */
	private void setupStreams(){
		log.debug("Setting up streams: {}", broadcastStream.getName());
		String outputURL = Red5HandlerFactory.DEFAULT_PROTOCOL +":"+ broadcastStream.getName();
		
		ICodec videoCodec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_FLV1);
		
		ISimpleMediaFile outInfo = new SimpleMediaFile();
		outInfo.setURL(outputURL);
		outInfo.setHasVideo(true);
		outInfo.setHasAudio(false);
		outInfo.setVideoWidth(width);
		outInfo.setVideoHeight(height);
		outInfo.setVideoBitRate(DeskShareConstants.BIT_RATE);
		outInfo.setVideoPixelFormat(IPixelFormat.Type.YUV420P);
		outInfo.setVideoNumPicturesInGroupOfPictures(DeskShareConstants.NUM_PICTURES_IN_GROUP);
		outInfo.setVideoCodec(ICodec.ID.CODEC_ID_FLV1);
		outInfo.setVideoGlobalQuality(0);
		
		factory.registerStream(outputHandler, outInfo);
		
		outContainer = IContainer.make();
		IContainerFormat outFormat = IContainerFormat.make();
		outFormat.setOutputFormat("flv", outputURL, null);
		int retval = outContainer.open(outputURL, IContainer.Type.WRITE, outFormat);
		if (retval <0){
			log.error("could not open output container");
			throw new RuntimeException("could not open output file");
		}
		log.debug("Output container is open.");
		outStream = outContainer.addNewStream(0);
		outStreamCoder = outStream.getStreamCoder();

		outStreamCoder.setNumPicturesInGroupOfPictures(DeskShareConstants.NUM_PICTURES_IN_GROUP);
		outStreamCoder.setCodec(videoCodec);
		outStreamCoder.setBitRate(DeskShareConstants.BIT_RATE);
		outStreamCoder.setBitRateTolerance(DeskShareConstants.BIT_RATE_TOLERANCE);

		outStreamCoder.setPixelType(IPixelFormat.Type.YUV420P);
		outStreamCoder.setHeight(height);
		outStreamCoder.setWidth(width);
		outStreamCoder.setFlag(IStreamCoder.Flags.FLAG_QSCALE, true);
		outStreamCoder.setGlobalQuality(0);

		IRational frameRate = IRational.make(this.frameRate,1);
		outStreamCoder.setFrameRate(frameRate);
		IRational timeBase = IRational.make(frameRate.getDenominator(), frameRate.getNumerator());
		outStreamCoder.setTimeBase(timeBase);
		frameRate = null;

		retval = outStreamCoder.open();
		if (retval <0)
			throw new RuntimeException("could not open input decoder");
		retval = outContainer.writeHeader();
		if (retval <0) {
			log.error("could not write file header");
			throw new RuntimeException("could not write file header");
		}		
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

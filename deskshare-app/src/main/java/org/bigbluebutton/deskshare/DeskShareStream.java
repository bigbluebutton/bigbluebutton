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
import java.io.File;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import javax.imageio.ImageIO;

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
import com.xuggle.xuggler.IVideoResampler;
import com.xuggle.xuggler.SimpleMediaFile;
import com.xuggle.xuggler.video.ConverterFactory;
import com.xuggle.xuggler.video.IConverter;

/**
 * The DeskShareStream class publishes captured video to a red5 stream.
 * @author Snap
 *
 */
public class DeskShareStream implements NewScreenListener {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareStream.class, "deskshare");
	
	private BlockingQueue<BufferedImage> screenQueue = new LinkedBlockingQueue<BufferedImage>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;
	
	private IStreamCoder outStreamCoder;
	private BroadcastStream broadcastStream;
	private IContainer outContainer;
	private IStream outStream;
	private ChangedTileProcessor changedTileProcessor;
	
	private static final Red5HandlerFactory factory = Red5HandlerFactory.getFactory();
	private final IRTMPEventIOHandler outputHandler;
	
	private long timestamp = 0, frameNumber = 0;
	private int width, height, frameRate, timestampBase;
	private int encodingWidth, encodingHeight;
	private String outStreamName;
	private IScope scope;
	
	public static final int LARGER_DIMENSION = 1280;

	
	/**
	 * The default constructor
	 * The stream which gets published by the streamer has the same name as the scope. One stream allowed per room
	 */
	public DeskShareStream(IScope scope, String streamName, int width, int height, int frameRate) {
		this.scope = scope;
		scope.setName(streamName);
		this.outStreamName = streamName;
		this.width = width;
		this.height = height;
		this.frameRate = frameRate;
		this.timestampBase = 1000000 / this.frameRate;
		this.changedTileProcessor = new ChangedTileProcessor(width, height);
		//encodingHeight = 500;
		//encodingWidth = 800;
		calculateEncodingDimensions();
		
		changedTileProcessor.addNewScreenListener(this);		
		changedTileProcessor.start();
				
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
	
	/**
	 * Calculates the dimensions of the encoded video, in case the video is too large and needs to be scaled
	 */
	public void calculateEncodingDimensions(){
		if (width < LARGER_DIMENSION && height< LARGER_DIMENSION){
			encodingHeight = height;
			encodingWidth = width;
			return;
		}
		
		int biggerDimension, smallerDimension;
		double ratio;
		if (width > height){
			biggerDimension = width;
			smallerDimension = height;
		} else{
			biggerDimension = height;
			smallerDimension = width;
		}
		ratio = (double)biggerDimension/(double)smallerDimension;
		System.out.println("ration = " + ratio);
		
		if (width > height){
			encodingWidth = LARGER_DIMENSION;
			encodingHeight = (int) Math.round(LARGER_DIMENSION/ratio);
		} else{
			encodingHeight = LARGER_DIMENSION;
			encodingWidth = (int) Math.round(LARGER_DIMENSION/ratio);
		}
		//System.out.println("widht: " + encodingWidth + " ,height: " + encodingHeight);
	}

	public void stop() {
		sendCapturedScreen = false;
		streamEnded();
		changedTileProcessor.stop();
	}
	
	public void start() {
		startPublishing(scope);
		setupStreams();
		sendCapturedScreen = true;
		log.debug("Starting stream {}", outStreamName);
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						log.debug("ScreenQueue size " + screenQueue.size());
						BufferedImage newScreen = screenQueue.take();
						sendCapturedScreen(newScreen);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);
	}
		
	public void accept(CaptureUpdateEvent event) {
		changedTileProcessor.accept(event);
	}
	
	private void sendCapturedScreen(BufferedImage screen) {
		log.debug("Sending screen captured - built aug 20 12:39PM");
//		try {
//			ImageIO.write(screen, "jpg", new File("/tmp/partil.jpg"));
//		} catch (IOException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
		
		IPacket packet = IPacket.make();

		IConverter converter = null;
		IVideoResampler resampler = IVideoResampler.make(encodingWidth, encodingHeight, IPixelFormat.Type.YUV420P, 
				width, height, IPixelFormat.Type.BGR24);
		try{
			converter = ConverterFactory.createConverter(screen, IPixelFormat.Type.BGR24);
		} catch(UnsupportedOperationException e){
			log.error("could not create converter");
		}

//		IConverter converter = new BbbPicConverter(IPixelFormat.Type.YUV420P, screen.getWidth(), screen.getHeight(), screen.getWidth(), screen.getHeight());
		IVideoPicture inFrame = converter.toPicture(screen, timestamp);
		IVideoPicture outFrame = IVideoPicture.make(IPixelFormat.Type.YUV420P, encodingWidth, encodingHeight);
		resampler.resample(outFrame, inFrame);
		log.debug(outFrame.getPixelType().toString());
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
		outInfo.setVideoWidth(encodingWidth);
		outInfo.setVideoHeight(encodingHeight);
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
		outStreamCoder.setHeight(encodingHeight);
		outStreamCoder.setWidth(encodingWidth);
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
		return encodingWidth;
	}
	
	public int getHeight() {
		return encodingHeight;
	}
	
	public IScope getScope() {
		return scope;
	}

	@Override
	public void onNewScreen(BufferedImage newScreen) {
		try {
			screenQueue.put(newScreen);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

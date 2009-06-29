package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;

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
 * The Red5Streamer class publishes captured video to a red5 stream.
 * @author Snap
 *
 */
public class Red5Streamer implements IImageListener {
	
	private IStreamCoder outStreamCoder;
	private BroadcastStream broadcastStream;
	private IContainer outContainer;
	private IStream outStream;
	
	private static final Red5HandlerFactory factory = Red5HandlerFactory.getFactory();
	private final IRTMPEventIOHandler outputHandler;
	final private Logger log = Red5LoggerFactory.getLogger(Red5Streamer.class, "deskshare");
	
	private long timestamp = 0, frameNumber = 0;
	private int width, height, frameRate, timestampBase;
	private String outStreamName;
	/**
	 * The default constructor
	 * The stream which gets published by the streamer has the same name as the scope. One stream allowed per room
	 */
	public Red5Streamer(IScope scope, String streamName, int width, int height, int frameRate){
		this.outStreamName = streamName;
		this.width = width;
		this.height = height;
		this.frameRate = frameRate;
		this.timestampBase = 1000000 / this.frameRate;
		
		outputHandler = new IRTMPEventIOHandler(){
			public Red5Message read() throws InterruptedException{
				return null;
			}
			
			public void write(Red5Message message) throws InterruptedException{
				System.out.println("Handler writing message to stream " + outStreamName);
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
		startPublishing(scope);
		setupStreams();
	}

	public void imageReceived(BufferedImage image) {
		IPacket packet = IPacket.make();

		IConverter converter = null;
		//BufferedImage image = capture.takeSingleSnapshot();
		try{
			converter = ConverterFactory.createConverter(image, IPixelFormat.Type.YUV420P);
		} catch(UnsupportedOperationException e){
			System.out.println("could not create converter");
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

	public void streamEnded(String streamName) {
		broadcastStream.stop();
	    broadcastStream.close();
		int retval = outContainer.writeTrailer();
	    if (retval < 0)
	      throw new RuntimeException("Could not write trailer to output file");
	    System.out.println("stopping and closing stream" + outStreamName);
	}
	
	/**
	 * Starts outputting captured video to a red5 stream
	 * @param aScope
	 */
	synchronized private void startPublishing(IScope aScope){
		log.debug("started publishing stream in " + aScope.getName());
		System.out.println("started publishing stream in " + aScope.getName());
		
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
		System.out.println("In setupStreams");
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
			System.out.println("could not open output container");
			throw new RuntimeException("could not open output file");
		}
		System.out.println("Output container is open.");
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
		if (retval <0)
			throw new RuntimeException("could not write file header");
		else System.out.println("Header written");
		
	}
	
	
}

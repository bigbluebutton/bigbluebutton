package xugglerutils;

import java.awt.image.BufferedImage;

import org.bigbluebutton.app.video.VideoAppConstants;
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

public class JoinedStream {
	final private Logger log = Red5LoggerFactory.getLogger(JoinedStream.class, "deskshare");
	
	private IStreamCoder outStreamCoder;
	private BroadcastStream broadcastStream;
	private IContainer outContainer;
	private IStream outStream;
	private CheckerboardProcessor imageProcessor;
	
	private static final Red5HandlerFactory factory = Red5HandlerFactory.getFactory();
	private final IRTMPEventIOHandler outputHandler;
	private Runnable pictureSender;
	private boolean keepStreaming = false;
	
	private long timestamp = 0, frameNumber = 0;
	private int width, height, frameRate, timestampBase;
	private int encodingWidth, encodingHeight;
	private String outStreamName;
	private IScope scope;
	
	public JoinedStream(IScope scope, String streamName, int width, int height, int frameRate){
		this.scope = scope;
		this.outStreamName = streamName;
		this.width = width;
		this.height = height;
		this.frameRate = frameRate;
		this.timestampBase = 1000000 / this.frameRate;
		this.imageProcessor = new CheckerboardProcessor();
		
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
	
	public void start(){
		startPublishing(scope);
		setupStreams();
		pictureSender = new Runnable() {
			public void run(){
				while(keepStreaming){
					encodePicture(imageProcessor.getImage());
				}
			}
		};
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
	
	private void encodePicture(BufferedImage screen) {
		IPacket packet = IPacket.make();

		IConverter converter = null;
		IVideoResampler resampler = IVideoResampler.make(encodingWidth, encodingHeight, IPixelFormat.Type.YUV420P, 
				width, height, IPixelFormat.Type.BGR24);
		try{
			converter = ConverterFactory.createConverter(screen, IPixelFormat.Type.BGR24);
		} catch(UnsupportedOperationException e){
			log.error("could not create converter");
		}

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
		outInfo.setVideoBitRate(VideoAppConstants.BIT_RATE);
		outInfo.setVideoPixelFormat(IPixelFormat.Type.YUV420P);
		outInfo.setVideoNumPicturesInGroupOfPictures(VideoAppConstants.NUM_PICTURES_IN_GROUP);
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

		outStreamCoder.setNumPicturesInGroupOfPictures(VideoAppConstants.NUM_PICTURES_IN_GROUP);
		outStreamCoder.setCodec(videoCodec);
		outStreamCoder.setBitRate(VideoAppConstants.BIT_RATE);
		outStreamCoder.setBitRateTolerance(VideoAppConstants.BIT_RATE_TOLERANCE);

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
	
	public IScope getScope() {
		return scope;
	}
}

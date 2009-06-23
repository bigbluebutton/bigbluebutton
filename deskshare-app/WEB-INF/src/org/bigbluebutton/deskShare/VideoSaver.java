package org.bigbluebutton.deskShare;

import java.awt.image.BufferedImage;

import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IContainerFormat;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IRational;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IPixelFormat;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.SimpleMediaFile;
import com.xuggle.xuggler.video.ConverterFactory;
import com.xuggle.xuggler.video.IConverter;

/**
 * The VideoSaver class saves received Images to an flv file on the server, in case we want to record
 * the screencast
 * @author Snap
 *
 */
public class VideoSaver implements IImageListener {
	
	private IContainer outContainer;
	private IStream outStream;
	private IStreamCoder outStreamCoder;
	
	private String fileName;
	private int width, height;
	
	private long timestamp;
	
	/**
	 * The default constructor.
	 * @param fileName - The filename of the file to which you wish to save. should end with .flv
	 */
	public VideoSaver(String fileName, int width, int height){
		this.fileName = fileName;
		this.width = width;
		this.height = height;
		//setupStreams();
		setupStreams2();
	}

	@Override
	public void imageReceived(BufferedImage image) {
		IPacket packet = IPacket.make();
		
		IConverter converter = null;
		try{
			converter = ConverterFactory.createConverter(image, IPixelFormat.Type.BGR24);
		} catch(UnsupportedOperationException e){
			System.out.println("could not create converter");
		}
		IVideoPicture outFrame = converter.toPicture(image, timestamp);
		timestamp += 333000;
		
		outFrame.setQuality(0);
		int retval = outStreamCoder.encodeVideo(packet, outFrame, 0);
		if (retval < 0)
			throw new RuntimeException("could not encode video");
		if (packet.isComplete()){
			retval = outContainer.writePacket(packet);
			if (retval < 0)
				throw new RuntimeException("could not save packet to continer");
		}
	}
	
	/**
	 * Housekeeping needed to get everything working
	 */
	/*private void setupStreams(){
		timestamp = 0;
		
		outContainer = IContainer.make();
		
		int retval = outContainer.open(fileName, IContainer.Type.WRITE, null);
		if (retval <0)
			throw new RuntimeException("could not open output file");
		
		outStream = outContainer.addNewStream(0);
		outStreamCoder = outStream.getStreamCoder();
		
		ICodec codec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_FLV1);
		
		outStreamCoder.setCodec(codec);
		outStreamCoder.setBitRate(DeskShareConstants.BIT_RATE);
		outStreamCoder.setBitRateTolerance(DeskShareConstants.BIT_RATE_TOLERANCE);
		
		outStreamCoder.setPixelType(IPixelFormat.Type.YUV420P);
		outStreamCoder.setHeight(height);
		outStreamCoder.setWidth(width);
		outStreamCoder.setFlag(IStreamCoder.Flags.FLAG_QSCALE, true);
		outStreamCoder.setGlobalQuality(0);
		
		IRational frameRate = IRational.make(3,1);
		outStreamCoder.setFrameRate(frameRate);
		outStreamCoder.setTimeBase(IRational.make(frameRate.getDenominator(), frameRate.getNumerator()));
		frameRate = null;
		
		retval = outStreamCoder.open();
		if (retval <0)
			throw new RuntimeException("could not open input decoder");
		retval = outContainer.writeHeader();
		if (retval <0)
			throw new RuntimeException("could not write file header");
	}*/
	
	private void setupStreams2(){
		System.out.println("In setupStreams");
		
		ICodec videoCodec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_FLV1);
		
		ISimpleMediaFile outInfo = new SimpleMediaFile();
		outInfo.setURL(fileName);
		outInfo.setHasVideo(true);
		outInfo.setHasAudio(false);
		outInfo.setVideoWidth(width);
		outInfo.setVideoHeight(height);
		outInfo.setVideoBitRate(DeskShareConstants.BIT_RATE);
		outInfo.setVideoPixelFormat(IPixelFormat.Type.YUV420P);
		outInfo.setVideoNumPicturesInGroupOfPictures(DeskShareConstants.NUM_PICTURES_IN_GROUP);
		outInfo.setVideoCodec(ICodec.ID.CODEC_ID_FLV1);
		outInfo.setVideoGlobalQuality(0);
		
		outContainer = IContainer.make();
		IContainerFormat outFormat = IContainerFormat.make();
		outFormat.setOutputFormat("flv", fileName, null);
		int retval = outContainer.open(fileName, IContainer.Type.WRITE, outFormat);
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

		IRational frameRate = IRational.make(3,1);
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

	@Override
	public void streamEnded(String streamName) {
		int retval = outContainer.writeTrailer();
	    if (retval < 0)
	      throw new RuntimeException("Could not write trailer to output file");
	}
	
}

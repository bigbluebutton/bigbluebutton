package tests;
import java.awt.image.BufferedImage;

import com.xuggle.xuggler.Global;
import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IPixelFormat;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.IVideoResampler;
import com.xuggle.xuggler.Utils;
import com.xuggle.xuggler.demos.VideoImage;


public class InfoGetter {
	public static void main(String[] args){
		if (args.length <= 0)
			throw new IllegalArgumentException("no filename given");
		
		String filename = args[0];
		
		if (!IVideoResampler.isSupported(IVideoResampler.Feature.FEATURE_COLORSPACECONVERSION))
			throw new RuntimeException("you must have the GPL Xuggler for this to work");
		
		IContainer container = IContainer.make();
		
		if (container.open(filename, IContainer.Type.READ, null) < 0)
			throw new IllegalArgumentException("could not open file");
		
		int numStreams = container.getNumStreams();
		
		int videoStreamId = -1;
		IStreamCoder videoCoder = null;
		for (int i = 0; i<numStreams; i++){
			IStream stream = container.getStream(i);
			IStreamCoder coder = stream.getStreamCoder();
			
			if (coder.getCodecType() == ICodec.Type.CODEC_TYPE_VIDEO){
				videoStreamId = 1;
				videoCoder = coder;
				break;
			}
		}
		if (videoStreamId == -1)
			throw new RuntimeException("could not find video stream");
		
		if (videoCoder.open() < 0)
			throw new RuntimeException("could not create color space resampler");
		
		IVideoResampler resampler = null;
		if (videoCoder.getPixelType() != IPixelFormat.Type.BGR24){
			resampler = IVideoResampler.make(videoCoder.getWidth(), videoCoder.getHeight(),
					IPixelFormat.Type.BGR24, videoCoder.getWidth(), videoCoder.getHeight(), 
					videoCoder.getPixelType());
			if (resampler == null)
				throw new RuntimeException("could not create color space");
		}
		
		//openJavaWindow();
		
		IPacket packet = IPacket.make();
		long firstTimestampInStream = Global.NO_PTS;
		long systemClockStartTime = 0;
		while(container.readNextPacket(packet) >= 0){
			if (packet.getStreamIndex() == videoStreamId){
				IVideoPicture picture = IVideoPicture.make(videoCoder.getPixelType(), 
						videoCoder.getWidth(), videoCoder.getHeight());
				
				int offset = 0;
				while(offset <packet.getSize()){
					int bytesDecoded = videoCoder.decodeVideo(picture, packet, offset);
					if (bytesDecoded < 0)
						throw new RuntimeException("got error decoding");
					offset += bytesDecoded;
					
					if (picture.isComplete()){
						IVideoPicture newPic = picture;
						
						if (resampler != null){
							newPic = IVideoPicture.make(resampler.getOutputPixelFormat(),
									picture.getWidth(), picture.getHeight());
							if (resampler.resample(newPic, picture) < 0)
								throw new RuntimeException("could not resample video");
						}
						if (newPic.getPixelType() != IPixelFormat.Type.BGR24)
							throw new RuntimeException("could not decode video");
						
						if (firstTimestampInStream == Global.NO_PTS){
							firstTimestampInStream = picture.getTimeStamp();
							
							systemClockStartTime = System.currentTimeMillis();
						} else {
							long systemClockCurrentTime = System.currentTimeMillis();
							long millisecondsClockTimeSinceStartofVideo = systemClockCurrentTime - systemClockStartTime;
							long millisecondsStreamSinceStartofVideo = (picture.getTimeStamp() - firstTimestampInStream);
							final long millisecondsTolerance = 50;
							final long millisecondsToSleep = (millisecondsStreamSinceStartofVideo -
									millisecondsClockTimeSinceStartofVideo + millisecondsTolerance);
							if (millisecondsToSleep > 0){
								try{
									Thread.sleep(millisecondsToSleep);
								} catch(InterruptedException e){
									return;
								}
							}
						}
						
						BufferedImage javaImage = Utils.videoPictureToImage(newPic);
						
						//updateJavaWindow(javaImage);
					}
				}
			}
		}
		//closeJavaWindow();
	}
	
	private static VideoImage mScreen;
	
	private static void openJavaWindow(){
		mScreen = new VideoImage();
	}
	
	private static void updateJavaWindow(BufferedImage javaImage){
		mScreen.setImage(javaImage);
	}
	
	private static void closeJavaWindow(){
		System.exit(0);
	}
}

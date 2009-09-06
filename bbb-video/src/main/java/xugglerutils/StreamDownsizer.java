package xugglerutils;

import java.awt.image.BufferedImage;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.app.video.VideoAppConstants;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.api.stream.IStreamPacket;
import org.slf4j.Logger;

import com.xuggle.red5.IPacketListener;
import com.xuggle.red5.IVideoPictureListener;
import com.xuggle.red5.io.Red5HandlerFactory;
import com.xuggle.red5.io.Red5Message;
import com.xuggle.red5.io.Red5StreamingQueue;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IContainerFormat;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.IVideoResampler;
import com.xuggle.xuggler.SimpleMediaFile;

public class StreamDownsizer implements IImageProvider, Runnable {

	final private Logger log = Red5LoggerFactory.getLogger(this.getClass());
	final static private Red5HandlerFactory red5Factory = Red5HandlerFactory.getFactory();

	private IBroadcastStream inputStream;
	private IStreamListener inputListener;
	private Red5StreamingQueue inputQueue;

	private String inputURL;
	private IContainer inContainer;
	private IStreamCoder inCoder;
	private IVideoResampler resampler;

	private int videoStreamId;
	private boolean keepRunning = true;

	public StreamDownsizer(IBroadcastStream inputStream){

		this.inputStream = inputStream;
		this.inputQueue = new Red5StreamingQueue();

		this.videoStreamId = -1;

		inputListener = new IStreamListener(){
			public void packetReceived(IBroadcastStream aStream, IStreamPacket aPacket)
			{
				try {


					IoBuffer buf = aPacket.getData();
					if (buf != null)
						buf.rewind();
					if (buf==null || buf.remaining()==0)
					{
						log.debug("skipping empty packet with no data");
						return;
					}

					if (aPacket instanceof VideoData)
					{
						Red5Message.Type type = Red5Message.Type.INTERFRAME;
						VideoData dataPacket = (VideoData)aPacket;
						switch(dataPacket.getFrameType())
						{
						case DISPOSABLE_INTERFRAME:
							type = Red5Message.Type.DISPOSABLE_INTERFRAME;
							break;
						case INTERFRAME:
							type = Red5Message.Type.INTERFRAME;
							break;
						case KEYFRAME:
						case UNKNOWN:
							type = Red5Message.Type.KEY_FRAME;
							break;
						}
						if (type != Red5Message.Type.DISPOSABLE_INTERFRAME) // The FFMPEG FLV decoder doesn't handle disposable frames
						{
							log.debug("  adding packet type: {}; ts: {}; on stream: {}",
									new Object[]{dataPacket.getFrameType(), aPacket.getTimestamp(), aStream.getPublishedName()});
							inputQueue.put(new Red5Message(type, dataPacket));
						}
					} else if (aPacket instanceof IRTMPEvent)
					{
						log.debug("  adding packet type: {}; ts: {}; on stream: {}",
								new Object[]{"OTHER", aPacket.getTimestamp(), aStream.getPublishedName()});
						Red5Message.Type type = Red5Message.Type.OTHER;
						IRTMPEvent dataPacket = (IRTMPEvent)aPacket;
						inputQueue.put(new Red5Message(type, dataPacket));
					}
					else
					{
						log.debug("dropping packet type: {}; ts: {}; on stream: {}",
								new Object[]{"UNKNOWN", aPacket.getTimestamp(), aStream.getPublishedName()});
					}
				} catch (InterruptedException ex)
				{
					log.error("exception: {}", ex);
				} finally {
				}
			}

		};

	}

	private void openContainer()
	{
		try {
			// set out thread name
			String threadName = "Transcoder["+inputStream.getPublishedName()+"]";
			log.debug("Changing thread name: {}; to {};", Thread.currentThread().getName(), threadName);
			Thread.currentThread().setName(threadName);
			int retval = -1;

			// First let's setup our input URL
			{
				// Register a new listener; should hopefully start getting audio packets immediately
				log.debug("Adding packet listener to stream: {}", inputStream.getPublishedName());
				inputStream.addStreamListener(inputListener);

				// Tell AAFFMPEG about our new input URL; we use the unique Red5 names for the url
				inputURL = Red5HandlerFactory.DEFAULT_PROTOCOL+":"+inputStream.getName();
				ISimpleMediaFile inputInfo = new SimpleMediaFile();
				inputInfo.setURL(inputURL);
				red5Factory.registerStream(inputQueue, inputInfo);

				inContainer = IContainer.make();
				// NOTE: This will block until we get the later of the first audio if it has audio, or first video
				// if it has video
				log.debug("About to open input url: {}", inputURL);
				IContainerFormat inFormat = IContainerFormat.make();
				inFormat.setInputFormat("flv"); // set the input format to avoid FFMPEG probing
				retval = inContainer.open(inputURL, IContainer.Type.READ, inFormat, true, false);
				if (retval < 0)
				{
					throw new RuntimeException("Could not open input: " + inputURL);
				}
			}
		} finally {
		}

	}



	@Override
	public BufferedImage getImage() {
		// TODO Auto-generated method stub
		return null;
	}

	public void stop()
	{
		try
		{
			inputQueue.put(new Red5Message(Red5Message.Type.END_STREAM, null));
		}
		catch (InterruptedException e)
		{
			log.error("exception: {}", e);
		}
		keepRunning = false;
	}

	@Override
	public void run() {
		// TODO Auto-generated method stub
		try
		{
			openContainer();
			decode();
		}
		catch (Throwable e)
		{
			log.error("uncaught exception: " + e.getMessage());
			e.printStackTrace();
		}
		finally
		{
			//closeContainer();
		}

	}
	
	public void decode(){
		IPacket packet = IPacket.make();
		
		while(keepRunning){
			int ret = inContainer.readNextPacket(packet);
			if (ret<0) {
				log.debug("Container empty, stopping stream");
				keepRunning = false;
			}
			IVideoPicture resizedVideoPicture = resizeVideoPicture(packet);
		}
	}
	
	private IVideoPicture resizeVideoPicture(IPacket packet){
		IVideoPicture videoPicture = IVideoPicture.make(inCoder.getPixelType(), 
				inCoder.getWidth(), inCoder.getHeight());
		IVideoPicture resampledPicture = IVideoPicture.make(inCoder.getPixelType(), 
				VideoAppConstants.TILE_WIDTH, VideoAppConstants.TILE_HEIGHT);
		
		IVideoResampler resampler = IVideoResampler.make(VideoAppConstants.TILE_WIDTH, VideoAppConstants.TILE_HEIGHT,
				inCoder.getPixelType(), inCoder.getWidth(), inCoder.getHeight(), inCoder.getPixelType());
		
		resampler.resample(resampledPicture, videoPicture);
		
		return videoPicture;
	}


}

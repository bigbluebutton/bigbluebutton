package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

import com.xuggle.red5.IVideoPictureListener;
import com.xuggle.red5.Transcoder;
import com.xuggle.red5.VideoPictureListener;
import com.xuggle.red5.io.BroadcastStream;
import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.IVideoResampler;
import com.xuggle.xuggler.SimpleMediaFile;

public class VideoTranscoder {

	final private Logger log = Red5LoggerFactory.getLogger(this.getClass());

	final private Map<String, BroadcastStream> mOutputStreams = new HashMap<String, BroadcastStream>();
	final private Map<String, Transcoder> mTranscoders = new HashMap<String, Transcoder>();


	final private IVideoPictureListener pictureListener = new VideoPictureListener(){

		public IVideoPicture preEncode(IVideoPicture picture){
			IVideoPicture outPicture = IVideoPicture.make(picture.getPixelType(), 
					VideoAppConstants.TILE_WIDTH, VideoAppConstants.TILE_HEIGHT);

			IVideoResampler resampler = IVideoResampler.make(VideoAppConstants.TILE_WIDTH, 
					VideoAppConstants.TILE_HEIGHT, picture.getPixelType(), 
					picture.getWidth(), picture.getHeight(), picture.getPixelType());

			resampler.resample(outPicture, picture);

			return outPicture;
		}
	};

	public VideoTranscoder(){

	}

	/**
	 * Starts transcoding this stream.  This method is a no-op if
	 * this stream is already a stream copy created by this
	 * transcoder.
	 * @param aStream The stream to copy.
	 * @param aScope The application scope.
	 */
	synchronized public void startTranscodingStream(IBroadcastStream aStream, IScope aScope)
	{
		log.debug("startTranscodingStream({},{})", aStream.getPublishedName(), aScope.getName());
		if (aStream.getPublishedName().startsWith(VideoAppConstants.TILE_PREFIX))
		{
			log.debug("Not making a copy of a copy: {}", aStream.getPublishedName());
			return;
		}
		log.debug("Making transcoded version of: {}", aStream.getPublishedName());

		/*
		 * Now, we need to set up the output stream we want to broadcast to.
		 * Turns out aaffmpeg-red5 provides one of those.
		 */
		String outputName = VideoAppConstants.TILE_PREFIX+aStream.getPublishedName();
		BroadcastStream outputStream = new BroadcastStream(outputName);
		outputStream.setPublishedName(outputName);
		outputStream.setScope(aScope);

		IContext context = aScope.getContext();

		IProviderService providerService = (IProviderService) context
		.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(aScope, outputName,
				outputStream))
		{
			IBroadcastScope bsScope = (BroadcastScope) providerService
			.getLiveProviderInput(aScope, outputName, true);


			bsScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, outputStream);
		}
		else
		{
			log.error("Got a fatal error; could not register broadcast stream");
			throw new RuntimeException("fooey!");
		}
		mOutputStreams.put(aStream.getPublishedName(), outputStream);
		outputStream.start();

		/**
		 * Now let's give aaffmpeg-red5 some information about what we want to transcode as.
		 */
		ISimpleMediaFile outputStreamInfo = new SimpleMediaFile();
		outputStreamInfo.setHasAudio(true);
		outputStreamInfo.setAudioBitRate(32000);
		outputStreamInfo.setAudioChannels(1);
		outputStreamInfo.setAudioSampleRate(22050);
		outputStreamInfo.setAudioCodec(ICodec.ID.CODEC_ID_MP3);
		outputStreamInfo.setHasVideo(true);
		// Unfortunately the Trans-coder needs to know the width and height
		// you want to output as; even if you don't know yet.
		outputStreamInfo.setVideoWidth(320);
		outputStreamInfo.setVideoHeight(240);
		outputStreamInfo.setVideoBitRate(320000);
		outputStreamInfo.setVideoCodec(ICodec.ID.CODEC_ID_FLV1);
		outputStreamInfo.setVideoGlobalQuality(0);

		/**
		 * And finally, let's create out transcoder
		 */
		Transcoder transcoder = new Transcoder(aStream,
				outputStream, outputStreamInfo,
				null, null, pictureListener);
		Thread transcoderThread = new Thread(transcoder);
		transcoderThread.setDaemon(true);
		mTranscoders.put(aStream.getPublishedName(), transcoder);
		log.debug("Starting transcoding thread for: {}", aStream.getPublishedName());
		transcoderThread.start();
	}

	/**
	 * Stop transcoding a stream.
	 * @param aStream The stream to stop transcoding.
	 * @param aScope The application scope.
	 */
	synchronized public void stopTranscodingStream(IBroadcastStream aStream, IScope aScope)
	{
		log.debug("stopTranscodingStream({},{})", aStream.getPublishedName(), aScope.getName());
		String inputName = aStream.getPublishedName();
		Transcoder transcoder = mTranscoders.get(inputName);
		if (transcoder != null)
		{
			transcoder.stop();
		}
		BroadcastStream outputStream = mOutputStreams.get(inputName);
		if (outputStream != null)
		{
			outputStream.stop();
		}
	}

}

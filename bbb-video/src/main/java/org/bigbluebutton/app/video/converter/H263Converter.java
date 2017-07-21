package org.bigbluebutton.app.video.converter;

import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

/**
 * Represents a stream converter to H263. This class is responsible
 * for managing the execution of FFmpeg based on the number of listeners
 * connected to the stream. When the first listener is added FFmpef is
 * launched, and when the last listener is removed FFmpeg is stopped.
 * Converted streams are published in the same scope as the original ones,
 * with 'h263/' appended in the beginning.
 */
public class H263Converter {

	private static Logger log = Red5LoggerFactory.getLogger(H263Converter.class, "video");

	public final static String H263PREFIX = "h263/";

	private String origin;
	private Integer numListeners = 0;

	private MessagePublisher publisher;
	private Boolean publishing;
	private String ipAddress;
	private String meetingId;
	private String userId;

	/**
	 * Creates a H263Converter from a given streamName. It is assumed
	 * that one listener is responsible for this creation, therefore
	 * FFmpeg is launched.
	 *
	 * @param origin streamName of the stream that should be converted
	 */
	public H263Converter(String origin, MessagePublisher publisher) {
		log.info("Spawn FFMpeg to convert H264 to H263 for stream [{}]", origin);
		this.origin = origin;
		this.publisher = publisher;
		this.publishing = false;

		IConnection conn = Red5.getConnectionLocal();
		this.ipAddress = conn.getHost();
		this.meetingId = conn.getScope().getName();
		this.userId = getUserId();
	}

	/**
	 * Launches the transcoder event responsible for FFmpeg.
	 */
	private void startConverter() {
		if (!publishing) {
			publisher.startH264ToH263TranscoderRequest(meetingId, userId, origin, ipAddress);
			publishing = true;
		} else log.debug("No need to start transcoder, it is already running");
	}

	/**
	 * Adds a listener to H263Converter. If there were
	 * zero listeners, FFmpeg is launched for this stream.
	 */
	public synchronized void addListener() {
		this.numListeners++;
		log.debug("Adding listener to [{}] ; [{}] current listeners ", origin, this.numListeners);

		if(this.numListeners.equals(1)) {
			log.debug("First listener just joined, must start H263Converter for [{}]", origin);
			startConverter();
		}
	}

	/**
	 * Removes a listener from H263Converter. There are
	 * zero listeners left, FFmpeg is stopped this stream.
	 */
	public synchronized void removeListener() {
		this.numListeners--;
		log.debug("Removing listener from [{}] ; [{}] current listeners ", origin, this.numListeners);

		if(this.numListeners <= 0) {
			log.debug("No more listeners, may close H263Converter for [{}]", origin);
			this.stopConverter();
		}
	}

	/**
	 * Stops FFmpeg for this stream and sets the number of
	 * listeners to zero.
	 */
	public synchronized void stopConverter() {
		if (publishing) {
			this.numListeners = 0;
			publisher.stopTranscoderRequest(meetingId, userId);
			publishing = false;
			log.debug("Transcoder force-stopped");
		} else log.debug("No need to stop transcoder, it already stopped");
	}

	private String getUserId() {
		String userid = (String) Red5.getConnectionLocal().getAttribute("USERID");
		if ((userid == null) || ("".equals(userid))) userid = "unknown-userid";
		return userid;
	}
}

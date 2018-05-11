package org.bigbluebutton.app.video.converter;

import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

/**
 * Represents a stream rotator. This class is responsible
 * for choosing the rotate direction based on the stream name
 * and starting FFmpeg to rotate and re-publish the stream.
 */
public class VideoRotator {

	private static Logger log = Red5LoggerFactory.getLogger(VideoRotator.class, "video");

	public static final String ROTATE_LEFT = "rotate_left";
	public static final String ROTATE_RIGHT = "rotate_right";
	public static final String ROTATE_UPSIDE_DOWN = "rotate_upside_down";

	private final String ROTATE_ID = "ROTATE-";

	private String streamName;
	private String streamId;
	private String userId;
	private String meetingId;
	private String authToken;
	private String transcoderId;
	private String ipAddress;
	private MessagePublisher publisher;

	/**
	 * Create a new video rotator for the specified stream.
	 * The streamName should be of the form:
	 * rotate_[left|right]/streamName
	 * The rotated stream will be published as streamName.
	 *
	 * @param origin Name of the stream that will be rotated
	 * @param origin Redis publisher
	 */
	public VideoRotator(String origin, MessagePublisher publisher) {
		this.streamId = origin;
		this.publisher = publisher;
		this.userId = getUserId();
		this.meetingId = getMeetingId();
		this.authToken = getAuthToken();

		IConnection conn = Red5.getConnectionLocal();
		this.ipAddress = conn.getHost();

		start();
	}

	/**
	 * Get the stream name from the direction/streamName string
	 * @param streamName Name of the stream with rotate direction
	 * @return The stream name used for re-publish
	 */
	private String getStreamName(String streamName) {
		String parts[] = streamName.split("-");
		if(parts.length > 1)
			return parts[parts.length-1];
		return "";
	}

	private void start() {
		switch (getDirection(streamId)) {
			case ROTATE_RIGHT:
				this.streamName = streamId.replaceAll(ROTATE_RIGHT + "-", "");
				this.transcoderId = ROTATE_ID + streamName;
				publisher.startRotateRightTranscoderRequest(meetingId, transcoderId, streamName, ipAddress, userId, authToken);
				break;
			case ROTATE_LEFT:
				this.streamName = streamId.replaceAll(ROTATE_LEFT + "-", "");
				this.transcoderId = ROTATE_ID + streamName;
				publisher.startRotateLeftTranscoderRequest(meetingId, transcoderId, streamName, ipAddress, userId, authToken);
				break;
			case ROTATE_UPSIDE_DOWN:
				this.streamName = streamId.replaceAll(ROTATE_UPSIDE_DOWN + "-", "");
				this.transcoderId = ROTATE_ID + streamName;
				publisher.startRotateUpsideDownTranscoderRequest(meetingId, transcoderId, streamName, ipAddress, userId, authToken);
				break;
			default:
				break;
		}
	}

	/**
	 * Get the rotate direction from the streamName string.
	 * @param streamName Name of the stream with rotate direction
	 * @return String for the given direction if present, null otherwise
	 */
	public static String getDirection(String streamName) {
		String[] parts = streamName.split("-");
		switch(parts[0]) {
			case ROTATE_LEFT:
				return ROTATE_LEFT;
			case ROTATE_RIGHT:
				return ROTATE_RIGHT;
			case ROTATE_UPSIDE_DOWN:
				return ROTATE_UPSIDE_DOWN;
			default:
				return null;
		}
	}

	public void stop() {
		publisher.stopTranscoderRequest(meetingId, transcoderId);
	}

	private String getUserId() {
		String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");
		if ((userId == null) || ("".equals(userId))) userId = "unknown-userId";
		return userId;
	}

	private String getAuthToken() {
		String authToken = (String) Red5.getConnectionLocal().getAttribute("AUTH_TOKEN");
		if ((authToken == null) || ("".equals(authToken))) authToken = "unknown-authToken";
		return authToken;
	}

	private String getMeetingId() {
		String meetingId = (String) Red5.getConnectionLocal().getAttribute("MEETING_ID");
		if ((meetingId == null) || ("".equals(meetingId))) meetingId = "unknown-meetingId";
		return meetingId;
	}

	public static boolean isRotatedStream(String streamName){
		return (getDirection(streamName) != null);
	}
}

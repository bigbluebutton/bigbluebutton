package org.bigbluebutton.app.video.converter;

import org.bigbluebutton.app.video.ffmpeg.FFmpegCommand;
import org.bigbluebutton.app.video.ffmpeg.ProcessMonitor;
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
	public static final String ROTATE_UPSIDE_DOWN = "rotate_left/rotate_left";

	private String streamName;
//	private FFmpegCommand.ROTATE direction;

	private FFmpegCommand ffmpeg;
	private ProcessMonitor processMonitor;

	/**
	 * Create a new video rotator for the specified stream.
	 * The streamName should be of the form:
	 * rotate_[left|right]/streamName
	 * The rotated stream will be published as streamName.
	 *
	 * @param origin Name of the stream that will be rotated
	 */
	public VideoRotator(String origin) {
		this.streamName = getStreamName(origin);
//		this.direction = getDirection(origin);

//		log.debug("Setting up VideoRotator: StreamName={}, Direction={}",this.streamName,this.direction);
		IConnection conn = Red5.getConnectionLocal();
		String ip = conn.getHost();
		String conf = conn.getScope().getName();
		String inputLive = "rtmp://" + ip + "/video/" + conf + "/" + origin + " live=1";

		String output = "rtmp://" + ip + "/video/" + conf + "/" + streamName;

		ffmpeg = new FFmpegCommand();
		ffmpeg.setFFmpegPath("/usr/local/bin/ffmpeg");
		ffmpeg.setInput(inputLive);
		ffmpeg.setFormat("flv");
		ffmpeg.setOutput(output);
		ffmpeg.setLoglevel("warning");
//		ffmpeg.setRotation(direction);
		ffmpeg.setAnalyzeDuration("10000"); // 10ms

		start();
	}

	/**
	 * Get the stream name from the direction/streamName string
	 * @param streamName Name of the stream with rotate direction
	 * @return The stream name used for re-publish
	 */
	private String getStreamName(String streamName) {
		String parts[] = streamName.split("/");
		if(parts.length > 1)
			return parts[parts.length-1];
		return "";
	}

	/**
	 * Get the rotate direction from the streamName string.
	 * @param streamName Name of the stream with rotate direction
	 * @return String for the given direction if present, null otherwise
	 */
	public static String getDirection(String streamName) {
		int index = streamName.lastIndexOf("/");
		String parts[] =  {
				streamName.substring(0, index),
				streamName.substring(index + 1)
			};

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

	/**
	 * Start FFmpeg process to rotate and re-publish the stream.
	 */
	public void start() {
//		log.debug("Spawn FFMpeg to rotate [{}] stream [{}]", direction.name(), streamName);
		String[] command = ffmpeg.getFFmpegCommand(true);
		if (processMonitor == null) {
			processMonitor = new ProcessMonitor(command,"FFMPEG");
		}
		processMonitor.start();
	}

	/**
	 * Stop FFmpeg process that is rotating and re-publishing the stream.
	 */
	public void stop() {
//		log.debug("Stopping FFMpeg from rotate [{}] stream [{}]", direction.name(), streamName);
		if(processMonitor != null) {
			processMonitor.destroy();
			processMonitor = null;
		}
	}

    public static boolean isRotatedStream(String streamName){
        return (getDirection(streamName) != null);
    }
}

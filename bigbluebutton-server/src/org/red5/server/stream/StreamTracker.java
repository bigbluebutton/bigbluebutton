package org.red5.server.stream;

import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.message.Constants;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamTracker.
 */
public class StreamTracker implements Constants {
    
    /** Last audio flag. */
	private int lastAudio;
    
    /** Last video flag. */
	private int lastVideo;
    
    /** Last notification flag. */
	private int lastNotify;
    
    /** Relative flag. */
	private boolean relative;
    
    /** First video flag. */
	private boolean firstVideo;
    
    /** First audio flag. */
	private boolean firstAudio;
    
    /** First notification flag. */
	private boolean firstNotify;

	/**
	 * Constructs a new StreamTracker.
	 */
    public StreamTracker() {
		reset();
	}

    /**
     * Reset state.
     */
    public void reset() {
		lastAudio = 0;
		lastVideo = 0;
		lastNotify = 0;
		firstVideo = true;
		firstAudio = true;
		firstNotify = true;
	}

    /**
     * RTMP event handler.
     * 
     * @param event      RTMP event
     * 
     * @return           Timeframe since last notification (or auido or video packet sending)
     */
    public int add(IRTMPEvent event) {
		relative = true;
		int timestamp = event.getTimestamp();
		int tsOut = 0;

		switch (event.getDataType()) {

			case TYPE_AUDIO_DATA:
				if (firstAudio) {
					tsOut = event.getTimestamp();
					relative = false;
					firstAudio = false;
				} else {
					tsOut = timestamp - lastAudio;
				}
				lastAudio = timestamp;
				break;

			case TYPE_VIDEO_DATA:
				if (firstVideo) {
					tsOut = event.getTimestamp();
					relative = false;
					firstVideo = false;
				} else {
					tsOut = timestamp - lastVideo;
				}
				lastVideo = timestamp;
				break;

			case TYPE_NOTIFY:
			case TYPE_INVOKE:
				if (firstNotify) {
					tsOut = event.getTimestamp();
					relative = false;
					firstNotify = false;
				} else {
					tsOut = timestamp - lastNotify;
				}
				lastNotify = timestamp;
				break;

			default:
				// ignore other types
				break;

		}
		return tsOut;
	}

	/**
	 * Getter for property 'relative'.
	 * 
	 * @return Value for property 'relative'.
	 */
    public boolean isRelative() {
		return relative;
	}
}

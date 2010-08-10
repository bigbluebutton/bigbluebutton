package org.bigbluebutton.voiceconf.red5.media;

public class AudioByteData {
	private final byte[] data;
	private final long timestamp;
	
	public AudioByteData(byte[] data, long timestamp) {
		this.data = data;
		this.timestamp = timestamp;
	}
	
	public byte[] getData() {
		return data;
	}
	
	public long getTimestamp() {
		return timestamp;
	}
}

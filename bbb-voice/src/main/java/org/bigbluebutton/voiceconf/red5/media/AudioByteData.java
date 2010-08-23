package org.bigbluebutton.voiceconf.red5.media;

public class AudioByteData {
	private final byte[] data;

	public AudioByteData(byte[] data) {
		this.data = new byte[data.length];
		System.arraycopy(data, 0, this.data, 0, data.length);
	}
	
	public byte[] getData() {
		return data;
	}
	
}

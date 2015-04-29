package org.red5.app.sip;

public class RtmpAudioData {

	private final byte[] audioData;
	
	public RtmpAudioData(byte[] data) {
		this.audioData = new byte[data.length];
		System.arraycopy(data, 0, this.audioData, 0, data.length);
	}
	
	public byte[] getData() {
		return audioData;
	}
}

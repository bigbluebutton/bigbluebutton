package org.red5.app.sip;

class RtmpAudioData {

	private final byte[] audioData;
	
	RtmpAudioData(byte[] data) {
		this.audioData = new byte[data.length];
		System.arraycopy(data, 0, this.audioData, 0, data.length);
	}
	
	byte[] getData() {
		return audioData;
	}
}

package org.bigbluebutton.voiceconf.red5.media.transcoder;

public class SpeexRtpAudioData {

	public final byte[] audioData;
	public final long timestamp;
	
	public SpeexRtpAudioData(byte[] audioData, long timestamp) {
		this.audioData = audioData;
		this.timestamp = timestamp;
	}
}

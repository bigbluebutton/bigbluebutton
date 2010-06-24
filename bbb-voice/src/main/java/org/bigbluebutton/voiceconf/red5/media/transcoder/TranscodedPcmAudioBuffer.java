package org.bigbluebutton.voiceconf.red5.media.transcoder;

import org.red5.app.sip.stream.RtpStreamSender;

public class TranscodedPcmAudioBuffer {

	private byte[] buffer;
	private int offset;
	private RtpStreamSender sender;
	
	TranscodedPcmAudioBuffer(byte[] data, int offset, RtpStreamSender sender) {
		buffer = data;
		this.offset = offset;
	}
		
	boolean copyData(byte[] data) {
		if (data.length > buffer.length - offset)
			return false;
		
		System.arraycopy(data, 0, buffer, offset, data.length);
		return true;
	}
	
	void sendData() {
		sender.sendTranscodedData();
	}

}

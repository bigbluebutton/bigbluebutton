package org.red5.app.sip.trancoders;

import org.red5.app.sip.stream.RtpSender2;

public class TranscodedPcmAudioBuffer {

	private byte[] buffer;
	private int offset;
	private RtpSender2 sender;
	
	TranscodedPcmAudioBuffer(byte[] data, int offset, RtpSender2 sender) {
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

package org.bigbluebutton.voiceconf.red5.media.transcoder;

import org.bigbluebutton.voiceconf.red5.media.RtpStreamSender;

public interface Transcoder {
	void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender);
	void transcode(byte[] codedBuffer);
	
	int getOutgoingEncodedFrameSize();

    int getCodecId();
    
    int getOutgoingPacketization();
    int getIncomingEncodedFrameSize();
}

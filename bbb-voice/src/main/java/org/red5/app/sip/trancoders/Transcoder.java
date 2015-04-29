package org.red5.app.sip.trancoders;

import org.red5.app.sip.stream.RtpStreamSender;

public interface Transcoder {
	void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender);
	void transcode(byte[] codedBuffer);
	
	int getOutgoingEncodedFrameSize();

    int getCodecId();
    
    int getOutgoingPacketization();
    int getIncomingEncodedFrameSize();
}

package org.red5.app.sip;

public interface Transcoder {
	void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpSender2 rtpSender);
	void transcode(byte[] codedBuffer);
	
	int getOutgoingEncodedFrameSize();

    int getCodecId();
    
    int getOutgoingPacketization();
    int getIncomingEncodedFrameSize();
}

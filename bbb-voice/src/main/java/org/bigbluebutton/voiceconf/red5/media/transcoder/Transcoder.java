/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.red5.media.transcoder;

import org.bigbluebutton.voiceconf.red5.media.RtpStreamSender;

public interface Transcoder {
	byte[] transcodeAudio(byte[] srcAudio, int startOffset, int length);
	void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender);
	void transcode(byte[] codedBuffer);
	void addTranscodedAudioDataListener(TranscodedAudioDataListener listener);
	int getOutgoingEncodedFrameSize();

    int getCodecId();
    
    int getOutgoingPacketization();
    int getIncomingEncodedFrameSize();
}

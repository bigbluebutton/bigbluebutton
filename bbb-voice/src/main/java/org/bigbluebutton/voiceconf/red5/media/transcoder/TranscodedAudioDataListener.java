package org.bigbluebutton.voiceconf.red5.media.transcoder;

import org.red5.server.net.rtmp.event.AudioData;

public interface TranscodedAudioDataListener {

	public void handleTranscodedAudioData(AudioData audioData);
}

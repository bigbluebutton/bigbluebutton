package org.red5.app.sip;

import org.red5.server.net.rtmp.event.AudioData;

public interface TranscodedAudioDataListener {

	public void handleTranscodedAudioData(AudioData audioData);
}

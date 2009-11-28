package org.red5.app.sip.trancoders;

import org.red5.server.net.rtmp.event.AudioData;

public interface TranscodedAudioDataListener {

	public void handleTranscodedAudioData(AudioData audioData);
}

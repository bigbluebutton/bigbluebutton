package org.bigbluebutton.deskshare.server.recorder;

import org.apache.mina.core.buffer.IoBuffer;

public interface Recorder {
	public void record(IoBuffer frame);
	public void start();
	public void stop();
	
}

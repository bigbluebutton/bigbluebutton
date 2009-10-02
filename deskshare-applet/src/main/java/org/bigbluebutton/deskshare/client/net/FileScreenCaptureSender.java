package org.bigbluebutton.deskshare.client.net;

import java.io.ByteArrayOutputStream;

import org.bigbluebutton.deskshare.client.FlvFileWriter;

public class FileScreenCaptureSender implements ScreenCaptureSender {

	private FlvFileWriter fv;
	
	public void connect(String host, String room, int width, int height) {
		fv = new FlvFileWriter();
		fv.init();
	}

	public void disconnect() {
		fv.stop();

	}

	public void send(ByteArrayOutputStream videoData, boolean isKeyFrame) {
		fv.writeDataToFile(videoData);
	}

}

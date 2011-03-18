package org.bigbluebutton.deskshare.server.recorder;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.deskshare.server.session.FlvEncodeException;
import org.bigbluebutton.deskshare.server.session.ScreenVideoFlvEncoder;

public class FileRecorder {
	private BlockingQueue<IoBuffer> screenQueue = new LinkedBlockingQueue<IoBuffer>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;

	private FileOutputStream fo;
	private ScreenVideoFlvEncoder svf = new ScreenVideoFlvEncoder();
	
	private String flvFilename = "/tmp/screenvideostream.flv";
	
	public FileRecorder(String name, boolean record) {
		if (record) {
			flvFilename = "/tmp/" + name + "-" + System.currentTimeMillis() + ".flv";
		}
	}
	
	public void accept(IoBuffer frame) {
		try {
			screenQueue.put(frame);
		} catch (InterruptedException e) {
			System.out.println("InterruptedException while putting event into queue.");
		}
	}

	public void start() {
		try {
			fo = new FileOutputStream(flvFilename);
			fo.write(svf.encodeHeader());
		} catch (FileNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		sendCapturedScreen = true;
		System.out.println("Starting stream");
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						System.out.println("ScreenQueue size " + screenQueue.size());
						IoBuffer newScreen = screenQueue.take();
						sendCapturedScreen(newScreen);
					} catch (InterruptedException e) {
						System.out.println("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);
	}

	private void sendCapturedScreen(IoBuffer event) {
//	System.out.println("ENABLE FlvStreamToFile:sendCapturedScreen");
			
		try {
			byte[] data = svf.encodeFlvData(event.array());
			System.out.println("Saving video data with length " + data.length);
			fo.write(data);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FlvEncodeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		

	}
	
	public void stop() {
    	try {
    		System.out.println("Closing stream");
			fo.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void setFlvFilename(String filename) {
		flvFilename = filename;
	}
}

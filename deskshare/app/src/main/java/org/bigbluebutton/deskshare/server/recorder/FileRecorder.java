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
import org.bigbluebutton.deskshare.server.util.StackTraceUtil;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class FileRecorder implements Recorder {
	final private Logger log = Red5LoggerFactory.getLogger(FileRecorder.class, "deskshare");
	
	private BlockingQueue<IoBuffer> screenQueue = new LinkedBlockingQueue<IoBuffer>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;

	private FileOutputStream fo;
	private ScreenVideoFlvEncoder svf = new ScreenVideoFlvEncoder();
	
	private String flvFilename = "/tmp/screenvideostream.flv";
	
	public FileRecorder(String name, String recordingPath) {
		flvFilename = recordingPath + "/" + name + "-" + System.currentTimeMillis() + ".flv";
	}
	
	public void record(IoBuffer frame) {
		try {
			screenQueue.put(frame);
		} catch (InterruptedException e) {
			log.info("InterruptedException while putting event into queue.");
		}
	}

	public void start() {
		try {
			fo = new FileOutputStream(flvFilename);
			fo.write(svf.encodeHeader());
		} catch (FileNotFoundException e1) {
			log.error(StackTraceUtil.getStackTrace(e1));
		} catch (IOException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		}
		
		sendCapturedScreen = true;
		log.info("Starting stream");
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						IoBuffer frame = screenQueue.take();
						recordFrameToFile(frame);
					} catch (InterruptedException e) {
						log.info("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);
	}

	private void recordFrameToFile(IoBuffer frame) {	
		try {
			fo.write(svf.encodeFlvData(frame.array()));
		} catch (IOException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		} catch (FlvEncodeException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		}		
	}
	
	public void stop() {
    	try {
    		log.info("Closing stream");
			fo.close();
		} catch (IOException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		}
	}
}

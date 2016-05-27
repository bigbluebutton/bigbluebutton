package org.bigbluebutton.screenshare.client.javacv;

import java.awt.AWTException;
import java.awt.image.BufferedImage;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferByte;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.bigbluebutton.screenshare.client.ScreenCaptureTaker;
import org.bigbluebutton.screenshare.client.ScreenShareInfo;
import org.bytedeco.javacpp.BytePointer;
import static org.bytedeco.javacpp.avcodec.*;
import static org.bytedeco.javacpp.avutil.*;

public class JavaCVScreenshare {

  private volatile boolean startBroadcast = false;
  private final Executor startBroadcastExec = Executors.newSingleThreadExecutor();
  private Runnable startBroadcastRunner; 
  private BBBFFmpegFrameRecorder recorder = null;
  private Double defaultFrameRate = 12.0;
  private Double frameRate = 12.0;
  private int defaultKeyFrameInterval = 6;
  
  private long startTime;
  private int frameNumber = 1;
  
  private ScreenShareInfo ssi;
  private ScreenCaptureTaker captureTaker;

  
  private final String FRAMERATE_KEY = "frameRate";
  private final String KEYFRAMEINTERVAL_KEY = "keyFrameInterval";
  
  public JavaCVScreenshare(ScreenShareInfo ssi) {
    this.ssi = ssi;
    captureTaker = new ScreenCaptureTaker(ssi.x, ssi.y, ssi.captureWidth, ssi.captureHeight, ssi.scaleWidth, ssi.scaleHeight);
  }
  
  public void setCaptureCoordinates(int x, int y){
    captureTaker.setCaptureCoordinates(x, y);  
  }
  
  private Map<String, String> splitToMap(String source, String entriesSeparator, String keyValueSeparator) {
    System.out.println("CODEC_OPTS=" + source);
	    Map<String, String> map = new HashMap<String, String>();
	    String[] entries = source.split(entriesSeparator);
	    for (String entry : entries) {
	        if (entry != "" && entry.contains(keyValueSeparator)) {
	            String[] keyValue = entry.split(keyValueSeparator);
	            System.out.println("OPTION: " + keyValue[0] + "=" + keyValue[1]);
	            map.put(keyValue[0], keyValue[1]);
	        }
	    }
	    return map;
	}
  
  public void go(String URL, int x, int y, int width, int height) throws IOException, BBBFrameRecorder.Exception, 
  AWTException, InterruptedException {
	
	captureTaker = new ScreenCaptureTaker(x, y, width, height, width, height);
	  
    System.out.println("Capturing w=[" + width + "] h=[" + height + "] at x=[" + x + "] y=[" + y + "]");

    recorder = new BBBFFmpegFrameRecorder(URL, width, height);
    recorder.setFormat("flv");

    ///
    // Flash SVC2
    //recorder.setVideoCodec(AV_CODEC_ID_FLASHSV2);
    //recorder.setPixelFormat(AV_PIX_FMT_BGR24);

    // H264
    recorder.setVideoCodec(AV_CODEC_ID_H264);
    recorder.setPixelFormat(AV_PIX_FMT_YUV420P);
  
    Map<String, String> codecOptions = splitToMap(ssi.codecOptions, "&", "=");
    
    frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
    recorder.setFrameRate(frameRate);
    
    int keyFrameInterval =  parseKeyFrameInterval(codecOptions.get(KEYFRAMEINTERVAL_KEY));
    int gopSize = frameRate.intValue() * keyFrameInterval;
    recorder.setGopSize(gopSize);
    
    System.out.println("==== CODEC OPTIONS =====");
    for (Map.Entry<String, String> entry : codecOptions.entrySet()) {
      System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
      if (entry.getKey().equals(FRAMERATE_KEY) || entry.getKey().equals(KEYFRAMEINTERVAL_KEY)) {
        // ignore as we have handled this above
      } else {
        recorder.setVideoOption(entry.getKey(), entry.getValue());        
      }

    }
    System.out.println("==== END CODEC OPTIONS =====");

    startTime = System.currentTimeMillis();
    
    try {
      recorder.start();
    } catch (Exception e1) {
      // TODO Auto-generated catch block
      e1.printStackTrace();
    }
  }
  
  private Double parseFrameRate(String value) {
    Double fr = defaultFrameRate; 
        
    try {
      fr = Double.parseDouble(value);
    } catch (NumberFormatException e) {
      fr = defaultFrameRate; 
    }
        
    return fr;
  }
  
  private int parseKeyFrameInterval(String value) {
    int fr = defaultKeyFrameInterval; 
        
    try {
      fr = Integer.parseInt(value);
    } catch (NumberFormatException e) {
      fr = defaultKeyFrameInterval; 
    }
        
    return fr;
  }
  
  private void captureScreen() {
    long now = System.currentTimeMillis();

    BufferedImage currentScreenshot = captureTaker.captureScreen();
    DataBuffer in  = currentScreenshot.getData().getDataBuffer();

    byte[] a = ((DataBufferByte)in).getData();;

    ByteBuffer bbuffer = ByteBuffer.wrap(a);

    BytePointer bpointer = new BytePointer(bbuffer);
    try {
      recorder.record(bpointer, currentScreenshot.getWidth(), currentScreenshot.getHeight(), AV_PIX_FMT_BGR24);
    } catch (Exception e1) {
      // TODO Auto-generated catch block
      e1.printStackTrace();
    }

    long sleepFramerate = (long) (1000 / frameRate);
    long timestamp = now - startTime;
    recorder.setTimestamp(timestamp * 1000);

    //        System.out.println("i=[" + i + "] timestamp=[" + timestamp + "]");
    recorder.setFrameNumber(frameNumber);

//    System.out.println("[ENCODER] encoded image " + frameNumber + " in " + (System.currentTimeMillis() - now));
    frameNumber++;

    long execDuration = (System.currentTimeMillis() - now);
    long sleepDuration = Math.max(sleepFramerate - execDuration, 0);
    pause(sleepDuration);

  }
  
  private void pause(long dur) {
    try{
      Thread.sleep(dur);
    } catch (Exception e){
      System.out.println("Exception sleeping.");
    }
  }

  public void start() {
    startBroadcast = true;
    startBroadcastRunner =  new Runnable() {
      public void run() {
        while (startBroadcast){
          captureScreen();
        }
        System.out.println("Stopping screen capture.");     
      }
    };
    startBroadcastExec.execute(startBroadcastRunner);    
  }

  public void stop() {
    startBroadcast = false;
    if (recorder != null) {

      try {
        recorder.stop();
        recorder.release();
      } catch (Exception e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }
  }
}

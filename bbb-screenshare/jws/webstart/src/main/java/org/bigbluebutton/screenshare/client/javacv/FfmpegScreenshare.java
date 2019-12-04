package org.bigbluebutton.screenshare.client.javacv;

import static org.bytedeco.javacpp.avcodec.AV_CODEC_ID_FLASHSV2;
import static org.bytedeco.javacpp.avcodec.AV_CODEC_ID_H264;
import static org.bytedeco.javacpp.avutil.AV_PIX_FMT_BGR24;
import static org.bytedeco.javacpp.avutil.AV_PIX_FMT_RGB0;
import static org.bytedeco.javacpp.avutil.AV_PIX_FMT_YUV420P;
import java.awt.AWTException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.bigbluebutton.screenshare.client.ExitCode;
import org.bigbluebutton.screenshare.client.ScreenShareInfo;
import org.bigbluebutton.screenshare.client.net.NetworkConnectionListener;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.javacpp.avcodec;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.Frame;

public class FfmpegScreenshare {
  private volatile boolean startBroadcast = false;
  private final Executor startBroadcastExec = Executors.newSingleThreadExecutor();
  private Runnable startBroadcastRunner; 
  private FFmpegFrameRecorder mainRecorder = null;
  private Double defaultFrameRate = 12.0;
  private Double frameRate = 12.0;
  private int defaultKeyFrameInterval = 6;
  
  private long startTime;
  private int frameNumber = 1;
  
  private ScreenShareInfo ssi;
  private FFmpegFrameGrabber grabber;

  private final String FRAMERATE_KEY = "frameRate";
  private final String KEYFRAMEINTERVAL_KEY = "keyFrameInterval";

  private volatile boolean ignoreDisconnect = true;

  private NetworkConnectionListener listener;

  public FfmpegScreenshare(ScreenShareInfo ssi, NetworkConnectionListener listener) {
    this.ssi = ssi;
    this.listener = listener;
  }
  
  public void setCaptureCoordinates(int x, int y){
    // do nothing. Should remove.
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
  
  public void go(String URL, int x, int y, int width, int height) throws IOException,
                  AWTException, InterruptedException {
  
    System.out.println("Java temp dir : " + System.getProperty("java.io.tmpdir"));
    System.out.println("Java name : " + System.getProperty("java.vm.name"));
    System.out.println("OS name : " + System.getProperty("os.name"));
    System.out.println("OS arch : " + System.getProperty("os.arch"));
    System.out.println("JNA Path : " + System.getProperty("jna.library.path"));
    System.out.println("Platform : " + Loader.getPlatform());
    System.out.println("Platform lib path: " + System.getProperty("java.library.path"));
    System.out.println("Capturing w=[" + width + "] h=[" + height + "] at x=[" + x + "] y=[" + y + "]");
    System.out.println("URL=" + ssi.URL);
    System.out.println("useH264=" + ssi.useH264);
    
    Map<String, String> codecOptions = splitToMap(ssi.codecOptions, "&", "=");
    Double frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
    
    String platform = Loader.getPlatform();
    String osName = System.getProperty("os.name").toLowerCase();
    if (platform.startsWith("windows")) {
      grabber = setupWindowsGrabber(width, height, x, y);
      mainRecorder = setupWindowsRecorder(URL, width, height, codecOptions, ssi.useH264);
    } else if (platform.startsWith("linux")) {
      grabber = setupLinuxGrabber(width, height, x, y);
      mainRecorder = setupLinuxRecorder(URL, width, height, codecOptions, ssi.useH264);
    } else if (platform.startsWith("macosx-x86_64")) {
      grabber = setupMacOsXGrabber(width, height, x, y);

      mainRecorder = setupMacOsXRecorder(URL, width, height, codecOptions, ssi.useH264);
    }
    
    grabber.setFrameRate(frameRate);
    try {
      ignoreDisconnect = false;
      grabber.start();
    } catch (Exception e) {
      System.out.println("Exception starting grabber.");
      listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
    }

//    useH264(recorder, codecOptions);
    
    startTime = System.currentTimeMillis();

    try {
      mainRecorder.start();
    } catch (Exception e) {
      System.out.println("Exception starting recorder. \n" + e.toString());
      System.out.println(printStacktrace(e));
      listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
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

    Frame frame;
    try {
      frame = grabber.grabImage();
      if (frame != null) {
        try {
          long timestamp = now - startTime;
          // Override timestamp from system screen grabber. Otherwise, we will have skewed recorded file.
          // FfmpegFrameRecorder needs to propagate this timestamp into the avpacket sent to the server.
          // ralam - Sept. 14, 2016
          frame.timestamp = timestamp;
          //System.out.println("frame timestamp=[" + frame.timestamp + "] ");
          mainRecorder.record(frame);
        } catch (Exception e) {
          System.out.println("CaptureScreen Exception 1");
          if (!ignoreDisconnect) {
            listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
          }
        }
      }
    } catch (Exception e1) {
      System.out.println("Exception grabbing image");
      System.out.println(printStacktrace(e1));
      listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
    }

    long sleepFramerate = (long) (1000 / frameRate);

    //System.out.println("timestamp=[" + timestamp + "]");
    mainRecorder.setFrameNumber(frameNumber);

    //System.out.println("[ENCODER] encoded image " + frameNumber + " in " + (System.currentTimeMillis() - now));
    frameNumber++;

    long execDuration = (System.currentTimeMillis() - now);
    long sleepDuration = Math.max(sleepFramerate - execDuration, 0);
    pause(sleepDuration);

  }
  
  private void pause(long dur) {
    try{
      Thread.sleep(dur);
    } catch (Exception e){
      System.out.println("Exception pausing screen share.");
      listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
    }
  }

  public void start() {
    startBroadcast = true;
    startBroadcastRunner =  new Runnable() {
      public void run() {
        while (startBroadcast){
          captureScreen();
        }
        System.out.println("*******************Stopped screen capture. !!!!!!!!!!!!!!!!!!!");
      }
    };
    startBroadcastExec.execute(startBroadcastRunner);    
  }

  public void stop() {
    System.out.println("Stopping screen capture.");
    startBroadcast = false;
    if (mainRecorder != null) {
      try {
        ignoreDisconnect = true;
        System.out.println("mainRecorder.stop.");
        mainRecorder.stop();
        System.out.println("mainRecorder.release.");
        mainRecorder.release();
        System.out.println("grabber.stop.");
        // Do not invoke grabber.stop as it exits the JWS app.
        // Not sure why. (ralam - aug 10, 2016)
        //grabber.stop();
        //System.out.println("End stop sequence.");
      } catch (Exception e) {
        System.out.println("Exception stopping screen share.");
        listener.networkConnectionException(ExitCode.INTERNAL_ERROR, null);
      }
    }
  }
  
  private void useH264(FFmpegFrameRecorder recorder, Map<String, String> codecOptions) {
    Double frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
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
    
    recorder.setFormat("flv");
      
    // H264
    recorder.setVideoCodec(AV_CODEC_ID_H264);
    recorder.setPixelFormat(AV_PIX_FMT_YUV420P);
    recorder.setVideoOption("crf", "38");
    recorder.setVideoOption("preset", "veryfast");
    recorder.setVideoOption("tune", "zerolatency");
    recorder.setVideoOption("intra-refresh", "1"); 
  }
  
  private void useSVC2(FFmpegFrameRecorder recorder) {
    recorder.setFormat("flv");
    
    ///
    // Flash SVC2
    recorder.setVideoCodec(AV_CODEC_ID_FLASHSV2);
    recorder.setPixelFormat(AV_PIX_FMT_BGR24);
    
  }
  
//==============================================
// RECORDERS
//==============================================
private  FFmpegFrameRecorder setupWindowsRecorder(String url, int width, int height,
                                                  Map<String, String> codecOptions,
                                                  Boolean useH264) {
  FFmpegFrameRecorder winRecorder = new FFmpegFrameRecorder(url, grabber.getImageWidth(), grabber.getImageHeight());
  Double frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
  winRecorder.setFrameRate(frameRate);
  
  int keyFrameInterval =  parseKeyFrameInterval(codecOptions.get(KEYFRAMEINTERVAL_KEY));
  int gopSize = frameRate.intValue() * keyFrameInterval;
  winRecorder.setGopSize(gopSize);
  
  System.out.println("==== CODEC OPTIONS =====");
  for (Map.Entry<String, String> entry : codecOptions.entrySet()) {
    System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
    if (entry.getKey().equals(FRAMERATE_KEY) || entry.getKey().equals(KEYFRAMEINTERVAL_KEY)) {
      // ignore as we have handled this above
    } else {
      winRecorder.setVideoOption(entry.getKey(), entry.getValue());        
    }

  }
  System.out.println("==== END CODEC OPTIONS =====");
  
  winRecorder.setFormat("flv");

  if (useH264) {
    System.out.println("Using H264 codec");
    // H264
    winRecorder.setVideoCodec(AV_CODEC_ID_H264);
    winRecorder.setPixelFormat(AV_PIX_FMT_YUV420P);
    winRecorder.setVideoOption("crf", "38");
    winRecorder.setVideoOption("preset", "veryfast");
    winRecorder.setVideoOption("tune", "zerolatency");
    winRecorder.setVideoOption("intra-refresh", "1");
  } else {
    System.out.println("Using SVC2 codec");
    // Flash SVC2
    winRecorder.setVideoCodec(AV_CODEC_ID_FLASHSV2);
    winRecorder.setPixelFormat(AV_PIX_FMT_BGR24);
  }

  
  return winRecorder;
}

private  FFmpegFrameRecorder setupLinuxRecorder(String url, int width, int height,
                                                Map<String, String> codecOptions,
                                                Boolean useH264) {
  FFmpegFrameRecorder linuxRecorder = new FFmpegFrameRecorder(url, grabber.getImageWidth(), grabber.getImageHeight());
  Double frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
  linuxRecorder.setFrameRate(frameRate);
  
  int keyFrameInterval =  parseKeyFrameInterval(codecOptions.get(KEYFRAMEINTERVAL_KEY));
  int gopSize = frameRate.intValue() * keyFrameInterval;
  linuxRecorder.setGopSize(gopSize);
  
  System.out.println("==== CODEC OPTIONS =====");
  for (Map.Entry<String, String> entry : codecOptions.entrySet()) {
    System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
    if (entry.getKey().equals(FRAMERATE_KEY) || entry.getKey().equals(KEYFRAMEINTERVAL_KEY)) {
      // ignore as we have handled this above
    } else {
      linuxRecorder.setVideoOption(entry.getKey(), entry.getValue());        
    }

  }
  System.out.println("==== END CODEC OPTIONS =====");
  
  linuxRecorder.setFormat("flv");

  if (useH264) {
    // H264
    linuxRecorder.setVideoCodec(AV_CODEC_ID_H264);
    linuxRecorder.setPixelFormat(AV_PIX_FMT_YUV420P);
    linuxRecorder.setVideoOption("crf", "38");
    linuxRecorder.setVideoOption("preset", "veryfast");
    linuxRecorder.setVideoOption("tune", "zerolatency");
    linuxRecorder.setVideoOption("intra-refresh", "1");
  } else {
    // Flash SVC2
    linuxRecorder.setVideoCodec(AV_CODEC_ID_FLASHSV2);
    linuxRecorder.setPixelFormat(AV_PIX_FMT_BGR24);
  }
    

  
  return linuxRecorder;
}

private  FFmpegFrameRecorder setupMacOsXRecorder(String url, int width, int height,
                                                 Map<String, String> codecOptions,
                                                 Boolean useH264) {
  FFmpegFrameRecorder macRecorder = new FFmpegFrameRecorder(url, grabber.getImageWidth(), grabber.getImageHeight());
  Double frameRate = parseFrameRate(codecOptions.get(FRAMERATE_KEY));
  macRecorder.setFrameRate(frameRate);
  
  int keyFrameInterval =  parseKeyFrameInterval(codecOptions.get(KEYFRAMEINTERVAL_KEY));
  int gopSize = frameRate.intValue() * keyFrameInterval;
  macRecorder.setGopSize(gopSize);
  
  System.out.println("==== CODEC OPTIONS =====");
  for (Map.Entry<String, String> entry : codecOptions.entrySet()) {
    System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
    if (entry.getKey().equals(FRAMERATE_KEY) || entry.getKey().equals(KEYFRAMEINTERVAL_KEY)) {
      // ignore as we have handled this above
    } else {
      macRecorder.setVideoOption(entry.getKey(), entry.getValue());        
    }

  }
  System.out.println("==== END CODEC OPTIONS =====");
  
  macRecorder.setFormat("flv");

  if (useH264) {
    // H264
    macRecorder.setVideoCodec(AV_CODEC_ID_H264);
    macRecorder.setPixelFormat(AV_PIX_FMT_YUV420P);
    macRecorder.setVideoOption("crf", "34");
    macRecorder.setVideoOption("preset", "veryfast");

    // Mac doesn't support the options below.
//  macRecorder.setVideoOption("tune", "zerolatency");
//  macRecorder.setVideoOption("intra-refresh", "1");
  } else {
    // Flash SVC2
    macRecorder.setVideoCodec(AV_CODEC_ID_FLASHSV2);
    macRecorder.setPixelFormat(AV_PIX_FMT_BGR24);
  }

  return macRecorder;
}

//==============================================
// GRABBERS
//==============================================
  
  // Need to construct our grabber depending on which
  // platform the user is using.
  // https://trac.ffmpeg.org/wiki/Capture/Desktop
  //
  private FFmpegFrameGrabber setupWindowsGrabber(int width, int height, int x, int y) {
    System.out.println("Setting up grabber for windows.");
    FFmpegFrameGrabber winGrabber = new FFmpegFrameGrabber("desktop");
    winGrabber.setImageWidth(width);
    winGrabber.setImageHeight(height);
    
    if (ssi.fullScreen) {
      winGrabber.setOption("offset_x", new Integer(0).toString());
      winGrabber.setOption("offset_y", new Integer(0).toString());      
    } else {
      winGrabber.setOption("offset_x", new Integer(x).toString());
      winGrabber.setOption("offset_y", new Integer(y).toString());       
    }
    winGrabber.setFormat("gdigrab");   
    
    return winGrabber;
  }
  
  private FFmpegFrameGrabber setupLinuxGrabber(int width, int height, int x, int y) {
    // ffmpeg -video_size 1024x768 -framerate 25 -f x11grab -i :0.0+100,200 output.mp4
    // This will grab the image from desktop, starting with the upper-left corner at (x=100, y=200) 
    // with the width and height of 1024x768.

    String inputDevice = ":"; 
    if (ssi.fullScreen) {
      inputDevice = inputDevice.concat(new Integer(0).toString()).concat(".").concat(new Integer(0).toString());
      inputDevice = inputDevice.concat("+").concat(new Integer(0).toString()).concat(",").concat(new Integer(0).toString());     
    } else {
      inputDevice = inputDevice.concat(new Integer(0).toString()).concat(".").concat(new Integer(0).toString());
      inputDevice = inputDevice.concat("+").concat(new Integer(x).toString()).concat(",").concat(new Integer(y).toString());      
    }
    
    String videoSize = new Integer(width).toString().concat("x").concat(new Integer(height).toString());
    
    System.out.println("Setting up grabber for linux.");
    System.out.println("input:" + inputDevice + " videoSize:" + videoSize);
    
    FFmpegFrameGrabber linuxGrabber = new FFmpegFrameGrabber(inputDevice);
    linuxGrabber.setImageWidth(width);
    linuxGrabber.setImageHeight(height);
    linuxGrabber.setOption("video_size", videoSize); 
    linuxGrabber.setFormat("x11grab");    
    return linuxGrabber;
  }
  
  private FFmpegFrameGrabber setupMacOsXGrabber(int width, int height, int x, int y) {
    
    //ffmpeg -f avfoundation -i "Capture screen 0" test.mkv
    String inputDevice = "Capture screen 0:none";     
    String videoSize = new Integer(width).toString().concat("x").concat(new Integer(height).toString());

    System.out.println("Setting up grabber for macosx.");
    System.out.println("input:" + inputDevice + " videoSize:" + videoSize);
    
    FFmpegFrameGrabber macGrabber = new FFmpegFrameGrabber(inputDevice);
    macGrabber.setImageWidth(width);
    macGrabber.setImageHeight(height);
    macGrabber.setFrameRate(frameRate);
    macGrabber.setPixelFormat(AV_PIX_FMT_RGB0);
    macGrabber.setFormat("avfoundation");
    macGrabber.setOption("capture_cursor", "1");
    macGrabber.setOption("capture_mouse_clicks", "1");
    return macGrabber;
  }
  
  
  private String printStacktrace(Exception exception) {
	  StringWriter writer = new StringWriter();
	  PrintWriter printWriter = new PrintWriter( writer );
	  exception.printStackTrace( printWriter );
	  printWriter.flush();

	  String stackTrace = writer.toString();
	  return stackTrace;
  }

}



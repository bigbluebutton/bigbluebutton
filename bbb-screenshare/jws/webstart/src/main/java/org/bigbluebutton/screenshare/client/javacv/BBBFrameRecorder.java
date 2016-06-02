package org.bigbluebutton.screenshare.client.javacv;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

public abstract class BBBFrameRecorder {

  public static final List<String> list = new LinkedList<String>(Arrays.asList(new String[] { "FFmpeg", "OpenCV" }));
  public static void init() {
    for (String name : list) {
      try {
        Class<? extends BBBFrameRecorder> c = get(name);
        c.getMethod("tryLoad").invoke(null);
      } catch (Throwable t) { }
    }
  }
  public static Class<? extends BBBFrameRecorder> getDefault() {
    // select first frame recorder that can load..
    for (String name : list) {
      try {
        Class<? extends BBBFrameRecorder> c = get(name);
        c.getMethod("tryLoad").invoke(null);
        return c;
      } catch (Throwable t) { }
    }
    return null;
  }
  public static Class<? extends BBBFrameRecorder> get(String className) throws Exception {
    className = BBBFrameRecorder.class.getPackage().getName() + "." + className;
    try {
      return Class.forName(className).asSubclass(BBBFrameRecorder.class);
    } catch (ClassNotFoundException e) {
      String className2 = className + "FrameRecorder";
      try {
        return Class.forName(className2).asSubclass(BBBFrameRecorder.class);
      } catch (ClassNotFoundException ex) {
        throw new Exception("Could not get FrameRecorder class for " + className + " or " + className2, e);
      }
    }
  }

  public static BBBFrameRecorder create(Class<? extends BBBFrameRecorder> c, Class p, Object o, int w, int h) throws Exception {
    Throwable cause = null;
    try {
      return c.getConstructor(p, int.class, int.class).newInstance(o, w, h);
    } catch (InstantiationException ex) {
      cause = ex;
    } catch (IllegalAccessException ex) {
      cause = ex;
    } catch (IllegalArgumentException ex) {
      cause = ex;
    } catch (NoSuchMethodException ex) {
      cause = ex;
    } catch (InvocationTargetException ex) {
      cause = ex.getCause();
    }
    throw new Exception("Could not create new " + c.getSimpleName() + "(" + o + ", " + w + ", " + h + ")", cause);
  }

  public static BBBFrameRecorder createDefault(File file, int width, int height) throws Exception {
    return create(getDefault(), File.class, file, width, height);
  }
  public static BBBFrameRecorder createDefault(String filename, int width, int height) throws Exception {
    return create(getDefault(), String.class, filename, width, height);
  }

  public static BBBFrameRecorder create(String className, File file, int width, int height) throws Exception {
    return create(get(className), File.class, file, width, height);
  }
  public static BBBFrameRecorder create(String className, String filename, int width, int height) throws Exception {
    return create(get(className), String.class, filename, width, height);
  }

  protected String format, videoCodecName;
  protected int imageWidth, imageHeight, audioChannels;
  protected int pixelFormat, videoCodec, videoBitrate, gopSize = -1;
  protected double frameRate, videoQuality = -1;
  protected HashMap<String, String> videoOptions = new HashMap<String, String>();
  protected int frameNumber = 0;
  protected long timestamp = 0;

  public String getFormat() {
    return format;
  }
  public void setFormat(String format) {
    this.format = format;
  }

  public String getVideoCodecName() {
    return videoCodecName;
  }
  public void setVideoCodecName(String videoCodecName) {
    this.videoCodecName = videoCodecName;
  }

  public int getImageWidth() {
    return imageWidth;
  }
  public void setImageWidth(int imageWidth) {
    this.imageWidth = imageWidth;
  }

  public int getImageHeight() {
    return imageHeight;
  }
  public void setImageHeight(int imageHeight) {
    this.imageHeight = imageHeight;
  }

  public int getAudioChannels() {
    return audioChannels;
  }
  public void setAudioChannels(int audioChannels) {
    this.audioChannels = audioChannels;
  }

  public int getPixelFormat() {
    return pixelFormat;
  }
  public void setPixelFormat(int pixelFormat) {
    this.pixelFormat = pixelFormat;
  }

  public int getVideoCodec() {
    return videoCodec;
  }
  public void setVideoCodec(int videoCodec) {
    this.videoCodec = videoCodec;
  }

  public int getVideoBitrate() {
    return videoBitrate;
  }
  public void setVideoBitrate(int videoBitrate) {
    this.videoBitrate = videoBitrate;
  }

  public int getGopSize() {
    return gopSize;
  }
  public void setGopSize(int gopSize) {
    this.gopSize = gopSize;
  }

  public double getFrameRate() {
    return frameRate;
  }
  public void setFrameRate(double frameRate) {
    this.frameRate = frameRate;
  }

  public double getVideoQuality() {
    return videoQuality;
  }
  public void setVideoQuality(double videoQuality) {
    this.videoQuality = videoQuality;
  }

  public String getVideoOption(String key) {
    return videoOptions.get(key);
  }
  public void setVideoOption(String key, String value) {
    videoOptions.put(key, value);
  }

  public int getFrameNumber() {
    return frameNumber;
  }
  public void setFrameNumber(int frameNumber) {
    this.frameNumber = frameNumber;
  }

  public long getTimestamp() {
    return timestamp;
  }
  public void setTimestamp(long timestamp) {
    this.timestamp = timestamp;
  }

  public static class Exception extends java.lang.Exception {
    public Exception(String message) { super(message); }
    public Exception(String message, Throwable cause) { super(message, cause); }
  }

  public abstract void start() throws Exception;
  public abstract void stop() throws Exception;

  public abstract void release() throws Exception;
}
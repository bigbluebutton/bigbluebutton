/*
 * Copyright (C) 2009-2015 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacv;

import java.beans.PropertyEditorSupport;
import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 *
 * @author Samuel Audet
 */
public abstract class FrameGrabber {

    public static final List<String> list = new LinkedList<String>(Arrays.asList(new String[] {
		"DC1394", "FlyCapture", "FlyCapture2", "OpenKinect", "PS3Eye", "VideoInput", "OpenCV", "FFmpeg", "IPCamera"  }));
    public static void init() {
        for (String name : list) {
            try {
                Class<? extends FrameGrabber> c = get(name);
                c.getMethod("tryLoad").invoke(null);
            } catch (Throwable t) { }
        }
    }
    public static Class<? extends FrameGrabber> getDefault() {
        // select first frame grabber that can load and that may have some cameras..
        for (String name : list) {
            try {
                Class<? extends FrameGrabber> c = get(name);
                c.getMethod("tryLoad").invoke(null);
                boolean mayContainCameras = false;
                try {
                    String[] s = (String[])c.getMethod("getDeviceDescriptions").invoke(null);
                    if (s.length > 0) {
                        mayContainCameras = true;
                    }
                } catch (Throwable t) {
                    if (t.getCause() instanceof UnsupportedOperationException) {
                        mayContainCameras = true;
                    }
                }
                if (mayContainCameras) {
                    return c;
                }
            } catch (Throwable t) { }
        }
        return null;
    }
    public static Class<? extends FrameGrabber> get(String className) throws Exception {
        className = FrameGrabber.class.getPackage().getName() + "." + className;
        try {
            return Class.forName(className).asSubclass(FrameGrabber.class);
        } catch (ClassNotFoundException e) {
            String className2 = className + "FrameGrabber";
            try {
                return Class.forName(className2).asSubclass(FrameGrabber.class);
            } catch (ClassNotFoundException ex) {
                throw new Exception("Could not get FrameGrabber class for " + className + " or " + className2, e);
            }
        }
    }

    public static FrameGrabber create(Class<? extends FrameGrabber> c, Class p, Object o) throws Exception {
        Throwable cause = null;
        try {
            return c.getConstructor(p).newInstance(o);
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
        throw new Exception("Could not create new " + c.getSimpleName() + "(" + o + ")", cause);
    }

    public static FrameGrabber createDefault(File deviceFile) throws Exception {
        return create(getDefault(), File.class, deviceFile);
    }
    public static FrameGrabber createDefault(String devicePath) throws Exception {
        return create(getDefault(), String.class, devicePath);
    }
    public static FrameGrabber createDefault(int deviceNumber) throws Exception {
        try {
            return create(getDefault(), int.class, deviceNumber);
        } catch (Exception ex) {
            return create(getDefault(), Integer.class, deviceNumber);
        }
    }

    public static FrameGrabber create(String className, File deviceFile) throws Exception {
        return create(get(className), File.class, deviceFile);
    }
    public static FrameGrabber create(String className, String devicePath) throws Exception {
        return create(get(className), String.class, devicePath);
    }
    public static FrameGrabber create(String className, int deviceNumber) throws Exception {
        try {
            return create(get(className), int.class, deviceNumber);
        } catch (Exception ex) {
            return create(get(className), Integer.class, deviceNumber);
        }
    }

    public static class PropertyEditor extends PropertyEditorSupport {
        @Override public String getAsText() {
            Class c = (Class)getValue();
            return c == null ? "null" : c.getSimpleName().split("FrameGrabber")[0];
        }
        @Override public void setAsText(String s) {
            if (s == null) {
                setValue(null);
            }
            try {
                setValue(get(s));
            } catch (Exception ex) {
                throw new IllegalArgumentException(ex);
            }
        }
        @Override public String[] getTags() {
            return list.toArray(new String[list.size()]);
        }
    }


    public static enum ImageMode {
        COLOR, GRAY, RAW
    }

    public static final long
            SENSOR_PATTERN_RGGB = 0,
            SENSOR_PATTERN_GBRG = (1L << 32),
            SENSOR_PATTERN_GRBG = 1,
            SENSOR_PATTERN_BGGR = (1L << 32) | 1;

    protected int videoStream = -1, audioStream = -1;
    protected String format = null;
    protected int imageWidth = 0, imageHeight = 0, audioChannels = 0;
    protected ImageMode imageMode = ImageMode.COLOR;
    protected long sensorPattern = -1L;
    protected int pixelFormat = -1, videoCodec, videoBitrate = 0;
    protected double aspectRatio = 0, frameRate = 0;
    protected int sampleFormat = 0, audioCodec, audioBitrate = 0, sampleRate = 0;
    protected boolean triggerMode = false;
    protected int bpp = 0;
    protected int timeout = 10000;
    protected int numBuffers = 4;
    protected double gamma = 0.0;
    protected boolean deinterlace = false;
    protected HashMap<String, String> options = new HashMap<String, String>();
    protected HashMap<String, String> videoOptions = new HashMap<String, String>();
    protected HashMap<String, String> audioOptions = new HashMap<String, String>();
    protected HashMap<String, String> metadata = new HashMap<String, String>();
    protected HashMap<String, String> videoMetadata = new HashMap<String, String>();
    protected HashMap<String, String> audioMetadata = new HashMap<String, String>();
    protected int frameNumber = 0;
    protected long timestamp = 0;

    public int getVideoStream() {
        return videoStream;
    }
    public void setVideoStream(int videoStream) {
        this.videoStream = videoStream;
    }

    public int getAudioStream() {
        return audioStream;
    }
    public void setAudioStream(int audioStream) {
        this.audioStream = audioStream;
    }

    public String getFormat() {
        return format;
    }
    public void setFormat(String format) {
        this.format = format;
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

    public ImageMode getImageMode() {
        return imageMode;
    }
    public void setImageMode(ImageMode imageMode) {
        this.imageMode = imageMode;
    }

    public long getSensorPattern() {
        return sensorPattern;
    }
    public void setSensorPattern(long sensorPattern) {
        this.sensorPattern = sensorPattern;
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

    public double getAspectRatio() {
        return aspectRatio;
    }
    public void setAspectRatio(double aspectRatio) {
        this.aspectRatio = aspectRatio;
    }

    public double getFrameRate() {
        return frameRate;
    }
    public void setFrameRate(double frameRate) {
        this.frameRate = frameRate;
    }

    public int getAudioCodec() {
        return audioCodec;
    }
    public void setAudioCodec(int audioCodec) {
        this.audioCodec = audioCodec;
    }

    public int getAudioBitrate() {
        return audioBitrate;
    }
    public void setAudioBitrate(int audioBitrate) {
        this.audioBitrate = audioBitrate;
    }

    public int getSampleFormat() {
        return sampleFormat;
    }
    public void setSampleFormat(int sampleFormat) {
        this.sampleFormat = sampleFormat;
    }

    public int getSampleRate() {
        return sampleRate;
    }
    public void setSampleRate(int sampleRate) {
        this.sampleRate = sampleRate;
    }

    public boolean isTriggerMode() {
        return triggerMode;
    }
    public void setTriggerMode(boolean triggerMode) {
        this.triggerMode = triggerMode;
    }

    public int getBitsPerPixel() {
        return bpp;
    }
    public void setBitsPerPixel(int bitsPerPixel) {
        this.bpp = bitsPerPixel;
    }

    public int getTimeout() {
        return timeout;
    }
    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getNumBuffers() {
        return numBuffers;
    }
    public void setNumBuffers(int numBuffers) {
        this.numBuffers = numBuffers;
    }

    public double getGamma() {
        return gamma;
    }
    public void setGamma(double gamma) {
        this.gamma = gamma;
    }

    public boolean isDeinterlace() {
        return deinterlace;
    }
    public void setDeinterlace(boolean deinterlace) {
        this.deinterlace = deinterlace;
    }

    public String getOption(String key) {
        return options.get(key);
    }
    public void setOption(String key, String value) {
        options.put(key, value);
    }

    public String getVideoOption(String key) {
        return videoOptions.get(key);
    }
    public void setVideoOption(String key, String value) {
        videoOptions.put(key, value);
    }

    public String getAudioOption(String key) {
        return audioOptions.get(key);
    }
    public void setAudioOption(String key, String value) {
        audioOptions.put(key, value);
    }

    public String getMetadata(String key) {
        return metadata.get(key);
    }
    public void setMetadata(String key, String value) {
        metadata.put(key, value);
    }

    public String getVideoMetadata(String key) {
        return videoMetadata.get(key);
    }
    public void setVideoMetadata(String key, String value) {
        videoMetadata.put(key, value);
    }

    public String getAudioMetadata(String key) {
        return audioMetadata.get(key);
    }
    public void setAudioMetadata(String key, String value) {
        audioMetadata.put(key, value);
    }

    public int getFrameNumber() {
        return frameNumber;
    }
    public void setFrameNumber(int frameNumber) throws Exception {
        this.frameNumber = frameNumber;
    }

    public long getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(long timestamp) throws Exception {
        this.timestamp = timestamp;
    }

    public int getLengthInFrames() {
        return 0;
    }
    public long getLengthInTime() {
        return 0;
    }

    public static class Exception extends java.lang.Exception {
        public Exception(String message) { super(message); }
        public Exception(String message, Throwable cause) { super(message, cause); }
    }

    public abstract void start() throws Exception;
    public abstract void stop() throws Exception;
    public abstract void trigger() throws Exception;

    /**
     * Each call to grab stores the new image in the memory address for the previously returned frame. <br/>
     * IE.<br/>
     * <code>
     * grabber.grab() == grabber.grab()
     * </code>
     * <br/>
     * This means that if you need to cache images returned from grab you should {@link Frame#clone()} the
     * returned frame as the next call to grab will overwrite your existing image's memory.
     * <br/>
     * <b>Why?</b><br/>
     * Using this method instead of allocating a new buffer every time a frame
     * is grabbed improves performance by reducing the frequency of garbage collections.
     * Almost no additional heap space is typically allocated per frame.
     *
     * @return The frame returned from the grabber
     * @throws Exception If there is a problem grabbing the frame.
     */
    public abstract Frame grab() throws Exception;
    public Frame grabFrame() throws Exception { return grab(); }
    public abstract void release() throws Exception;

    public void restart() throws Exception {
        stop();
        start();
    }
    public void flush() throws Exception {
        for (int i = 0; i < numBuffers+1; i++) {
            grab();
        }
    }

    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private Future<Void> future = null;
    private Frame delayedFrame = null;
    private long delayedTime = 0;
    public void delayedGrab(final long delayTime) {
        delayedFrame = null;
        delayedTime = 0;
        final long start = System.nanoTime()/1000;
        if (future != null && !future.isDone()) {
            return;
        }
        future = executor.submit(new Callable<Void>() { public Void call() throws Exception {
            do {
                delayedFrame = grab();
                delayedTime = System.nanoTime()/1000 - start;
            } while (delayedTime < delayTime);
            return null;
        }});
    }
    public long getDelayedTime() throws InterruptedException, ExecutionException {
        if (future == null) {
            return 0;
        }
        future.get();
        return delayedTime;
    }
    public Frame getDelayedFrame() throws InterruptedException, ExecutionException {
        if (future == null) {
            return null;
        }
        future.get();
        return delayedFrame;
    }

    public static class Array {
        // declared protected to force users to use createArray(), which
        // can be overridden without changing the calling code...
        protected Array(FrameGrabber[] frameGrabbers) {
            setFrameGrabbers(frameGrabbers);
        }

        private Frame[] grabbedFrames = null;
        private long[] latencies = null;
        private long[] bestLatencies = null;
        private long lastNewestTimestamp = 0;
        private long bestInterval = Long.MAX_VALUE;

        protected FrameGrabber[] frameGrabbers = null;
        public FrameGrabber[] getFrameGrabbers() {
            return frameGrabbers;
        }
        public void setFrameGrabbers(FrameGrabber[] frameGrabbers) {
            this.frameGrabbers = frameGrabbers;
            grabbedFrames = new Frame[frameGrabbers.length];
            latencies = new long[frameGrabbers.length];
            bestLatencies = null;
            lastNewestTimestamp = 0;
        }
        public int size() {
            return frameGrabbers.length;
        }

        public void start() throws Exception {
            for (FrameGrabber f : frameGrabbers) {
                f.start();
            }
        }
        public void stop() throws Exception {
            for (FrameGrabber f : frameGrabbers) {
                f.stop();
            }
        }
        // should be overriden to implement a broadcast trigger...
        public void trigger() throws Exception {
            for (FrameGrabber f : frameGrabbers) {
                if (f.isTriggerMode()) {
                    f.trigger();
                }
            }
        }
        // should be overriden to implement a broadcast grab...
        public Frame[] grab() throws Exception {
            if (frameGrabbers.length == 1) {
                grabbedFrames[0] = frameGrabbers[0].grab();
                return grabbedFrames;
            }

            // assume we sometimes get perfectly synchronized images,
            // so save the best latencies we find as the perfectly
            // synchronized case, so we know what to aim for in
            // cases of missing/dropped frames ...
            long newestTimestamp = 0;
            boolean unsynchronized = false;
            for (int i = 0; i < frameGrabbers.length; i++) {
                grabbedFrames[i] = frameGrabbers[i].grab();
                if (grabbedFrames[i] != null) {
                    newestTimestamp = Math.max(newestTimestamp, frameGrabbers[i].getTimestamp());
                }
                if (frameGrabbers[i].getClass() != frameGrabbers[(i + 1) % frameGrabbers.length].getClass()) {
                    // assume we can't synchronize different types of cameras with each other
                    unsynchronized = true;
                }
            }
            if (unsynchronized) {
                return grabbedFrames;
            }
            for (int i = 0; i < frameGrabbers.length; i++) {
                if (grabbedFrames[i] != null) {
                    latencies[i] = newestTimestamp - Math.max(0, frameGrabbers[i].getTimestamp());
                }
            }
            if (bestLatencies == null) {
                bestLatencies = Arrays.copyOf(latencies, latencies.length);
            } else {
                int sum1 = 0, sum2 = 0;
                for (int i = 0; i < frameGrabbers.length; i++) {
                    sum1 += latencies[i];
                    sum2 += bestLatencies[i];
                }
                if (sum1 < sum2) {
                    bestLatencies = Arrays.copyOf(latencies, latencies.length);
                }
            }

            // we cannot have latencies higher than the time between frames..
            // or something too close to it anyway... 90% is good?
            bestInterval = Math.min(bestInterval, newestTimestamp-lastNewestTimestamp);
            for (int i = 0; i < bestLatencies.length; i++) {
                bestLatencies[i] = Math.min(bestLatencies[i], bestInterval*9/10);
            }

            // try to synchronize by attempting to land within 10% of
            // the bestLatencies looking up to 2 frames ahead ...
            for (int j = 0; j < 2; j++) {
                for (int i = 0; i < frameGrabbers.length; i++) {
                    if (frameGrabbers[i].isTriggerMode() || grabbedFrames[i] == null) {
                        continue;
                    }
                    int latency = (int)(newestTimestamp - Math.max(0, frameGrabbers[i].getTimestamp()));
                    while (latency-bestLatencies[i] > 0.1*bestLatencies[i]) {
                        grabbedFrames[i] = frameGrabbers[i].grab();
                        if (grabbedFrames[i] == null) {
                            break;
                        }
                        latency = (int)(newestTimestamp - Math.max(0, frameGrabbers[i].getTimestamp()));
                        if (latency < 0) {
                            // woops, a camera seems to have dropped a frame somewhere...
                            // bump up the newestTimestamp
                            newestTimestamp = Math.max(0, frameGrabbers[i].getTimestamp());
                            break;
                        }
                    }
                }
            }

//for (int i = 0; i < frameGrabbers.length; i++) {
//    long latency = newestTimestamp - Math.max(0, frameGrabbers[i].getTimestamp());
//    System.out.print(bestLatencies[i] + " " + latency + "  ");
//}
//System.out.println("  " + bestInterval);

            lastNewestTimestamp = newestTimestamp;

            return grabbedFrames;
        }
        public void release() throws Exception {
            for (FrameGrabber f : frameGrabbers) {
                f.release();
            }
        }
    }

    public Array createArray(FrameGrabber[] frameGrabbers) {
        return new Array(frameGrabbers);
    }
}

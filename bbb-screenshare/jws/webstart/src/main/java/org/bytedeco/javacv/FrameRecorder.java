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

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author Samuel Audet
 */
public abstract class FrameRecorder {

    public static final List<String> list = new LinkedList<String>(Arrays.asList(new String[] { "FFmpeg", "OpenCV" }));
    public static void init() {
        for (String name : list) {
            try {
                Class<? extends FrameRecorder> c = get(name);
                c.getMethod("tryLoad").invoke(null);
            } catch (Throwable t) { }
        }
    }
    public static Class<? extends FrameRecorder> getDefault() {
        // select first frame recorder that can load..
        for (String name : list) {
            try {
                Class<? extends FrameRecorder> c = get(name);
                c.getMethod("tryLoad").invoke(null);
                return c;
            } catch (Throwable t) { }
        }
        return null;
    }
    public static Class<? extends FrameRecorder> get(String className) throws Exception {
        className = FrameRecorder.class.getPackage().getName() + "." + className;
        try {
            return Class.forName(className).asSubclass(FrameRecorder.class);
        } catch (ClassNotFoundException e) {
            String className2 = className + "FrameRecorder";
            try {
                return Class.forName(className2).asSubclass(FrameRecorder.class);
            } catch (ClassNotFoundException ex) {
                throw new Exception("Could not get FrameRecorder class for " + className + " or " + className2, e);
            }
        }
    }

    public static FrameRecorder create(Class<? extends FrameRecorder> c, Class p, Object o, int w, int h) throws Exception {
        Throwable cause = null;
        try {
            return (FrameRecorder)c.getConstructor(p, int.class, int.class).newInstance(o, w, h);
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

    public static FrameRecorder createDefault(File file, int width, int height) throws Exception {
        return create(getDefault(), File.class, file, width, height);
    }
    public static FrameRecorder createDefault(String filename, int width, int height) throws Exception {
        return create(getDefault(), String.class, filename, width, height);
    }

    public static FrameRecorder create(String className, File file, int width, int height) throws Exception {
        return create(get(className), File.class, file, width, height);
    }
    public static FrameRecorder create(String className, String filename, int width, int height) throws Exception {
        return create(get(className), String.class, filename, width, height);
    }

    protected String format, videoCodecName, audioCodecName;
    protected int imageWidth, imageHeight, audioChannels;
    protected int pixelFormat, videoCodec, videoBitrate, gopSize = -1;
    protected double aspectRatio, frameRate, videoQuality = -1;
    protected int sampleFormat, audioCodec, audioBitrate, sampleRate;
    protected double audioQuality = -1;
    protected boolean interleaved;
    protected HashMap<String, String> options = new HashMap<String, String>();
    protected HashMap<String, String> videoOptions = new HashMap<String, String>();
    protected HashMap<String, String> audioOptions = new HashMap<String, String>();
    protected HashMap<String, String> metadata = new HashMap<String, String>();
    protected HashMap<String, String> videoMetadata = new HashMap<String, String>();
    protected HashMap<String, String> audioMetadata = new HashMap<String, String>();
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

    public String getAudioCodecName() {
        return audioCodecName;
    }
    public void setAudioCodecName(String audioCodecName) {
        this.audioCodecName = audioCodecName;
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

    public double getVideoQuality() {
        return videoQuality;
    }
    public void setVideoQuality(double videoQuality) {
        this.videoQuality = videoQuality;
    }

    public int getSampleFormat() {
        return sampleFormat;
    }
    public void setSampleFormat(int sampleFormat) {
        this.sampleFormat = sampleFormat;
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

    public int getSampleRate() {
        return sampleRate;
    }
    public void setSampleRate(int sampleRate) {
        this.sampleRate = sampleRate;
    }

    public double getAudioQuality() {
        return audioQuality;
    }
    public void setAudioQuality(double audioQuality) {
        this.audioQuality = audioQuality;
    }

    public boolean isInterleaved() {
        return interleaved;
    }
    public void setInterleaved(boolean interleaved) {
        this.interleaved = interleaved;
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
    public abstract void record(Frame frame) throws Exception;
    public abstract void release() throws Exception;
}

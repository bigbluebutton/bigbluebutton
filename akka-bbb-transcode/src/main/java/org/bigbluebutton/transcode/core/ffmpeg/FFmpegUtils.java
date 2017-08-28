package org.bigbluebutton.transcode.core.ffmpeg;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.bigbluebutton.transcode.core.TranscodersService;

public class FFmpegUtils {

    private static final String LOW_QUALITY = "160x120";
    private static final String MEDIUM_QUALITY = "320x240";
    private static final String HIGH_QUALITY = "640x480";

    public static final String VIDEO_MODULE = "video";
    public static final String DESKSHARE_MODULE = "deskShare";

    public static final String ROTATE_RIGHT = "rotate_right";
    public static final String ROTATE_LEFT = "rotate_left";
    public static final String ROTATE_UPSIDE_DOWN = "rotate_left/rotate_left";

    public static final String H263PREFIX = "h263";

    public static String defaultVideoWidth;
    public static String defaultVideoHeight;

    public static final String GLOBAL_VIDEO_STREAM_NAME_PREFIX = "sip_";
    public static final String VIDEOCONF_LOGO_STREAM_NAME_PREFIX = "video_conf_";
    private static final String sdpVideoFullPath = "/tmp/"+GLOBAL_VIDEO_STREAM_NAME_PREFIX; //when changed , must also change VideoApplication.java in bbb-video
    private static OpenOption[] fileOptions = new OpenOption[] {StandardOpenOption.CREATE,StandardOpenOption.WRITE};
    public static String ffmpegPath = TranscodersService.ffmpegPath();
    public static String ffprobePath = TranscodersService.ffprobePath();
    public static String videoconfLogoPath = TranscodersService.videoconfLogoImagePath();
    private static boolean enableUserVideoSubtitle = TranscodersService.enableUserVideoSubtitle();

    public static String createSDPVideoFile(String userId, String localIpAddress, String localVideoPort, String codecName, String codecId, String sampleRate, String voiceconf) {
        Path sdpVideoPath = FileSystems.getDefault().getPath(sdpVideoFullPath + voiceconf+".sdp");

        String sdp = "v=0\r\n"
                       + "o=" + userId + " 0 0 IN IP4 " + localIpAddress + "\r\n"
                       + "s=Session SIP/SDP\r\n"
                       + "c=IN IP4 " + localIpAddress + "\r\n"
                       + "t=0 0\r\n"
                       + "m=video " + localVideoPort + " RTP/AVPF " + codecId +"\r\n"
                       + "a=rtpmap:" + codecId + " " + codecName + "/" + sampleRate + "/1\r\n"
                       + "a=fmtp:96\r\n"
                       + "a=rtcp-fb:" + codecId + " ccm fir \r\n"
                       + "a=rtcp-fb:" + codecId + " nack \r\n"
                       + "a=rtcp-fb:" + codecId + " nack pli \r\n"
                       + "a=rtcp-fb:" + codecId + " goog-remb \r\n";

        Charset charset = Charset.forName("US-ASCII");
        try {
            BufferedWriter writer = Files.newBufferedWriter(sdpVideoPath,charset,fileOptions);
            writer.write(sdp, 0, sdp.length());
            writer.close();
            System.out.println("SDP video file created at: "+sdpVideoPath.toString());
        } catch (IOException x) {
            System.out.println("Failed to create SDP video file: "+sdpVideoPath.toString());
        }

        return (sdpVideoPath==null)?null:sdpVideoPath.toString();
    }

    public static void removeSDPVideoFile(String voiceconf) {
        Path sdpVideoPath = FileSystems.getDefault().getPath(sdpVideoFullPath +voiceconf+".sdp");
        try {
            Files.deleteIfExists(sdpVideoPath);
        } catch (IOException e) {
            System.out.println("Failed to remove SDP video file: "+sdpVideoPath.toString());
        }
    }

    public String getSdpVideoPath(String voiceconf) {
        return sdpVideoFullPath+voiceconf+".sdp";
    }

    public boolean sdpVideoExists(String sdpFilePath) {
        return fileExists(sdpFilePath);
    }

    private boolean fileExists(String filePath) {
        if(filePath == null || filePath.isEmpty())
           return false;

        return new File(filePath).isFile();
    }

    public boolean isVideoConfLogoStream(String videoStreamName) {
        return ((videoStreamName != null) && (videoStreamName.startsWith(VIDEOCONF_LOGO_STREAM_NAME_PREFIX)));
    }

    public void setFfmpegPath(String ffPath) {
        System.out.println("Trying to set the ffmpeg path to: " + ffPath);

        if(ffmpegExists(ffPath)) {
            ffmpegPath = ffPath;
            System.out.println("ffmpeg path set to: " + ffmpegPath);
         }
         else
            System.out.println("****Could NOT set " + ffPath + " as the ffmpeg path");
     }

     public boolean ffmpegExists(String ffPath) {
         return fileExists(ffPath);
     }

    public static boolean isUserVideoSubtitleEnabled(){
        return enableUserVideoSubtitle;
    }

    public boolean videoconfLogoExists(String filePath) {
        return fileExists(filePath);
    }

    private static void validateResolution(String resolution) {
        System.out.println("Validating sip video resolution: " + resolution);
        switch(resolution) {
            case LOW_QUALITY:
            case MEDIUM_QUALITY:
            case HIGH_QUALITY: parseResolution(resolution);
                               break;
            //using the default resolution
            default: System.out.println("****The resolution set in bigbluebutton-sip.properties is invalid. Using the default resolution.");
                     parseResolution(MEDIUM_QUALITY);
        }
    }

    private static void parseResolution(String resolution) {
        String[] dimensions = resolution.split("x");
        defaultVideoWidth = dimensions[0];
        defaultVideoHeight = dimensions[1];
        System.out.println("Video Resolution is " + defaultVideoWidth + "x" + defaultVideoHeight);
    }

    public static String getVideoWidth() {
        System.out.println("Getting video width: " + defaultVideoWidth + " (Resolution is " + defaultVideoWidth + "x" + defaultVideoHeight + ")");
        return defaultVideoWidth;
    }

    public static String getVideoHeight() {
        System.out.println("Getting video height: " + defaultVideoHeight + " (Resolution is " + defaultVideoWidth + "x" + defaultVideoHeight + ")");
        return defaultVideoHeight;
    }
}

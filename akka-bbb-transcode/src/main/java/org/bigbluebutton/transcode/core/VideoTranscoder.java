
package org.bigbluebutton.transcode.core;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bigbluebutton.transcode.core.ffprobe.FFProbeCommand;
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegCommand;
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegConstants;
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegUtils;
import org.bigbluebutton.transcode.core.processmonitor.ProcessMonitor;
import org.bigbluebutton.transcode.core.processmonitor.ProcessMonitorObserver;
import org.bigbluebutton.transcode.util.Constants;

import akka.actor.UntypedActor;
import akka.actor.ActorRef;
import akka.actor.Props;
import akka.japi.Creator;
import org.bigbluebutton.transcode.api.InternalMessage;
import org.bigbluebutton.transcode.api.DestroyVideoTranscoderRequest;
import org.bigbluebutton.transcode.api.DestroyVideoTranscoderReply;
import org.bigbluebutton.transcode.api.RestartVideoTranscoderRequest;
import org.bigbluebutton.transcode.api.RestartVideoTranscoderReply;
import org.bigbluebutton.transcode.api.StartVideoProbingRequest;
import org.bigbluebutton.transcode.api.StartVideoProbingReply;
import org.bigbluebutton.transcode.api.StartVideoTranscoderRequest;
import org.bigbluebutton.transcode.api.StartVideoTranscoderReply;
import org.bigbluebutton.transcode.api.StopVideoTranscoderRequest;
import org.bigbluebutton.transcode.api.StopVideoTranscoderReply;
import org.bigbluebutton.transcode.api.UpdateVideoTranscoderRequest;
import org.bigbluebutton.transcode.api.UpdateVideoTranscoderReply;
import org.bigbluebutton.transcode.api.TranscodingFinishedSuccessfully;
import org.bigbluebutton.transcode.api.TranscodingFinishedUnsuccessfully;

public class VideoTranscoder extends UntypedActor implements ProcessMonitorObserver {

    public static enum Type{
        TRANSCODE_RTP_TO_RTMP,
        TRANSCODE_RTMP_TO_RTP,
        TRANSCODE_FILE_TO_RTP,
        TRANSCODE_FILE_TO_RTMP,
        TRANSCODE_H264_TO_H263,
        TRANSCODE_ROTATE_RIGHT,
        TRANSCODE_ROTATE_LEFT,
        TRANSCODE_ROTATE_UPSIDE_DOWN,
        PROBE_RTMP
    };
    public static enum Status{RUNNING, STOPPED, UPDATING}
    public static final String VIDEO_CONF_LOGO_PATH = FFmpegUtils.videoconfLogoPath;
    public static final String FFMPEG_PATH = FFmpegUtils.ffmpegPath;
    public static final String FFPROBE_PATH = FFmpegUtils.ffprobePath;

    //if ffmpeg restarts 5 times in less than 5 seconds, we will not restart it anymore
    //this is to prevent a infinite loop of ffmpeg restartings
    private static final int MAX_RESTARTINGS_NUMBER = 5;
    private static final long MIN_RESTART_TIME = 5000; //5 seconds
    private int currentFFmpegRestartNumber = 0;
    private long lastFFmpegRestartTime = 0;

    private ActorRef parentActor;
    private Type type;
    private Status status = Status.STOPPED;
    private ProcessMonitor ffmpegProcessMonitor;
    private ProcessMonitor ffprobeProcessMonitor;
    private FFmpegCommand ffmpeg;
    private String transcoderId;
    private String username;
    private String callername; //used to create rtp-> (any) SDP
    private String videoStreamName;
    private String input;
    private String outputLive;
    private String output; //output of transcoder
    private String meetingId;
    private String voiceBridge;
    private String sourceIp;
    private String destinationIp;
    private String localVideoPort;
    private String remoteVideoPort;
    private String sdpPath;
    private String sourceModule;
    private VideoTranscoderObserver observer;
    private String globalVideoWidth = "640";// get this from properties (Stored in FFmpegUtils)
    private String globalVideoHeight = "480";// get this from properties
    public static final String FFMPEG_NAME = "FFMPEG";
    public static final String FFPROBE_NAME = "FFPROBE";

    public static Props props(final ActorRef parentActor, final String meetingId, final String transcoderId, final Map<String,String> params) {
        return Props.create(new Creator<VideoTranscoder>() {
          private static final long serialVersionUID = 1L;

          @Override
          public VideoTranscoder create() throws Exception {
            return new VideoTranscoder(parentActor, meetingId, transcoderId, params);
          }
        });
    }

    @Override
    public void onReceive(Object msg) {
        if (msg instanceof StartVideoTranscoderRequest) {
            start();
        } else if (msg instanceof StopVideoTranscoderRequest) {
            stop();
        } else if (msg instanceof UpdateVideoTranscoderRequest) {
            UpdateVideoTranscoderRequest uvtr = (UpdateVideoTranscoderRequest) msg;
            update(uvtr.getParams());
        } else if (msg instanceof DestroyVideoTranscoderRequest) {
            destroyTranscoder();
        } else if (msg instanceof RestartVideoTranscoderRequest) {
            restart();
        } else if (msg instanceof StartVideoProbingRequest) {
            probeVideoStream();
        }
    }

    private void stopActor() {
        if (context() != null)
            context().stop(getSelf());
    }

    private void sendMessage(InternalMessage msg) {
        if ((parentActor != null) && (msg != null))
            parentActor.tell(msg,getSelf());
    }

    public VideoTranscoder(ActorRef parentActor, String meetingId, String transcoderId, Map<String,String> params){
        this.parentActor = parentActor;
        this.meetingId = meetingId;
        this.transcoderId = transcoderId;
        if (params != null)
            switch (params.get(Constants.TRANSCODER_TYPE)){
                case Constants.TRANSCODE_RTP_TO_RTMP:
                    this.type = Type.TRANSCODE_RTP_TO_RTMP;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.localVideoPort = params.get(Constants.LOCAL_VIDEO_PORT);
                    this.remoteVideoPort = params.get(Constants.REMOTE_VIDEO_PORT);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.voiceBridge = params.get(Constants.VOICE_CONF);
                    this.callername  = params.get(Constants.CALLERNAME);
                    break;

                case Constants.TRANSCODE_RTMP_TO_RTP:
                    this.type = Type.TRANSCODE_RTMP_TO_RTP;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.localVideoPort = params.get(Constants.LOCAL_VIDEO_PORT);
                    this.remoteVideoPort = params.get(Constants.REMOTE_VIDEO_PORT);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.voiceBridge = params.get(Constants.VOICE_CONF);
                    this.callername  = params.get(Constants.CALLERNAME);
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                case Constants.TRANSCODE_FILE_TO_RTP:
                    this.type = Type.TRANSCODE_FILE_TO_RTP;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.localVideoPort = params.get(Constants.LOCAL_VIDEO_PORT);
                    this.remoteVideoPort = params.get(Constants.REMOTE_VIDEO_PORT);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.voiceBridge = params.get(Constants.VOICE_CONF);
                    this.callername  = params.get(Constants.CALLERNAME);
                    break;

                case Constants.TRANSCODE_FILE_TO_RTMP:
                    this.type = Type.TRANSCODE_FILE_TO_RTMP;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.localVideoPort = params.get(Constants.LOCAL_VIDEO_PORT);
                    this.remoteVideoPort = params.get(Constants.REMOTE_VIDEO_PORT);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.voiceBridge = params.get(Constants.VOICE_CONF);
                    this.callername  = params.get(Constants.CALLERNAME);
                    break;

                case Constants.TRANSCODE_H264_TO_H263:
                    this.type = Type.TRANSCODE_H264_TO_H263;
                    this.sourceModule = params.get(Constants.MODULE);
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                case Constants.TRANSCODE_ROTATE_RIGHT:
                    this.type = Type.TRANSCODE_ROTATE_RIGHT;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                case Constants.TRANSCODE_ROTATE_LEFT:
                    this.type = Type.TRANSCODE_ROTATE_LEFT;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                case Constants.TRANSCODE_ROTATE_UPSIDE_DOWN:
                    this.type = Type.TRANSCODE_ROTATE_UPSIDE_DOWN;
                    this.sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    this.destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                case Constants.PROBE_RTMP:
                    this.type = Type.PROBE_RTMP;
                    this.videoStreamName = params.get(Constants.INPUT);
                    break;

                default:
                    break;
            }
    }

    private synchronized void start() {
        switch (status){
            case RUNNING:
                System.out.println("  > Transcoder already running, sending it's output");
                break;
            case UPDATING:
                System.out.println("  > Transcoder is being updated, returning it's current output");
                break;
            default:
                status = Status.RUNNING;
                startTranscoder();
                break;
        }
        sendMessage(new StartVideoTranscoderReply(meetingId, transcoderId, output));
    }

    private boolean startTranscoder(){
        if ((ffmpegProcessMonitor != null) &&(ffmpeg != null)) {
            return false;
        }

        String[] command;

        if(!canFFmpegRun()) {
            //log.debug("***TRANSCODER WILL NOT START: ffmpeg cannot run");
            return false;
        }

        //log.debug("Starting Video Transcoder...");

        switch(type){
            case TRANSCODE_RTMP_TO_RTP:

                if(!areRtmpToRtpParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: Rtmp to Rtp Parameters are invalid");
                    return false;
                }


                input = "rtmp://" + sourceIp + "/video/" + meetingId + "/"
                        + videoStreamName + " live=1"; //the full input is composed by the videoStreamName
                outputLive = "rtp://" + destinationIp + ":" + remoteVideoPort + "?localport=" + localVideoPort;
                output = "";

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.addRtmpInputConnectionParameter(meetingId);
                ffmpeg.addRtmpInputConnectionParameter("transcoder-"+transcoderId);
                ffmpeg.setFrameRate(15);
                ffmpeg.setBufSize(1024);
                ffmpeg.setGop(1); //MCU compatibility
                ffmpeg.setCodec("libopenh264");
                ffmpeg.setMaxRate(1024);
                ffmpeg.setSliceMode("dyn");
                ffmpeg.setMaxNalSize("1024");
                ffmpeg.setRtpFlags("h264_mode0"); //RTP's packetization mode 0
                ffmpeg.setProfile("baseline");
                ffmpeg.setFormat("rtp");
                ffmpeg.setPayloadType(FFmpegConstants.CODEC_ID_H264);
                ffmpeg.setLoglevel("verbose");
                ffmpeg.setOutput(outputLive);
                ffmpeg.setAnalyzeDuration("1000"); // 1ms
                ffmpeg.setProbeSize("32"); // 1ms
                System.out.println("Preparing FFmpeg process monitor");
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_RTP_TO_RTMP:

                if(!areRtpToRtmpParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: Rtp to Rtmp Parameters are invalid");
                    return false;
                }

                //Create SDP FILE
                sdpPath = FFmpegUtils.createSDPVideoFile(callername, sourceIp, localVideoPort, FFmpegConstants.CODEC_NAME_H264, FFmpegConstants.CODEC_ID_H264, FFmpegConstants.SAMPLE_RATE_H264, voiceBridge);
                input = sdpPath;

                //Generate video stream name
                videoStreamName = generateVideoStreamName(type);
                // TODO make stream path dynamic by turning it into a param
                outputLive = "rtmp://" + destinationIp + "/video-broadcast/" + meetingId + "/"
                        + videoStreamName+" live=1";
                output = videoStreamName;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setProtocolWhitelist("file,udp,rtp");
                ffmpeg.setLoglevel("quiet");
                ffmpeg.setOutput(outputLive);
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter("transcoder-"+transcoderId);
                ffmpeg.setCodec("copy");
                ffmpeg.setFormat("flv");
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_FILE_TO_RTP:

                if(!areFileToRtpParametersValid())  {
                    System.out.println("  > ***TRANSCODER WILL NOT START: File to Rtp Parameters are invalid");
                    return false;
                }

                input = VIDEO_CONF_LOGO_PATH;
                outputLive = "rtp://" + destinationIp + ":" + remoteVideoPort + "?localport=" + localVideoPort;
                output = "";
                username = callername;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setIgnoreLoop(0);
                ffmpeg.setInput(input);
                ffmpeg.setInputLive(true);
                ffmpeg.addCustomParameter("-s", globalVideoWidth+"x"+globalVideoHeight);
                ffmpeg.setFrameRate(15);
                ffmpeg.setPayloadType(FFmpegConstants.CODEC_ID_H264);
                ffmpeg.setLoglevel("quiet");
                if (FFmpegUtils.isUserVideoSubtitleEnabled())
                    ffmpeg.addCustomParameter("-vf","drawtext=fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:text="+username+":x="+globalVideoWidth+"-tw-20:y="+globalVideoHeight+"-th-20:fontcolor=white@0.9:shadowcolor=black:shadowx=2:shadowy=2:fontsize=20");
                ffmpeg.setGop(1);
                ffmpeg.setCodec("libopenh264");
                ffmpeg.setSliceMode("dyn");
                ffmpeg.setMaxNalSize("1024");
                ffmpeg.setRtpFlags("h264_mode0"); //RTP's packetization mode 0
                ffmpeg.setProfile("baseline");
                ffmpeg.setFormat("rtp");
                ffmpeg.setOutput(outputLive);
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_FILE_TO_RTMP:
                if(!areFileToRtmpParametersValid()) {
                    System.out.println("***TRANSCODER WILL NOT START: File to Rtmp Parameters are invalid");
                    return false;
                }
                videoStreamName = generateVideoStreamName(type);
                input = VIDEO_CONF_LOGO_PATH;
                outputLive = "rtmp://" + destinationIp + "/video/" + meetingId + "/"
                        + videoStreamName+" live=1";
                output = videoStreamName;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setInputLive(true);
                ffmpeg.setFrameSize("640x480");
                ffmpeg.setIgnoreLoop(0);
                ffmpeg.setFormat("flv");
                ffmpeg.setLoglevel("verbose");
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter("transcoder-"+transcoderId);
                ffmpeg.setOutput(outputLive);
                ffmpeg.setCodec("libopenh264");
                ffmpeg.setProfile("baseline");
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_H264_TO_H263:
                if(!areH264ToH263ParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: H264 to H263 parameters are invalid");
                    return false;
                }

                switch(sourceModule) {
                    case FFmpegUtils.VIDEO_MODULE:
                        input = "rtmp://" + sourceIp + "/" + sourceModule + "/" + meetingId + "/" + videoStreamName + " live=1";
                        outputLive = "rtmp://" + destinationIp + "/" + sourceModule + "/" + meetingId + "/" + FFmpegUtils.H263PREFIX + "/" + videoStreamName;
                        output = videoStreamName;
                        break;
                    case FFmpegUtils.DESKSHARE_MODULE:
                        input = "rtmp://" + sourceIp + "/" + sourceModule + "/" + meetingId + " live=1";
                        outputLive = "rtmp://" + destinationIp + "/" + sourceModule + "/" + FFmpegUtils.H263PREFIX + "/" + meetingId;
                        output = meetingId;
                        break;
                    default:
                        System.out.println("  > ***TRANSCODER WILL NOT START: Unrecognized module: " + sourceModule);
                }

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setCodec("flv1"); // Sorensen H263
                ffmpeg.setFormat("flv");
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter(transcoderId);
                ffmpeg.setOutput(outputLive);
                ffmpeg.setLoglevel("quiet");
                ffmpeg.setAnalyzeDuration("10000"); // 10ms
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_ROTATE_RIGHT:
                if(!areRotateParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: Rotate parameters are invalid");
                    return false;
                }

                input = "rtmp://" + sourceIp + "/video/" + meetingId + "/" + FFmpegUtils.ROTATE_RIGHT + "/" + videoStreamName + " live=1";
                outputLive = "rtmp://" + destinationIp + "/video/" + meetingId + "/" + videoStreamName;
                output = videoStreamName;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setFormat("flv");
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter(transcoderId);
                ffmpeg.setOutput(outputLive);
                ffmpeg.setLoglevel("warning");
                ffmpeg.setRotation(FFmpegUtils.ROTATE_RIGHT);
                ffmpeg.setAnalyzeDuration("10000"); // 10ms
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_ROTATE_LEFT:
                if(!areRotateParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: Rotate parameters are invalid");
                    return false;
                }

                input = "rtmp://" + sourceIp + "/video/" + meetingId + "/" + FFmpegUtils.ROTATE_LEFT + "/" + videoStreamName + " live=1";
                outputLive = "rtmp://" + destinationIp + "/video/" + meetingId + "/" + videoStreamName;
                output = videoStreamName;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setFormat("flv");
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter(transcoderId);
                ffmpeg.setOutput(outputLive);
                ffmpeg.setLoglevel("warning");
                ffmpeg.setRotation(FFmpegUtils.ROTATE_LEFT);
                ffmpeg.setAnalyzeDuration("10000"); // 10ms
                command = ffmpeg.getFFmpegCommand(true);
                break;

            case TRANSCODE_ROTATE_UPSIDE_DOWN:
                if(!areRotateParametersValid()) {
                    System.out.println("  > ***TRANSCODER WILL NOT START: Rotate parameters are invalid");
                    return false;
                }

                input = "rtmp://" + sourceIp + "/video/" + meetingId + "/" + FFmpegUtils.ROTATE_UPSIDE_DOWN + "/" + videoStreamName + " live=1";
                outputLive = "rtmp://" + destinationIp + "/video/" + meetingId + "/" + videoStreamName;
                output = videoStreamName;

                ffmpeg = new FFmpegCommand();
                ffmpeg.setFFmpegPath(FFMPEG_PATH);
                ffmpeg.setInput(input);
                ffmpeg.setFormat("flv");
                ffmpeg.addRtmpOutputConnectionParameter(meetingId);
                ffmpeg.addRtmpOutputConnectionParameter(transcoderId);
                ffmpeg.setOutput(outputLive);
                ffmpeg.setLoglevel("warning");
                ffmpeg.setRotation(FFmpegUtils.ROTATE_UPSIDE_DOWN);
                ffmpeg.setAnalyzeDuration("10000"); // 10ms
                command = ffmpeg.getFFmpegCommand(true);
                break;

            default: command = null;
        }

        if(command != null){
            this.ffmpegProcessMonitor = new ProcessMonitor(command,FFMPEG_NAME);
            ffmpegProcessMonitor.setProcessMonitorObserver(this);
            ffmpegProcessMonitor.start();
            return true;
        }
        return false;
    }

    private synchronized void stop(){
        status = Status.STOPPED;
        stopTranscoder();
        sendMessage(new StopVideoTranscoderReply(meetingId, transcoderId));
    }

    private void stopTranscoder() {
        if (ffmpegProcessMonitor != null) {
            ffmpegProcessMonitor.forceDestroy();
            clearData();
        }
    }

    /**
     * Clear monitor and ffmpeg data.
     */
    private void clearData() {
        ffmpegProcessMonitor = null;
        ffmpeg = null;
        switch (type) {
            case TRANSCODE_RTP_TO_RTMP:
                FFmpegUtils.removeSDPVideoFile(voiceBridge);
            break;
            default:
        }
    }

    private synchronized void destroyTranscoder() {
        status = Status.STOPPED;
        stopTranscoder();
        sendMessage(new DestroyVideoTranscoderReply(meetingId, transcoderId));
        stopActor();
    }

    private synchronized void update(Map<String,String> params) {
        switch (status) {
            case UPDATING:
                status = Status.RUNNING;
                startTranscoder();
                sendMessage(new UpdateVideoTranscoderReply(meetingId, transcoderId, output));
                break;
            default:
                if (params != null) {
                    String transcoderType = params.get(Constants.TRANSCODER_TYPE);
                    String input = params.get(Constants.INPUT);
                    String sourceIp = params.get(Constants.LOCAL_IP_ADDRESS);
                    String localVideoPort = params.get(Constants.LOCAL_VIDEO_PORT);
                    String remoteVideoPort = params.get(Constants.REMOTE_VIDEO_PORT);
                    String destinationIp = params.get(Constants.DESTINATION_IP_ADDRESS);

                    setType(transcoderType);
                    setVideoStreamName(input);
                    setSourceIp(sourceIp);
                    setLocalVideoPort(localVideoPort);
                    setRemoteVideoPort(remoteVideoPort);
                    setDestinationIp(destinationIp);

                    status = Status.UPDATING; //mark update status
                    stopTranscoder();
                }
                break;
        }
    }


    private synchronized void restart() {
        if (!maxRestartsReached()) {
            System.out.println(" > [Restart] Starting current transcoder " + transcoderId);
            status = Status.RUNNING;
            lastFFmpegRestartTime = System.currentTimeMillis();
            clearData();
            startTranscoder();
            sendMessage(new RestartVideoTranscoderReply(meetingId, transcoderId, output));
        }
    }

    private boolean maxRestartsReached() {
        currentFFmpegRestartNumber++;
        if(currentFFmpegRestartNumber == MAX_RESTARTINGS_NUMBER) {
           long timeInterval = System.currentTimeMillis() - lastFFmpegRestartTime;
           if(timeInterval <= MIN_RESTART_TIME) {
              System.out.println("  > Max number of ffmpeg restartings reached in " + timeInterval + " miliseconds for " + transcoderId + "'s Video Transcoder." +
                        " Not restating it anymore.");
              return true;
           }
           else
              currentFFmpegRestartNumber = 0;
        }
        return false;
    }

    public synchronized void transcodingFinishedSuccessfully() {
        sendMessage(new TranscodingFinishedSuccessfully(meetingId, transcoderId)); //tell parent for clean up
        stopActor();
    }

    public synchronized void probeVideoStream(){
        if (ffmpegProcessMonitor != null) {
            FFProbeCommand ffprobe = new FFProbeCommand(outputLive);
            String command[];

            ffprobe.setFFprobepath(FFPROBE_PATH);
            ffprobe.setInput(outputLive);
            ffprobe.setAnalyzeDuration("1");
            ffprobe.setShowStreams();
            ffprobe.setLoglevel("quiet");
            ffprobe.getFFprobeCommand(true);

            command = ffprobe.getFFprobeCommand(true);
            if(command != null){
                this.ffprobeProcessMonitor = new ProcessMonitor(command,FFPROBE_NAME);
                ffprobeProcessMonitor.setProcessMonitorObserver(this);
                ffprobeProcessMonitor.start();
            }
        } else {
        }
    }

    private void updateGlobalStreamName(String streamName){
        this.videoStreamName = streamName;
        String outputLive;
        String[] newCommand;
        outputLive = "rtmp://" + destinationIp + "/video/" + meetingId + "/"
                + this.videoStreamName+" live=1";
        ffmpeg.setOutput(outputLive); //update ffmpeg's output
        newCommand = ffmpeg.getFFmpegCommand(true);
        ffmpegProcessMonitor.setCommand(newCommand); //update ffmpeg command
    }

    public void setVideoTranscoderObserver(VideoTranscoderObserver observer){
        this.observer = observer;
    }

    @Override
    public void handleProcessFinishedUnsuccessfully(String processMonitorName,String processOutput) {
        if ((processMonitorName == null)|| processMonitorName.isEmpty()){
            return;
        }

        if (FFMPEG_NAME.equals(processMonitorName)){
            sendMessage(new TranscodingFinishedUnsuccessfully(meetingId, transcoderId));
        }else if (FFPROBE_NAME.equals(processMonitorName)){
            System.out.println("  > Failed to probe video stream " + outputLive);
        }
    }

    @Override
    public void handleProcessFinishedWithSuccess(String processMonitorName, String processOutput) {
        if ((processMonitorName == null)|| processMonitorName.isEmpty()) {
            System.out.println("  > Can't handle process process monitor finishing with success: UNKNOWN PROCESS");
            return;
        }

        if (FFMPEG_NAME.equals(processMonitorName)){
            switch (status) {
                case RUNNING:
                    System.out.println("  > Transcoder finished with success but wasn't closed by the user " + transcoderId + ". Informing parentActor");
                    transcodingFinishedSuccessfully();
                    break;
                case STOPPED:
                    System.out.println("  > Transcoder closed by the user. Finished with success");
                    break;
                case UPDATING:
                    update(null);
                    break;
                default:
                    break;
            }
        }
        else if (FFPROBE_NAME.equals(processMonitorName)){
            String ffprobeOutput = processOutput;
            Map<String,String> ffprobeData = parseFFprobeOutput(ffprobeOutput);
            sendMessage(new StartVideoProbingReply(meetingId, transcoderId, ffprobeData));
        }else{
            System.out.println("Can't handle process monitor finishing with success: UNKNOWN PROCESS");
        }
    }

    public Map<String,String> parseFFprobeOutput(String ffprobeOutput){
        Pattern pattern = Pattern.compile("(.*)=(.*)");
        Map<String, String> ffprobeResult = new HashMap<String, String>();

        BufferedReader buf = new BufferedReader(new StringReader(ffprobeOutput));
        String line = null;
        try {
            while( (line=buf.readLine()) != null){
                Matcher matcher = pattern.matcher(line);
                if(matcher.matches()) {
                    ffprobeResult.put(matcher.group(1), matcher.group(2));
                }
            }
        } catch (IOException e){
            //log.debug("Error when parsing FFprobe's output");
        }
        return ffprobeResult;
    }


    public boolean canFFmpegRun() {
        //log.debug("Checking if FFmpeg can run...");
        return validateIps() && isFFmpegPathValid();
    }

    public boolean validateIps(){
        if ((sourceIp == null || sourceIp.isEmpty())
            && (type == Type.TRANSCODE_RTMP_TO_RTP))
            return false;

        if ((destinationIp == null || destinationIp.isEmpty())
            && (type == Type.TRANSCODE_FILE_TO_RTMP
                || type == Type.TRANSCODE_FILE_TO_RTP
                || type == Type.TRANSCODE_RTMP_TO_RTP
                || type == Type.TRANSCODE_FILE_TO_RTP))
            return false;

        return true;
    }

    public boolean isFFmpegPathValid() {
        /*if (!GlobalCall.ffmpegExists(FFMPEG_PATH)) {
            //log.debug("***FFMPEG DOESN'T EXIST: check the FFMPEG path in bigbluebutton-sip.properties");
            return false;
        }*/

        return true;
    }

    public boolean areRotateParametersValid() {
        // TODO: Check parameters
        return true;
    }

    public boolean areH264ToH263ParametersValid() {
        // TODO: Check parameters
        return true;
    }

    public boolean areRtmpToRtpParametersValid() {
        //log.debug("Checking Rtmp to Rtp Transcoder Parameters...");

        if(meetingId == null || meetingId.isEmpty()) {
           //log.debug("meetingId is null or empty");
           return false;
        }

        if(videoStreamName == null || videoStreamName.isEmpty()) {
           //log.debug("videoStreamName is null or empty");
           return false;
        }

        return areVideoPortsValid();
    }

    public boolean areRtpToRtmpParametersValid() {
        //log.debug("Checking Rtp to Rtmp Transcoder Parameters...");

        if(meetingId == null || meetingId.isEmpty()) {
           //log.debug("meetingId is null or empty");
           return false;
        }

        return isSdpPathValid();
    }

    public boolean areFileToRtpParametersValid() {
        //log.debug("Checking File to Rtp Transcoder Parameters...");
        return areVideoPortsValid() && isVideoConfLogoValid();
    }

    public boolean areFileToRtmpParametersValid() {
        //log.debug("Checking File to Rtmp Transcoder Parameters...");

        if(meetingId == null || meetingId.isEmpty()) {
           //log.debug("meetingId is null or empty");
           return false;
        }

        return isVideoConfLogoValid();
    }

    public boolean areVideoPortsValid() {
        if(localVideoPort == null || localVideoPort.isEmpty()) {
           //log.debug("localVideoPort is null or empty");
           return false;
        }

        if(remoteVideoPort == null || remoteVideoPort.isEmpty()) {
           //log.debug("remoteVideoPort is null or empty");
           return false;
        }

        if(localVideoPort.equals("0")) {
           //log.debug("localVideoPort is 0");
           return false;
        }

        if(remoteVideoPort.equals("0")) {
           //log.debug("remoteVideoPort is 0");
           return false;
        }

        return true;

    }

    public boolean isVideoConfLogoValid() {
        /*if(!GlobalCall.videoConfLogoExists(VIDEO_CONF_LOGO_PATH)) {
            //log.debug("***IMAGE FOR VIDEOCONF-LOGO VIDEO DOESN'T EXIST: check the image path in bigbluebutton-sip.properties");
            return false;
        }*/

        return true;
    }

    public boolean isSdpPathValid() {
        /*if(!GlobalCall.sdpVideoExists(sdpPath)) {
            //log.debug("***SDP FOR GLOBAL FFMPEG ({}) doesn't exist", sdpPath);
            return false;
        }*/

        return true;
    }

    public String getVideoStreamName(){
        return this.videoStreamName;
    }

    public String getTranscoderId(){
        return this.transcoderId;
    }

    public String getMeetingId(){
        return this.meetingId;
    }

    public String getOutput(){
        return this.output;
    }

    public String generateVideoStreamName(Type type){
        switch(type){
            case TRANSCODE_RTP_TO_RTMP:
                return FFmpegUtils.GLOBAL_VIDEO_STREAM_NAME_PREFIX + voiceBridge + "_" + System.currentTimeMillis();
            case TRANSCODE_FILE_TO_RTMP:
                return FFmpegUtils.VIDEOCONF_LOGO_STREAM_NAME_PREFIX + voiceBridge + "_" + System.currentTimeMillis();
            default:
                return "unknown_stream_name";
        }
    }

    public void setVideoStreamName(String videoStreamName) {
        if (videoStreamName != null) this.videoStreamName = videoStreamName;
    }

    public void setType(String type) {
        if (type == null) return;
        switch (type){
            case Constants.TRANSCODE_RTP_TO_RTMP:
                this.type = Type.TRANSCODE_RTP_TO_RTMP;
                break;
            case Constants.TRANSCODE_RTMP_TO_RTP:
                this.type = Type.TRANSCODE_RTMP_TO_RTP;
                break;
            case Constants.TRANSCODE_FILE_TO_RTP:
                this.type = Type.TRANSCODE_FILE_TO_RTP;
                break;
            case Constants.TRANSCODE_FILE_TO_RTMP:
                this.type = Type.TRANSCODE_FILE_TO_RTMP;
                break;
            case Constants.TRANSCODE_H264_TO_H263:
                this.type = Type.TRANSCODE_H264_TO_H263;
                break;
            case Constants.TRANSCODE_ROTATE_RIGHT:
                this.type = Type.TRANSCODE_ROTATE_RIGHT;
                break;
            case Constants.TRANSCODE_ROTATE_LEFT:
                this.type = Type.TRANSCODE_ROTATE_LEFT;
                break;
            case Constants.TRANSCODE_ROTATE_UPSIDE_DOWN:
                this.type = Type.TRANSCODE_ROTATE_UPSIDE_DOWN;
                break;
            default:
                return;
        }
    }

    public String getType() {
        switch (type){
            case TRANSCODE_RTP_TO_RTMP:
                return Constants.TRANSCODE_RTP_TO_RTMP;
            case TRANSCODE_RTMP_TO_RTP:
                return Constants.TRANSCODE_RTMP_TO_RTP;
            case TRANSCODE_FILE_TO_RTP:
                return Constants.TRANSCODE_FILE_TO_RTP;
            case TRANSCODE_FILE_TO_RTMP:
                return Constants.TRANSCODE_FILE_TO_RTMP;
            case TRANSCODE_H264_TO_H263:
                return Constants.TRANSCODE_H264_TO_H263;
            case TRANSCODE_ROTATE_RIGHT:
                return Constants.TRANSCODE_ROTATE_RIGHT;
            case TRANSCODE_ROTATE_LEFT:
                return Constants.TRANSCODE_ROTATE_LEFT;
            case TRANSCODE_ROTATE_UPSIDE_DOWN:
                return Constants.TRANSCODE_ROTATE_UPSIDE_DOWN;
            default:
                return "UNKNOWN";
        }
    }

    public void setSourceIp(String sourceIp) {
        if (sourceIp != null) this.sourceIp = sourceIp;
    }

    public String getSourceIp() {
        return sourceIp;
    }

    public void setLocalVideoPort(String localVideoPort) {
        if (localVideoPort != null) this.localVideoPort = localVideoPort;
    }

    public String getLocalVideoPort() {
        return localVideoPort;
    }

    public void setRemoteVideoPort(String remoteVideoPort) {
        if (remoteVideoPort != null) this.remoteVideoPort = remoteVideoPort;
    }

    public String getRemoteVideoPort() {
        return remoteVideoPort;
    }

    public void setDestinationIp(String destinationIp) {
        if (destinationIp != null) this.destinationIp = destinationIp;
    }

    public String getDestinationIp() {
        return destinationIp;
    }

}

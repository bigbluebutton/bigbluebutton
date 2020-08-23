package org.bigbluebutton.app.video;

import com.google.gson.Gson;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;

import java.util.HashMap;
import java.util.Map;

public class VideoStream {
    private static Logger log = Red5LoggerFactory.getLogger(VideoStream.class, "video");

    private VideoStreamListener videoStreamListener;
    private IBroadcastStream stream;
    private String recordingStreamName;
    private ClientBroadcastStream cstream;

    public VideoStream(IBroadcastStream stream, VideoStreamListener videoStreamListener, ClientBroadcastStream cstream) {
        this.stream = stream;
        this.videoStreamListener = videoStreamListener;
        stream.addStreamListener(videoStreamListener);
        this.cstream = cstream;
    }

    public String getStreamId() {
        return stream.getPublishedName();
    }

    private Map<String, Object> createLogDataMap(String eventName, String description, boolean addRecordAttribute) {
        Map<String, Object> map = new HashMap<>();
        map.put("broadcastStream", this.stream.getPublishedName());
        map.put("recordStreamId", this.recordingStreamName);
        map.put("event", eventName);
        map.put("description", description);

        if (addRecordAttribute)
            map.put("recording", this.cstream.isRecording());

        return map;
    }

    public synchronized void startRecording() {
        long now = System.currentTimeMillis();
        recordingStreamName = stream.getPublishedName() + "-" + now;

        try {
            videoStreamListener.setStreamId(recordingStreamName);
            cstream.saveAs(recordingStreamName, false);

            Map<String, Object> logData = this.createLogDataMap("start_recording_stream", "Start recording stream.", true);
            String logString = new Gson().toJson(logData);
            log.info(logString);
        } catch (Exception e) {
            log.error("ERROR while recording stream " + e.getMessage());
            e.printStackTrace();
        }
    }

    public synchronized void stopRecording() {
    	log.debug("STOP RECORDING STREAM {} recording {}", stream.getPublishedName(), cstream.isRecording());

        Map<String, Object> logData = this.createLogDataMap("stop_recording_stream", "Stop recording stream.", false);
        String logString = new Gson().toJson(logData);
        log.info(logString);

        cstream.stopRecording();
        videoStreamListener.stopRecording();
        videoStreamListener.reset();
    }

    public synchronized void stopStartRecording() {
        stopRecording();
        videoStreamListener.reset();
        startRecording();
    }

    public synchronized void streamBroadcastClose() {
        stopRecording();
        videoStreamListener.streamStopped();
        stream.removeStreamListener(videoStreamListener);
    }
}

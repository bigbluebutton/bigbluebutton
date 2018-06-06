package org.bigbluebutton.app.screenshare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;
import java.util.HashMap;
import java.util.Map;
import com.google.gson.Gson;

public class VideoStream {
    private static Logger log = Red5LoggerFactory.getLogger(VideoStream.class, "screenshare");

    private VideoStreamListener videoStreamListener;
    private IScope scope;
    private String streamId;
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

    public synchronized void startRecording() {
        long now = System.currentTimeMillis();
        recordingStreamName = stream.getPublishedName() + "-" + now;
        try {
            log.info("Recording stream " + recordingStreamName);
            videoStreamListener.setStreamId(recordingStreamName);
            cstream.saveAs(recordingStreamName, false);

						Map<String, Object> logData2 = new HashMap<String, Object>();
						logData2.put("broadcastStream", stream.getPublishedName());
						logData2.put("recordStreamId", recordingStreamName);
						logData2.put("recording", cstream.isRecording());
						logData2.put("event", "start_recording_stream");
						logData2.put("description", "Start recording stream.");

						Gson gson2 = new Gson();
						String logStr2 =  gson2.toJson(logData2);
						log.info(logStr2);
        } catch (Exception e) {
            log.error("ERROR while recording stream " + e.getMessage());
            e.printStackTrace();
        }
    }

		public synchronized void stopRecording() {
			log.debug("STOP RECORDING STREAM {} recording {}", stream.getPublishedName(), cstream.isRecording());
			Map<String, Object> logData2 = new HashMap<String, Object>();
			logData2.put("broadcastStream", stream.getPublishedName());
			logData2.put("recordStreamId", recordingStreamName);
			logData2.put("event", "stop_recording_stream");
			logData2.put("description", "Stop recording stream.");
			Gson gson2 = new Gson();
			String logStr2 =  gson2.toJson(logData2);
			log.info(logStr2);
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

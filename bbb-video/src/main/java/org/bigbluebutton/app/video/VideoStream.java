package org.bigbluebutton.app.video;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;

public class VideoStream {
    private static Logger log = Red5LoggerFactory.getLogger(VideoStream.class, "video");

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
        return streamId;
    }

    public synchronized void startRecording() {
        long now = System.currentTimeMillis();
        recordingStreamName = stream.getPublishedName() + "-" + now;
        try {
            log.info("Recording stream " + recordingStreamName);
            videoStreamListener.setStreamId(recordingStreamName);
            cstream.saveAs(recordingStreamName, false);
        } catch (Exception e) {
            log.error("ERROR while recording stream " + e.getMessage());
            e.printStackTrace();
        }
    }

    public synchronized void stopRecording() {
        if (cstream.isRecording()) {
            log.info("***** Stopping recording");
            cstream.stopRecording();
            videoStreamListener.stopRecording();
            videoStreamListener.reset();
        }
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

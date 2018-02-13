/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */
package org.bigbluebutton.app.video;


import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.mina.core.buffer.IoBuffer;
import org.red5.server.api.scheduling.IScheduledJob;
import org.red5.server.api.scheduling.ISchedulingService;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.scheduling.QuartzSchedulingService;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import com.google.gson.Gson;
import java.text.SimpleDateFormat;

/**
 * Class to listen for the first video packet of the webcam.
 * We need to listen for the first packet and send a startWebcamEvent.
 * The reason is that when starting the webcam, sometimes Flash Player
 * needs to prompt the user for permission to access the webcam. However,
 * while waiting for the user to click OK to the prompt, Red5 has already
 * called the startBroadcast method which we take as the start of the recording.
 * When the user finally clicks OK, the packets then start to flow through.
 * This introduces a delay of when we assume the start of the recording and
 * the webcam actually publishes video packets. When we do the ingest and
 * processing of the video and multiplex the audio, the video and audio will
 * be un-synched by at least this amount of delay. 
 * @author Richard Alam
 *
 */
public class VideoStreamListener implements IStreamListener {
  private static final Logger log = Red5LoggerFactory.getLogger(VideoStreamListener.class, "video");

  private EventRecordingService recordingService;
  private volatile boolean firstPacketReceived = false;

  // Maximum time between video packets
  private int videoTimeout = 10000;
  private long firstPacketTime = 0L;
  private long packetCount = 0L;

  private int keyFrameCount = 0;

  // Last time video was received, not video timestamp
  private long lastVideoTime;

  private String userId;

  // Stream being observed
  private String streamId;

  // if this stream is recorded or not
  private boolean record;

  // Scheduler
  private QuartzSchedulingService scheduler;

  // Event queue worker job name
  private String timeoutJobName;

  private volatile boolean publishing = false;

  private volatile boolean streamPaused = false;

  private volatile boolean streamStarted = false;

  private String meetingId;

  private long recordingStartTime;

  private final String DATE = "date";
	private final String TIMESTAMP_UTC = "timestampUTC";

  public VideoStreamListener(String meetingId, String streamId, Boolean record,
                             String userId, int packetTimeout,
                             QuartzSchedulingService scheduler,
                             EventRecordingService recordingService) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.record = record;
    this.videoTimeout = packetTimeout;
    this.userId = userId;
    this.scheduler = scheduler;
    this.recordingService = recordingService;

		// start the worker to monitor if we are still receiving video packets
		timeoutJobName = scheduler.addScheduledJob(videoTimeout, new TimeoutJob());
  }

  private Long genTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }

  public void reset() {
    firstPacketReceived = false;
		keyFrameCount = 0;
  }

  public void setStreamId(String streamId) {
    this.streamId = streamId;
  }

  @Override
  public void packetReceived(IBroadcastStream stream, IStreamPacket packet) {
    IoBuffer buf = packet.getData();
    if (buf != null)
      buf.rewind();

    if (buf == null || buf.remaining() == 0) {
      return;
    }

    if (packet instanceof VideoData) {
      // keep track of last time video was received
      lastVideoTime = System.currentTimeMillis();
      packetCount++;

      VideoData vidPkt = (VideoData) packet;

      if (!firstPacketReceived && vidPkt.getFrameType() == VideoData.FrameType.KEYFRAME) {
        log.info("******* Receiving first video KEYFRAME packet");
        firstPacketReceived = true;
        publishing = true;
        firstPacketTime = lastVideoTime;
				streamStarted = true;

        if (record) {
          recordingStartTime = System.currentTimeMillis();
          Map<String, String> event = new HashMap<String, String>();
          event.put("module", "WEBCAM");
          event.put("timestamp", genTimestamp().toString());
          event.put("meetingId", meetingId);
          event.put("stream", streamId);
					event.put(TIMESTAMP_UTC, Long.toString(recordingStartTime));
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX");
					event.put(DATE, sdf.format(recordingStartTime));
          event.put("eventName", "StartWebcamShareEvent");

          recordingService.record(meetingId, event);

					Gson gson = new Gson();
					String logStr = gson.toJson(event);
					log.info("StartWebcamShareEvent data={} timeoutJobName={}", logStr, timeoutJobName);
        }
      }


      if (streamPaused) {
        streamPaused = false;
        long now = System.currentTimeMillis();
        long numSeconds = (now - lastVideoTime) / 1000;

        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", meetingId);
        logData.put("userId", userId);
        logData.put("stream", stream.getPublishedName());
        logData.put("packetCount", packetCount);
        logData.put("publishing", publishing);
        logData.put("pausedFor (sec)", numSeconds);

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);

        log.warn("Video stream restarted. data={}", logStr);
      }

			if (vidPkt.getFrameType() == VideoData.FrameType.KEYFRAME && keyFrameCount < 3) {
				// Log first 3 keyframe packets to allow us to see interval between key frames. Helps
				// to debug if there are any synch issues with recording playback. (ralam feb 12, 2018)
				keyFrameCount++;
				long now = System.currentTimeMillis();
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", meetingId);
				logData.put("userId", userId);
				logData.put("stream", stream.getPublishedName());
				logData.put("packetCount", packetCount);
				logData.put("keyFrameCount", keyFrameCount);
				logData.put("publishing", publishing);
				logData.put(TIMESTAMP_UTC, Long.toString(now));
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX");
				logData.put(DATE, sdf.format(now));

				Gson gson = new Gson();
				String logStr = gson.toJson(logData);

				log.warn("Video stream keyframe. data={}", logStr);
			}

    }
  }

  public void stopRecording() {
    if (record) {
			long now = System.currentTimeMillis();
      long publishDuration = (now - recordingStartTime) / 1000;

      Map<String, String> event = new HashMap<String, String>();
      event.put("module", "WEBCAM");
      event.put("timestamp", genTimestamp().toString());
      event.put("meetingId", meetingId);
      event.put("stream", streamId);
      event.put("duration", Long.toString(publishDuration));
			event.put(TIMESTAMP_UTC, Long.toString(now));
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX");
			event.put(DATE, sdf.format(now));
      event.put("eventName", "StopWebcamShareEvent");

      recordingService.record(meetingId, event);

			Gson gson = new Gson();
			String logStr = gson.toJson(event);
			log.info("StopWebcamShareEvent data={}", logStr);
    }
  }

  public void streamStopped() {
    this.publishing = false;
    if (!streamStarted) {
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", meetingId);
			logData.put("userId", userId);
			logData.put("stream", streamId);
			logData.put("packetCount", packetCount);
			logData.put("publishing", publishing);
			logData.put("timeoutJobName", timeoutJobName);

			Gson gson = new Gson();
			String logStr = gson.toJson(logData);
			log.warn("Removing scheduled job.as stream hasn't started. data={}", logStr);
			// remove the scheduled job
			scheduler.removeScheduledJob(timeoutJobName);
		}
  }

  private class TimeoutJob implements IScheduledJob {

    public void execute(ISchedulingService service) {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", meetingId);
      logData.put("userId", userId);
      logData.put("stream", streamId);
      logData.put("packetCount", packetCount);
      logData.put("publishing", publishing);
			logData.put("timeoutJobName", timeoutJobName);

			Gson gson = new Gson();

      long now = System.currentTimeMillis();
      if ((now - lastVideoTime) > videoTimeout && !streamPaused && streamStarted) {
        streamPaused = true;
        long numSeconds = (now - lastVideoTime) / 1000;

        logData.put("lastPacketTime (sec)", numSeconds);

        String logStr = gson.toJson(logData);

        log.warn("Video packet timeout. data={}", logStr);
      }

      String logStr = gson.toJson(logData);
      if (!publishing && streamStarted) {
        log.warn("Removing scheduled job. data={}", logStr);
        // remove the scheduled job
        scheduler.removeScheduledJob(timeoutJobName);
      }
    }

  }

}

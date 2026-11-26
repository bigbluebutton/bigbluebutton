package org.bigbluebutton.presentation;

import java.io.File;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Presentations whose conversion bbb-apps-akka has refused (for example because the pod is
 * full). The conversion pipeline checks {@link #isRejected} before starting any work for a
 * presentation, so none starts once it is rejected, however long that work was queued.
 *
 * <p>The directory is deleted once work that was already running has had time to finish.
 * Deletion is delayed rather than immediate because those tasks keep writing into the
 * directory until they complete or the supervisor times them out after maxPageConversionTime.
 * The marker outlives that deletion. When it expires the directory is deleted again, to remove
 * anything a task that overran the first deletion wrote afterwards.
 *
 * <p>Register as a Spring singleton with
 * {@code init-method="start"} / {@code destroy-method="stop"}.
 */
public class RejectedPresentationRegistry {

  private static final Logger log = LoggerFactory.getLogger(RejectedPresentationRegistry.class);

  // Extra time on top of maxPageConversionTime before the directory is deleted.
  private static final long DELETE_MARGIN_SEC = 30;

  // How long a presentation stays rejected. Far longer than conversion work waits in the
  // queues, so no queued work for it starts after the marker is gone.
  private static final long MARKER_TTL_SEC = 3600;

  private final Set<String> rejected = ConcurrentHashMap.newKeySet();

  private String presentationDir;
  private long maxPageConversionTime = 60;

  private ScheduledExecutorService scheduler;

  public void setPresentationDir(String presentationDir) {
    this.presentationDir = presentationDir;
  }

  public void setMaxPageConversionTime(long maxPageConversionTime) {
    this.maxPageConversionTime = maxPageConversionTime;
  }

  private static String key(String meetingId, String presentationId) {
    return presentationId + "_" + meetingId;
  }

  /**
   * Marks the presentation as rejected and schedules deletion of its directory. Ids that do
   * not have the expected format are ignored, since they are used to build a path.
   */
  public void reject(String meetingId, String presentationId) {
    if (meetingId == null || presentationId == null
            || !org.bigbluebutton.api.Util.isMeetingIdValidFormat(meetingId)
            || !org.bigbluebutton.api.Util.isPresIdValidFormat(presentationId)) {
      log.warn("Ignoring presentation rejection with invalid ids.");
      return;
    }

    if (!rejected.add(key(meetingId, presentationId))) {
      return;
    }

    log.info("Presentation conversion rejected, stopping and scheduling cleanup. meetingId={} presId={}",
            meetingId, presentationId);
    long deleteDelaySec = maxPageConversionTime + DELETE_MARGIN_SEC;
    scheduler.schedule(() -> deleteFiles(meetingId, presentationId), deleteDelaySec, TimeUnit.SECONDS);
    scheduler.schedule(() -> expire(meetingId, presentationId),
            Math.max(MARKER_TTL_SEC, deleteDelaySec + DELETE_MARGIN_SEC), TimeUnit.SECONDS);
  }

  public boolean isRejected(String meetingId, String presentationId) {
    return rejected.contains(key(meetingId, presentationId));
  }

  // Deletes the directory only. The presentation stays rejected until expire.
  void deleteFiles(String meetingId, String presentationId) {
    try {
      File presDir = org.bigbluebutton.api.Util.getPresentationDir(presentationDir, meetingId, presentationId);
      if (presDir != null) {
        Util.deleteDirectory(presDir);
        log.info("Deleted files of rejected presentation. meetingId={} presId={}", meetingId, presentationId);
      }
    } catch (Exception e) {
      log.warn("Failed to delete files of rejected presentation. meetingId={} presId={}", meetingId, presentationId, e);
    }
  }

  void expire(String meetingId, String presentationId) {
    try {
      deleteFiles(meetingId, presentationId);
    } finally {
      rejected.remove(key(meetingId, presentationId));
    }
  }

  public void start() {
    scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
      Thread t = new Thread(r, "rejected-presentation-cleanup");
      t.setDaemon(true);
      return t;
    });
  }

  public void stop() {
    if (scheduler != null) {
      scheduler.shutdownNow();
    }
  }
}

package org.bigbluebutton.api.util;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Thread-safe sliding-window rate limiter keyed by an arbitrary string.
 *
 * <p>bbb-web serves API requests from many threads, so unlike the akka-bbb-apps
 * {@code PresentationUploadTokenRateLimiter} (which is confined to a single
 * MeetingActor thread and needs no locking) this limiter must be safe for concurrent
 * access. All per-key mutation happens inside {@link ConcurrentHashMap#compute}, which
 * holds the bin lock for that key, so each key's timestamp deque is only ever touched
 * by one thread at a time.
 *
 * <p>There is a single shared instance for the whole application (it is not tied to a
 * meeting lifecycle), so stale buckets are pruned lazily on access in {@link #allow}
 * and, for keys that stop being hit and are therefore never revisited, by a periodic
 * background {@link #sweep}. Register as a Spring singleton with
 * {@code init-method="start"} / {@code destroy-method="stop"}.
 */
public class RequestRateLimiter {

  private static final Logger log = LoggerFactory.getLogger(RequestRateLimiter.class);

  // key -> ascending timestamps (ms) of recent allowed requests
  private final ConcurrentHashMap<String, Deque<Long>> requestTimestamps = new ConcurrentHashMap<>();

  // Maximum allowed requests per key within the window. <= 0 disables the limit.
  private int maxRequests = 0;
  // Length of the sliding window in milliseconds.
  private long windowMs = 60_000L;
  // How often the background sweep runs, in milliseconds.
  private long sweepIntervalMs = 60_000L;

  private ScheduledExecutorService scheduler;

  public void setMaxRequests(int maxRequests) {
    this.maxRequests = maxRequests;
  }

  public void setWindowSec(int windowSec) {
    this.windowMs = windowSec * 1000L;
  }

  public void setSweepIntervalSec(int sweepIntervalSec) {
    this.sweepIntervalMs = sweepIntervalSec * 1000L;
  }

  /**
   * Prunes timestamps for {@code key} older than {@code nowMs - windowMs}, then admits
   * the request (recording {@code nowMs}) when the remaining count is below the
   * configured {@code maxRequests}. A {@code maxRequests} of 0 or less disables the
   * limit and always admits.
   *
   * @return true when the request is allowed, false when it is throttled
   */
  public boolean allow(String key, long nowMs) {
    if (maxRequests <= 0) {
      return true;
    }

    final long cutoff = nowMs - windowMs;
    final boolean[] allowed = new boolean[1];

    requestTimestamps.compute(key, (k, timestamps) -> {
      Deque<Long> recent = (timestamps == null) ? new ArrayDeque<>() : timestamps;
      // Oldest timestamps are at the head; drop everything that fell out of the window.
      while (!recent.isEmpty() && recent.peekFirst() <= cutoff) {
        recent.pollFirst();
      }

      if (recent.size() < maxRequests) {
        recent.addLast(nowMs);
        allowed[0] = true;
      } else {
        allowed[0] = false;
      }

      // Drop the key entirely when nothing recent remains so the map does not grow
      // unbounded for meetings that stop uploading.
      return recent.isEmpty() ? null : recent;
    });

    return allowed[0];
  }

  /**
   * Removes buckets whose timestamps have all fallen outside the window. Intended to
   * be called periodically to reclaim memory for keys that are no longer active and
   * therefore never revisited by {@link #allow}.
   */
  void sweep(long nowMs) {
    final long cutoff = nowMs - windowMs;
    for (Iterator<Map.Entry<String, Deque<Long>>> it = requestTimestamps.entrySet().iterator(); it.hasNext();) {
      final String key = it.next().getKey();
      requestTimestamps.compute(key, (k, timestamps) -> {
        if (timestamps == null) {
          return null;
        }
        while (!timestamps.isEmpty() && timestamps.peekFirst() <= cutoff) {
          timestamps.pollFirst();
        }
        return timestamps.isEmpty() ? null : timestamps;
      });
    }
  }

  public void start() {
    scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
      Thread t = new Thread(r, "request-rate-limiter-sweep");
      t.setDaemon(true);
      return t;
    });
    scheduler.scheduleWithFixedDelay(() -> {
      try {
        sweep(System.currentTimeMillis());
      } catch (Exception e) {
        log.warn("RequestRateLimiter sweep failed", e);
      }
    }, sweepIntervalMs, sweepIntervalMs, TimeUnit.MILLISECONDS);
  }

  public void stop() {
    if (scheduler != null) {
      scheduler.shutdownNow();
    }
  }
}

package org.bigbluebutton.api.util

import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.{ CountDownLatch, Executors, TimeUnit }

class RequestRateLimiterTest extends UnitSpec {

  private def limiter(maxRequests: Int, windowSec: Int): RequestRateLimiter = {
    val l = new RequestRateLimiter
    l.setMaxRequests(maxRequests)
    l.setWindowSec(windowSec)
    l
  }

  it should "admit up to maxRequests within the window and reject the next" in {
    val l = limiter(3, 60)
    val now = 1000L
    assert(l.allow("m1", now))
    assert(l.allow("m1", now + 1))
    assert(l.allow("m1", now + 2))
    assert(!l.allow("m1", now + 3))
  }

  it should "admit again once earlier requests fall out of the window" in {
    val l = limiter(2, 60)
    val now = 1000L
    assert(l.allow("m1", now))
    assert(l.allow("m1", now + 10))
    assert(!l.allow("m1", now + 20))
    // 61s after the first two requests, both have expired.
    assert(l.allow("m1", now + 61000))
  }

  it should "always allow when maxRequests is 0 (disabled)" in {
    val l = limiter(0, 60)
    val now = 1000L
    (0 until 1000).foreach { i => assert(l.allow("m1", now + i)) }
  }

  it should "track keys independently" in {
    val l = limiter(1, 60)
    val now = 1000L
    assert(l.allow("m1", now))
    assert(l.allow("m2", now))
    assert(!l.allow("m1", now + 1))
    assert(!l.allow("m2", now + 1))
  }

  it should "never admit more than maxRequests per window under concurrent access" in {
    val max = 100
    val threads = 32
    val callsPerThread = 50
    val l = limiter(max, 60)
    val now = 5000L

    val pool = Executors.newFixedThreadPool(threads)
    val start = new CountDownLatch(1)
    val admitted = new AtomicInteger(0)

    (0 until threads).foreach { _ =>
      pool.submit(new Runnable {
        override def run(): Unit = {
          start.await()
          (0 until callsPerThread).foreach { _ =>
            // Same fixed timestamp so every call is inside one window.
            if (l.allow("hot-meeting", now)) admitted.incrementAndGet()
          }
        }
      })
    }

    start.countDown()
    pool.shutdown()
    assert(pool.awaitTermination(10, TimeUnit.SECONDS))
    assert(admitted.get() == max)
  }

  it should "drop stale buckets on sweep" in {
    val l = limiter(5, 60)
    val now = 1000L
    assert(l.allow("m1", now))
    assert(l.allow("m2", now))
    // Sweep 61s later: both buckets are stale and should be removed, so each key
    // gets the full quota again immediately afterwards.
    l.sweep(now + 61000)
    (0 until 5).foreach { i => assert(l.allow("m1", now + 61000 + i)) }
    assert(!l.allow("m1", now + 61000 + 6))
  }

  // allow() also prunes lazily, so the case above passes with or without sweep(). This one
  // constrains sweep() itself: it must not hand back budget still inside the window.
  it should "not return budget on sweep for timestamps still inside the window" in {
    val l = limiter(2, 60)
    val now = 1000L
    assert(l.allow("m1", now))
    assert(l.allow("m1", now + 10))
    l.sweep(now + 20)
    assert(!l.allow("m1", now + 30))
  }

  // Separate limiter instances are wired for different purposes and must not share a budget.
  it should "keep separate instances independent for the same key" in {
    val callLimiter = limiter(1, 60)
    val conversionLimiter = limiter(1, 60)
    val now = 1000L

    assert(callLimiter.allow("meeting-1", now))
    assert(!callLimiter.allow("meeting-1", now + 1))

    // The second limiter's budget for the same key is untouched by the first.
    assert(conversionLimiter.allow("meeting-1", now + 2))
    assert(!conversionLimiter.allow("meeting-1", now + 3))
  }
}

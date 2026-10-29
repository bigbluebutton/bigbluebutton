package org.bigbluebutton.api.domain

import java.util.concurrent.{ Callable, Executors, TimeUnit }
import java.util.concurrent.atomic.{ AtomicBoolean, AtomicInteger }
import java.util.Collections

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MeetingUserCustomDataTest extends AnyFlatSpec with Matchers {

  private val usersPerMeeting = 8
  private val meetings = 2000

  // Each join request thread stores its user's custom data on the meeting and reads it back for the
  // registration it sends to akka-apps, so users of one meeting joining at once write to the meeting
  // from several threads at the same time.
  "addUserCustomData" should "keep the data of every user of a meeting the users join at the same time" in {
    val pool = Executors.newFixedThreadPool(usersPerMeeting)
    try {
      val missing = (1 to meetings).flatMap { n =>
        val meeting = new Meeting.Builder(s"meeting-$n", s"meeting-$n", System.currentTimeMillis()).build()
        // the threads spin rather than block until all are running, so they reach the meeting together
        val ready = new AtomicInteger(0)
        val start = new AtomicBoolean(false)
        val joins = (1 to usersPerMeeting).map { u =>
          pool.submit(new Callable[Boolean] {
            override def call(): Boolean = {
              ready.incrementAndGet()
              while (!start.get()) Thread.onSpinWait()
              meeting.addUserCustomData(s"w_user$u", Collections.singletonMap("bbb_custom", s"value-$u"))
              meeting.getUserCustomData(s"w_user$u") != null
            }
          })
        }
        while (ready.get() < usersPerMeeting) Thread.onSpinWait()
        start.set(true)
        val readBackFailed = joins.zipWithIndex.collect { case (join, i) if !join.get(10, TimeUnit.SECONDS) => i + 1 }
        val lost = (1 to usersPerMeeting).filter(u => meeting.getUserCustomData(s"w_user$u") == null)
        (readBackFailed ++ lost).distinct.map(u => s"meeting-$n w_user$u")
      }
      withClue(s"${missing.size} users of $meetings meetings lost their custom data, e.g. ${missing.take(5).mkString(", ")}:") {
        missing shouldBe empty
      }
    } finally {
      pool.shutdownNow()
    }
  }
}

package org.bigbluebutton.api.domain

import java.util.HashMap
import java.util.concurrent.{ CountDownLatch, Executors, Future }

import org.bigbluebutton.api.util.UnitSpec

class MeetingUserCustomDataConcurrencyTest extends UnitSpec {

  it should "retain user custom data from concurrent joins" in {
    val threadCount = 32
    val meetingCount = 500
    val executor = Executors.newFixedThreadPool(threadCount)

    try {
      for (meetingIndex <- 0 until meetingCount) {
        val meeting = new Meeting.Builder(
          s"external-$meetingIndex",
          s"internal-$meetingIndex",
          System.currentTimeMillis()
        ).withName(s"meeting-$meetingIndex").build()
        val start = new CountDownLatch(1)
        val writes = (0 until threadCount).map { userIndex =>
          executor.submit(new java.util.concurrent.Callable[Boolean] {
            override def call(): Boolean = {
              start.await()
              val userId = s"user-$meetingIndex-$userIndex"
              val customData = new HashMap[String, String]()
              customData.put("racemarker", userIndex.toString)
              meeting.addUserCustomData(userId, customData)
              meeting.getUserCustomData(userId) != null
            }
          }): Future[Boolean]
        }

        start.countDown()
        writes.foreach(_.get() shouldBe true)
        for (userIndex <- 0 until threadCount) {
          meeting.getUserCustomData(s"user-$meetingIndex-$userIndex") should not be null
        }
      }
    } finally {
      executor.shutdownNow()
    }
  }
}

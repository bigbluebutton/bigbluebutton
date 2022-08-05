package org.bigbluebutton.endpoint.redis

import scala.collection.immutable.StringOps
import scala.collection.JavaConverters._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisStorageProvider }
import org.bigbluebutton.core.record.events.{ AbstractPresentationWithAnnotations, StoreAnnotationsInRedisPresAnnEvent, StoreExportJobInRedisPresAnnEvent }
import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.ActorSystem
import akka.actor.Props
import org.bigbluebutton.service.HealthzService

import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global

object ExportAnnotationsActor {
  def props(
      system:         ActorSystem,
      redisConfig:    RedisConfig,
      healthzService: HealthzService
  ): Props =
    Props(
      classOf[ExportAnnotationsActor],
      system,
      redisConfig,
      healthzService
    )
}

class ExportAnnotationsActor(
    system:         ActorSystem,
    redisConfig:    RedisConfig,
    healthzService: HealthzService
)
  extends RedisStorageProvider(
    system,
    "BbbAppsAkkaRecorder",
    redisConfig
  ) with Actor with ActorLogging {

  private def storePresentationAnnotations(session: String, message: java.util.Map[java.lang.String, java.lang.String], messageType: String): Unit = {
    redis.storePresentationAnnotations(session, message, messageType)
  }

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: StoreAnnotationsInRedisSysMsg => handleStoreAnnotationsInRedisSysMsg(m)
      case m: StoreExportJobInRedisSysMsg   => handleStoreExportJobInRedisSysMsg(m)

      case _                                => // message not to be stored.
    }
  }

  private def handleStoreAnnotationsInRedisSysMsg(msg: StoreAnnotationsInRedisSysMsg) {
    val ev = new StoreAnnotationsInRedisPresAnnEvent()

    ev.setJobId(msg.body.annotations.jobId)
    ev.setPresId(msg.body.annotations.presId)
    ev.setPages(msg.body.annotations.pages)

    storePresentationAnnotations(msg.header.meetingId, ev.toMap.asJava, "PresAnn")
  }

  private def handleStoreExportJobInRedisSysMsg(msg: StoreExportJobInRedisSysMsg) {
    val ev = new StoreExportJobInRedisPresAnnEvent()

    ev.setJobId(msg.body.exportJob.jobId)
    ev.setJobType(msg.body.exportJob.jobType)
    ev.setFilename(msg.body.exportJob.filename)
    ev.setPresId(msg.body.exportJob.presId)
    ev.setPresLocation(msg.body.exportJob.presLocation)
    ev.setAllPages(msg.body.exportJob.allPages.toString)
    ev.setPages(msg.body.exportJob.pages)
    ev.setParentMeetingId(msg.body.exportJob.parentMeetingId)
    ev.setPresentationUploadToken(msg.body.exportJob.presUploadToken)

    storePresentationAnnotations(msg.header.meetingId, ev.toMap.asJava, "ExportJob")
  }
}

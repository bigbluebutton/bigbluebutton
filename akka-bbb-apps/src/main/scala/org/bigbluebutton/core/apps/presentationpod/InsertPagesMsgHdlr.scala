package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.presentationpod.PresentationInsertPages._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ NotificationDAO, PresPageDAO, PresPresentationDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

/**
 * The insert of pages after the request: the messages bbb-web sends about the upload of an insert, the
 * deadlines checked on the meeting's audit tick, and the side effects of each outcome the pure functions of
 * PresentationInsertPages decide.
 */
trait InsertPagesMsgHdlr extends SystemConfiguration {
  this: PresentationPodHdlrs =>

  /** The flag of the client settings of the meeting; absent means disabled. */
  def insertPagesEnabled(liveMeeting: LiveMeeting): Boolean =
    getConfigPropertyValueByPathAsBooleanOrElse(liveMeeting.clientSettings, "public.presentation.insertPagesEnabled",
      alternativeValue = false)

  def insertPagesDeadlines: Deadlines = Deadlines(
    requestMs = presInsertRequestTimeoutSec * 1000L,
    transferMs = presInsertTransferTimeoutSec * 1000L,
    idleMs = presInsertIdleTimeoutSec * 1000L
  )

  def handle(msg: PresentationInsertPagesProgressSysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val before = state.insertPagesQueue.find(msg.body.uploadPresentationId)
    val queue = PresentationInsertPages.onProgress(state.insertPagesQueue, msg.body.uploadPresentationId,
      msg.body.stage, System.currentTimeMillis())
    val after = queue.find(msg.body.uploadPresentationId)

    // Entering the conversion: the upload toast shows the insert as converting.
    if (before.exists(_.stage != InsertStage.Conversion) && after.exists(_.stage == InsertStage.Conversion)) {
      PresPresentationDAO.setUploadInProgress(msg.body.uploadPresentationId)
    }
    if (after.isEmpty) {
      log.debug("Ignoring insert progress of upload {} with no insert in progress", msg.body.uploadPresentationId)
    }
    state.update(queue)
  }

  def handle(msg: PresentationInsertPagesPageSysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    if (state.insertPagesQueue.find(msg.body.uploadPresentationId).isEmpty) {
      log.info(
        "Ignoring page {} of upload {} with no insert in progress. meetingId={}",
        msg.body.page.id, msg.body.uploadPresentationId, liveMeeting.props.meetingProp.intId
      )
    }
    state.update(PresentationInsertPages.onPage(state.insertPagesQueue, msg.body.uploadPresentationId,
      msg.body.page, System.currentTimeMillis()))
  }

  def handle(msg: PresentationInsertPagesReadySysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val result = PresentationInsertPages.onReady(state.insertPagesQueue, state.presentationPodManager,
      msg.body.uploadPresentationId, msg.body.insertIntoPresentationId,
      InsertReady(msg.body.pageIds, msg.body.maxNumPages))
    applyInsertPagesResult(result, state, liveMeeting, bus)
  }

  def handle(msg: PresentationInsertPagesFailedSysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val result = PresentationInsertPages.onFailed(state.insertPagesQueue, state.presentationPodManager,
      msg.body.uploadPresentationId, msg.body.errorKey, msg.body.detail)
    applyInsertPagesResult(result, state, liveMeeting, bus)
  }

  /** Called on the meeting's audit tick: ends the inserts whose stage deadline passed. */
  def handleInsertPagesDeadlines(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    if (state.insertPagesQueue.entries.isEmpty) state
    else {
      val result = PresentationInsertPages.onTick(state.insertPagesQueue, state.presentationPodManager,
        System.currentTimeMillis(), insertPagesDeadlines)
      applyInsertPagesResult(result, state, liveMeeting, bus)
    }
  }

  /** Does the side effects of each outcome, in order, and returns the state with the new queue and pods. */
  def applyInsertPagesResult(result: Result, state: MeetingState2x, liveMeeting: LiveMeeting,
                             bus: MessageBus): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId

    result.outcomes.foreach {
      case a: Applied =>
        log.info(s"Inserted ${a.inserted.size} page(s) into presentation ${a.target.id} at position ${a.insertedAt}. " +
          s"meetingId=$meetingId uploadPresentationId=${a.entry.uploadPresentationId} navigated=${a.navigated}")
        a.droppedContent.foreach { pageId =>
          log.warning(s"Dropped the text of inserted page $pageId: it had U+0000. meetingId=$meetingId presentationId=${a.target.id}")
        }
        val firstInserted = a.inserted.head
        PresPageDAO.insertPages(meetingId, a.target.id, a.target.numPages, a.insertedAt, a.inserted,
          if (a.navigated) Some(firstInserted.id) else None, a.entry.uploadPresentationId)

        bus.outGW.send(buildPagesInsertedEvtMsg(meetingId, a))
        if (a.navigated) {
          PresentationSender.broadcastSetCurrentPageEvtMsg(bus, meetingId, a.entry.podId, a.target.id,
            firstInserted.id, firstInserted.num, a.entry.userId)
        }
        notifyInsertPages(meetingId, a.entry.userId, "info", "app.presentation.insertPages.success",
          Map("count" -> a.inserted.size.toString, "position" -> a.insertedAt.toString), bus)

      case r: Refused =>
        log.warning(s"Refused insert of upload ${r.entry.uploadPresentationId} into presentation ${r.entry.intent.targetId}: " +
          s"${r.key} (${r.reason}). meetingId=$meetingId")
        endInsert(meetingId, r.entry, r.key, bus)
        sendDiscard(meetingId, r.entry.intent.targetId, r.discard, bus)

      case f: Failed =>
        log.warning(s"Insert of upload ${f.entry.uploadPresentationId} into presentation ${f.entry.intent.targetId} failed: " +
          s"${f.key} (${f.detail}). meetingId=$meetingId")
        endInsert(meetingId, f.entry, f.key, bus)

      case t: TimedOut =>
        log.warning(s"Insert of upload ${t.entry.uploadPresentationId} into presentation ${t.entry.intent.targetId} " +
          s"passed the deadline of stage ${t.entry.stage}. meetingId=$meetingId")
        sendConversionRejected(meetingId, t.entry, bus)
        endInsert(meetingId, t.entry, ErrorKey.Timeout, bus)
        sendDiscard(meetingId, t.entry.intent.targetId, t.discard, bus)

      case d: DiscardOnly =>
        log.info(s"Ready of upload ${d.uploadPresentationId} with no insert in progress: deleting ${d.discard.size} " +
          s"page(s) from presentation ${d.targetId}. meetingId=$meetingId")
        sendDiscard(meetingId, d.targetId, d.discard, bus)

      case i: Ignored =>
        log.info(s"Insert of upload ${i.uploadPresentationId}: ${i.reason}. meetingId=$meetingId")
    }

    state.update(result.queue).update(result.pods)
  }

  /** An insert that was not applied: its progress row goes away and the requester is notified. */
  private def endInsert(meetingId: String, entry: InsertEntry, key: String, bus: MessageBus): Unit = {
    PresPresentationDAO.delete(meetingId, entry.uploadPresentationId)
    notifyInsertPages(meetingId, entry.userId, "error", s"app.presentation.insertPages.error.$key",
      Map("filename" -> entry.filename), bus)
  }

  def notifyInsertPages(meetingId: String, userId: String, notificationType: String, messageId: String,
                        values: Map[String, String], bus: MessageBus): Unit = {
    val event = MsgBuilder.buildNotifyUserInMeetingEvtMsg(userId, meetingId, notificationType, "presentation",
      messageId, "Outcome of an insert of pages into a presentation", values)
    bus.outGW.send(event)
    NotificationDAO.insert(event)
  }

  private def sendDiscard(meetingId: String, targetId: String, pageIds: Vector[String], bus: MessageBus): Unit = {
    if (pageIds.nonEmpty) {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationInsertPagesDiscardSysMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationInsertPagesDiscardSysMsg.NAME, meetingId, "system")
      val body = PresentationInsertPagesDiscardSysMsgBody(meetingId, targetId, pageIds)
      bus.outGW.send(BbbCommonEnvCoreMsg(envelope, PresentationInsertPagesDiscardSysMsg(header, body)))
    }
  }

  // Stops the conversion of an insert that passed its deadline, and its pending token (bbb-web).
  private def sendConversionRejected(meetingId: String, entry: InsertEntry, bus: MessageBus): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PresentationConversionRejectedSysMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionRejectedSysMsg.NAME, meetingId, entry.userId)
    val body = PresentationConversionRejectedSysMsgBody(meetingId, entry.podId, entry.uploadPresentationId,
      "INSERT_PAGES_TIMEOUT")
    bus.outGW.send(BbbCommonEnvCoreMsg(envelope, PresentationConversionRejectedSysMsg(header, body)))
  }

  private def buildPagesInsertedEvtMsg(meetingId: String, a: Applied): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, a.entry.userId)
    val envelope = BbbCoreEnvelope(PresentationPagesInsertedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPagesInsertedEvtMsg.NAME, meetingId, a.entry.userId)
    val pages = a.inserted.map { p =>
      PageVO(id = p.id, num = p.num, thumbUri = p.urls.getOrElse("thumb", ""), txtUri = p.urls.getOrElse("text", ""),
        svgUri = p.urls.getOrElse("svg", ""), current = p.current, width = p.width, height = p.height,
        pageToken = p.pageToken)
    }
    val body = PresentationPagesInsertedEvtMsgBody(a.entry.podId, a.target.id, a.insertedAt, pages, pageIdsInOrder(a.target))
    BbbCommonEnvCoreMsg(envelope, PresentationPagesInsertedEvtMsg(header, body))
  }
}

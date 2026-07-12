package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPage
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationPagesInsertedSysMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg:         PresentationPagesInsertedSysMsg,
      state:       MeetingState2x,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): MeetingState2x = {

    val podId = msg.body.podId
    val targetPresId = msg.body.targetPresentationId
    val insertPresId = msg.body.insertPresentationId
    val position = msg.body.insertAtPosition

    // Slide files are named and served by opaque page id, so a page's urls never change with its
    // num. bbb-web precomputed urls only for the inserted pages (their pageToken now binds to the
    // target presentation); look them up by page id.
    val urlsByPageId: Map[String, Map[String, String]] = msg.body.pageUrls.map(e => e.pageId -> e.urls).toMap

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
      targetPres <- pod.getPresentation(targetPresId)
      insertPres <- pod.getPresentation(insertPresId)
    } yield {
      val insertCount = insertPres.pages.size

      // Shift existing target pages at/after the insert position up by insertCount, keeping their
      // current flag, page ids and urls; only their num changes.
      val shifted = targetPres.pages.map {
        case (id, pg) =>
          id -> pg.copy(num = PresentationPagesInsertMath.shiftedTargetPageNum(pg.num, position, insertCount))
      }

      // Re-home the converted pages onto the target at position..position+insertCount-1,
      // preserving their opaque page ids so future annotations stay keyed correctly.
      val inserted = insertPres.pages.values.map { pg =>
        val newNum = PresentationPagesInsertMath.insertedPageNum(pg.num, position)
        pg.id -> pg.copy(num = newNum, urls = urlsByPageId.getOrElse(pg.id, pg.urls), current = false, converted = true)
      }.toMap

      val mergedPages: Map[String, PresentationPage] = shifted ++ inserted
      val newTargetPres = targetPres.copy(pages = mergedPages, numPages = mergedPages.size)

      var pods = state.presentationPodManager.addPod(pod.removePresentation(insertPresId))
      pods = pods.addPresentationToPod(podId, newTargetPres)

      // One transaction: repoint the inserted page rows onto the target, renumber the shifted
      // rows, update totalPages and delete the transient insert presentation row. Split apart,
      // the insert-pres delete could cascade away the inserted pages before they are re-homed.
      PresPresentationDAO.applyInsertedPages(newTargetPres, liveMeeting.props.meetingProp.intId, insertPresId, inserted.keySet)

      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}

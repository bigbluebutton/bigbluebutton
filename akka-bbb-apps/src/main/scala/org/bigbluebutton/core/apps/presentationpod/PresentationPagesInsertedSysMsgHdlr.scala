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

    // bbb-web already renumbered the physical slide files so slideN matches the final page number,
    // and precomputed the tokenized urls for every final number; look them up by new number.
    val urlByNum: Map[Int, Map[String, String]] = msg.body.pageUrls.map(e => e.num -> e.urls).toMap
    def buildUrls(num: Int, fallback: Map[String, String]): Map[String, String] =
      urlByNum.getOrElse(num, fallback)

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
      targetPres <- pod.getPresentation(targetPresId)
      insertPres <- pod.getPresentation(insertPresId)
    } yield {
      val insertCount = insertPres.pages.size

      // Shift existing target pages at/after the insert position up by insertCount, keeping their
      // current flag and page ids; rebuild urls to point at their new (renumbered) file.
      val shifted = targetPres.pages.map {
        case (id, pg) =>
          val newNum = PresentationPagesInsertMath.shiftedTargetPageNum(pg.num, position, insertCount)
          id -> pg.copy(num = newNum, urls = buildUrls(newNum, pg.urls))
      }

      // Re-home the converted pages onto the target at position..position+insertCount-1,
      // preserving their opaque page ids so future annotations stay keyed correctly.
      val inserted = insertPres.pages.values.map { pg =>
        val newNum = PresentationPagesInsertMath.insertedPageNum(pg.num, position)
        pg.id -> pg.copy(num = newNum, urls = buildUrls(newNum, pg.urls), current = false, converted = true)
      }.toMap

      val mergedPages: Map[String, PresentationPage] = shifted ++ inserted
      val newTargetPres = targetPres.copy(pages = mergedPages, numPages = mergedPages.size)

      var pods = state.presentationPodManager.addPod(pod.removePresentation(insertPresId))
      pods = pods.addPresentationToPod(podId, newTargetPres)

      // updatePages repoints the inserted page rows onto the target and rewrites the shifted
      // rows' num/urls + totalPages in one transaction; deleting the transient insert
      // presentation afterwards only removes its now-empty presentation row.
      PresPresentationDAO.updatePages(newTargetPres)
      PresPresentationDAO.delete(liveMeeting.props.meetingProp.intId, insertPresId)

      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}

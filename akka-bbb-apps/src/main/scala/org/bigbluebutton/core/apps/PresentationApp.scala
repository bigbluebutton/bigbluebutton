package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import com.google.gson.Gson
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

trait PresentationApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  private var cursorLocation = new CursorLocation

  def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    val pres = msg.presentations

    msg.presentations.foreach(presentation => {
      liveMeeting.presModel.addPresentation(presentation)

      sharePresentation(presentation.id, true)
    })
  }

  def handleInitializeMeeting(msg: InitializeMeeting) {

  }

  def handleClearPresentation(msg: ClearPresentation) {
    outGW.send(new ClearPresentationOutMsg(mProps.meetingID, mProps.recorded))
  }

  def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
    outGW.send(new PresentationConversionProgress(mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId, msg.presName))
  }

  def handlePresentationPageCountError(msg: PresentationPageCountError) {
    outGW.send(new PresentationConversionError(mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId,
      msg.numberOfPages,
      msg.maxNumberPages, msg.presName))
  }

  def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
    outGW.send(new PresentationPageGenerated(mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId,
      msg.numberOfPages,
      msg.pagesCompleted, msg.presName))
  }

  def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) {

    liveMeeting.presModel.addPresentation(msg.presentation)

    outGW.send(new PresentationConversionDone(mProps.meetingID, mProps.recorded, msg.messageKey,
      msg.code, msg.presentation))

    sharePresentation(msg.presentation.id, true)
  }

  def handleRemovePresentation(msg: RemovePresentation) {
    val curPres = liveMeeting.presModel.getCurrentPresentation

    val removedPresentation = liveMeeting.presModel.remove(msg.presentationID)

    curPres foreach (cp => {
      if (cp.id == msg.presentationID) {
        sharePresentation(msg.presentationID, false);
      }
    })

    outGW.send(new RemovePresentationOutMsg(msg.meetingID, mProps.recorded, msg.presentationID))

  }

  def handleGetPresentationInfo(msg: GetPresentationInfo) {
    val curPresenter = liveMeeting.usersModel.getCurrentPresenterInfo();
    val presenter = new CurrentPresenter(curPresenter.presenterID, curPresenter.presenterName, curPresenter.assignedBy)
    val presentations = liveMeeting.presModel.getPresentations
    val presentationInfo = new CurrentPresentationInfo(presenter, presentations)
    outGW.send(new GetPresentationInfoOutMsg(mProps.meetingID, mProps.recorded, msg.requesterID, presentationInfo, msg.replyTo))
  }

  def handleSendCursorUpdate(msg: SendCursorUpdate) {
    cursorLocation = new CursorLocation(msg.xPercent, msg.yPercent)
    outGW.send(new SendCursorUpdateOutMsg(mProps.meetingID, mProps.recorded, msg.xPercent, msg.yPercent))
  }

  def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
    // Force coordinate that are out-of-bounds inside valid values
    val xOffset = if (msg.xOffset <= 0) msg.xOffset else 0
    val yOffset = if (msg.yOffset <= 0) msg.yOffset else 0
    val width = if (msg.widthRatio <= 100) msg.widthRatio else 100
    val height = if (msg.heightRatio <= 100) msg.heightRatio else 100

    val page = liveMeeting.presModel.resizePage(xOffset, yOffset, width, height);
    page foreach (p => outGW.send(new ResizeAndMoveSlideOutMsg(mProps.meetingID, mProps.recorded, p)))
  }

  def handleGotoSlide(msg: GotoSlide) {
    liveMeeting.presModel.changePage(msg.page) foreach { page =>
      log.debug("Switching page for meeting=[{}] page=[{}]", msg.meetingID, page.num);
      outGW.send(new GotoSlideOutMsg(mProps.meetingID, mProps.recorded, page))
    }

    liveMeeting.usersModel.getCurrentPresenter() foreach { pres =>
      handleStopPollRequest(StopPollRequest(mProps.meetingID, pres.id))
    }

  }

  def handleSharePresentation(msg: SharePresentation) {
    sharePresentation(msg.presentationID, msg.share)
  }

  def sharePresentation(presentationID: String, share: Boolean) {
    val pres = liveMeeting.presModel.sharePresentation(presentationID)

    pres foreach { p =>
      outGW.send(new SharePresentationOutMsg(mProps.meetingID, mProps.recorded, p))

      liveMeeting.presModel.getCurrentPage(p) foreach { page =>
        outGW.send(new GotoSlideOutMsg(mProps.meetingID, mProps.recorded, page))
      }
    }

  }

  def handleGetSlideInfo(msg: GetSlideInfo) {
    liveMeeting.presModel.getCurrentPresentation foreach { pres =>
      liveMeeting.presModel.getCurrentPage(pres) foreach { page =>
        outGW.send(new GetSlideInfoOutMsg(mProps.meetingID, mProps.recorded, msg.requesterID, page, msg.replyTo))
      }
    }

  }

  def printPresentations() {
    liveMeeting.presModel.getPresentations foreach { pres =>
      println("presentation id=[" + pres.id + "] current=[" + pres.current + "]")
      pres.pages.values foreach { page =>
        println("page id=[" + page.id + "] current=[" + page.current + "]")
      }
    }

  }

}
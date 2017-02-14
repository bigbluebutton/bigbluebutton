package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import com.google.gson.Gson
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait PresentationApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val state: MeetingStateModel

  private var cursorLocation = new CursorLocation

  def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    val pres = msg.presentations

    msg.presentations.foreach(presentation => {
      state.presModel.addPresentation(presentation)

      sharePresentation(presentation.id, true)
    })
  }

  def handleInitializeMeeting(msg: InitializeMeeting) {

  }

  def handleClearPresentation(msg: ClearPresentation) {
    outGW.send(new ClearPresentationOutMsg(state.mProps.meetingID, state.mProps.recorded))
  }

  def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
    outGW.send(new PresentationConversionProgress(state.mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId, msg.presName))
  }

  def handlePresentationPageCountError(msg: PresentationPageCountError) {
    outGW.send(new PresentationConversionError(state.mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId,
      msg.numberOfPages,
      msg.maxNumberPages, msg.presName))
  }

  def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
    outGW.send(new PresentationPageGenerated(state.mProps.meetingID, msg.messageKey,
      msg.code, msg.presentationId,
      msg.numberOfPages,
      msg.pagesCompleted, msg.presName))
  }

  def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) {

    state.presModel.addPresentation(msg.presentation)

    outGW.send(new PresentationConversionDone(state.mProps.meetingID, state.mProps.recorded, msg.messageKey,
      msg.code, msg.presentation))

    sharePresentation(msg.presentation.id, true)
  }

  def handleRemovePresentation(msg: RemovePresentation) {
    val curPres = state.presModel.getCurrentPresentation

    val removedPresentation = state.presModel.remove(msg.presentationID)

    curPres foreach (cp => {
      if (cp.id == msg.presentationID) {
        sharePresentation(msg.presentationID, false);
      }
    })

    outGW.send(new RemovePresentationOutMsg(msg.meetingID, state.mProps.recorded, msg.presentationID))

  }

  def handleGetPresentationInfo(msg: GetPresentationInfo) {
    val curPresenter = state.meetingStatus.getCurrentPresenterInfo();
    val presenter = new CurrentPresenter(curPresenter.presenterID, curPresenter.presenterName, curPresenter.assignedBy)
    val presentations = state.presModel.getPresentations
    val presentationInfo = new CurrentPresentationInfo(presenter, presentations)
    outGW.send(new GetPresentationInfoOutMsg(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, presentationInfo, msg.replyTo))
  }

  def handleSendCursorUpdate(msg: SendCursorUpdate) {
    cursorLocation = new CursorLocation(msg.xPercent, msg.yPercent)
    outGW.send(new SendCursorUpdateOutMsg(state.mProps.meetingID, state.mProps.recorded, msg.xPercent, msg.yPercent))
  }

  def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
    // Force coordinate that are out-of-bounds inside valid values
    val xOffset = if (msg.xOffset <= 0) msg.xOffset else 0
    val yOffset = if (msg.yOffset <= 0) msg.yOffset else 0
    val width = if (msg.widthRatio <= 100) msg.widthRatio else 100
    val height = if (msg.heightRatio <= 100) msg.heightRatio else 100

    val page = state.presModel.resizePage(xOffset, yOffset, width, height);
    page foreach (p => outGW.send(new ResizeAndMoveSlideOutMsg(state.mProps.meetingID, state.mProps.recorded, p)))
  }

  def handleGotoSlide(msg: GotoSlide) {
    state.presModel.changePage(msg.page) foreach { page =>
      log.debug("Switching page for meeting=[{}] page=[{}]", msg.meetingID, page.num);
      outGW.send(new GotoSlideOutMsg(state.mProps.meetingID, state.mProps.recorded, page))
    }

    Users.getCurrentPresenter(state.users.toVector) foreach { pres =>
      handleStopPollRequest(StopPollRequest(state.mProps.meetingID, pres.id))
    }

  }

  def handleSharePresentation(msg: SharePresentation) {
    sharePresentation(msg.presentationID, msg.share)
  }

  def sharePresentation(presentationID: String, share: Boolean) {
    val pres = state.presModel.sharePresentation(presentationID)

    pres foreach { p =>
      outGW.send(new SharePresentationOutMsg(state.mProps.meetingID, state.mProps.recorded, p))

      state.presModel.getCurrentPage(p) foreach { page =>
        outGW.send(new GotoSlideOutMsg(state.mProps.meetingID, state.mProps.recorded, page))
      }
    }

  }

  def handleGetSlideInfo(msg: GetSlideInfo) {
    state.presModel.getCurrentPresentation foreach { pres =>
      state.presModel.getCurrentPage(pres) foreach { page =>
        outGW.send(new GetSlideInfoOutMsg(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, page, msg.replyTo))
      }
    }

  }

  def printPresentations() {
    state.presModel.getPresentations foreach { pres =>
      println("presentation id=[" + pres.id + "] current=[" + pres.current + "]")
      pres.pages.values foreach { page =>
        println("page id=[" + page.id + "] current=[" + page.current + "]")
      }
    }

  }

}

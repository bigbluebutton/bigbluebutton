package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.domain.{ BbbSystemConst, MeetingState2x }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

object PresentationPodsApp {

  def createPresentationPod(ownerId: String): PresentationPod = {
    PresentationPodFactory.create(ownerId)
  }

  //  def createPresentationPod(id: String, ownerId: String, currentPresenter: String, authorizedPresenters: Vector[String],
  //                            presentations: collection.immutable.Map[String, Presentation]): PresentationPod = {
  //    PresentationPodFactory.create(ownerId)
  //  }

  def createDefaultPresentationPod(state: MeetingState2x): MeetingState2x = {
    val defaultPresPod = PresentationPodFactory.create("the-owner-id")
    val podManager = state.presentationPodManager.addPod(defaultPresPod)
    state.update(podManager)
  }

}

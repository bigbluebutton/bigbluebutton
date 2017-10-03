package org.bigbluebutton.core.apps.presentationpod

//import org.bigbluebutton.core.apps.presentationpod._
import akka.actor.ActorContext
import akka.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
    extends CreateNewPresentationPodPubMsgHdlr
    with GetPresentationInfoReqMsgHdlr
    with GetAllPresentationPodsReqMsgHdlr
    with SetCurrentPresentationPubMsgHdlr
    with RemovePresentationPodPubMsgHdlr {

  val log = Logging(context.system, getClass)
}

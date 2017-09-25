package org.bigbluebutton.common2.msgs


// ------------ client to akka-apps ------------
object CreateNewPresentationPodPubMsg { val NAME = "CreateNewPresentationPodPubMsg"}
case class CreateNewPresentationPodPubMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodPubMsgBody) extends StandardMsg
case class CreateNewPresentationPodPubMsgBody(ownerId: String)

object RemovePresentationPodPubMsg { val NAME = "RemovePresentationPodPubMsg"}
case class RemovePresentationPodPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPodPubMsgBody) extends StandardMsg
case class RemovePresentationPodPubMsgBody(requesterId: String, podId: String)

// ------------ client to akka-apps ------------


// ------------ bbb-common-web to akka-apps ------------

// ------------ bbb-common-web to akka-apps ------------


// ------------ akka-apps to client ------------
object CreateNewPresentationPodEvtMsg { val NAME = "CreateNewPresentationPodEvtMsg"}
case class CreateNewPresentationPodEvtMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodEvtMsgBody) extends StandardMsg
case class CreateNewPresentationPodEvtMsgBody(ownerId: String, podId: String)

object RemovePresentationPodEvtMsg { val NAME = "RemovePresentationPodEvtMsg"}
case class RemovePresentationPodEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationPodEvtMsgBody) extends StandardMsg
case class RemovePresentationPodEvtMsgBody( ownerId: String, podId: String)


// ------------ akka-apps to client ------------


// ------------ akka-apps to bbb-common-web ------------
// ------------ akka-apps to bbb-common-web ------------

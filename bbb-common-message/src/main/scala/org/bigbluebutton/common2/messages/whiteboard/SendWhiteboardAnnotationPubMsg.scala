package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.domain.AnnotationVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object SendWhiteboardAnnotationPubMsg { val NAME = "SendWhiteboardAnnotationPubMsg"}
case class SendWhiteboardAnnotationPubMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationPubMsgBody) extends StandardMsg
case class SendWhiteboardAnnotationPubMsgBody(annotation: AnnotationVO)

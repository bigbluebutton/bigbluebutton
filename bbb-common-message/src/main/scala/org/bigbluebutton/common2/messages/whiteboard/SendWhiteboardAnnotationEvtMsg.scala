package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.domain.AnnotationProps
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object SendWhiteboardAnnotationEvtMsg { val NAME = "SendWhiteboardAnnotationEvtMsg" }
case class SendWhiteboardAnnotationEvtMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationEvtMsgBody) extends BbbCoreMsg
case class SendWhiteboardAnnotationEvtMsgBody(annotation: AnnotationProps)

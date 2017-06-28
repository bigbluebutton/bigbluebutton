package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.domain.AnnotationVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object GetWhiteboardAnnotationsRespMsg { val NAME = "GetWhiteboardAnnotationsRespMsg" }
case class GetWhiteboardAnnotationsRespMsg(header: BbbClientMsgHeader, body: GetWhiteboardAnnotationsRespMsgBody) extends BbbCoreMsg
case class GetWhiteboardAnnotationsRespMsgBody(whiteboardId: String, annotations: Array[AnnotationVO])

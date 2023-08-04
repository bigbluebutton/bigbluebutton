package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.QuestionsModel

trait GetAutoApproveQuestionsReqMsgHdlr {
  this: QuestionsApp2x =>

  def handle(msg: GetAutoApproveQuestionsReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received GetAutoApproveQuestionsReqMsg {}", GetAutoApproveQuestionsReqMsg)
    def broadcastEvent(msg: GetAutoApproveQuestionsReqMsg, autoApprove: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetAutoApproveQuestionsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetAutoApproveQuestionsRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetAutoApproveQuestionsRespMsgBody(autoApprove)
      val event = GetAutoApproveQuestionsRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val autoApprove = QuestionsModel.getAutoApproveQuestions(liveMeeting.questionsModel);

    broadcastEvent(msg, autoApprove)
  }
}

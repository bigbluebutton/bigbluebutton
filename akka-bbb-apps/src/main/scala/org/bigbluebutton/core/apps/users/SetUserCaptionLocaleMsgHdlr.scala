package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.LocaleUtil

trait SetUserCaptionLocaleMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserCaptionLocaleReqMsg(msg: SetUserCaptionLocaleReqMsg): Unit = {
    log.info("handleSetUserCaptionLocaleReqMsg: locale={} provider={} userId={}", msg.body.locale, msg.body.provider, msg.header.userId)

    def broadcastUserCaptionLocaleChanged(user: UserState, locale: String, provider: String): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserCaptionLocaleChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserCaptionLocaleChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, user.intId)

      val bodyChange = UserCaptionLocaleChangedEvtMsgBody(locale, provider)
      val eventChange = UserCaptionLocaleChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    if (!LocaleUtil.isValidLocale(msg.body.locale, allowEmpty = true)) {
      log.warning(
        "Ignoring caption locale from user {} in meeting {}: invalid locale '{}'",
        msg.header.userId, liveMeeting.props.meetingProp.intId, msg.body.locale
      )
    } else {
      for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      } yield {
        Users2x.setUserCaptionLocale(liveMeeting.users2x, msg.header.userId, msg.body.locale)
        broadcastUserCaptionLocaleChanged(user, msg.body.locale, msg.body.provider)
      }
    }

  }
}

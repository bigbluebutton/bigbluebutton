package org.bigbluebutton.common2.messages


object Guests {
  object GetGuestsWaitingApprovalRespMsg {
    val NAME = "GetGuestsWaitingApprovalRespMsg"

    def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GetGuestsWaitingApprovalRespMsg = {
      val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

      val body = GetGuestsWaitingApprovalRespMsgBody(guests)
      GetGuestsWaitingApprovalRespMsg(header, body)
    }
  }

  case class GetGuestsWaitingApprovalRespMsg(header: BbbClientMsgHeader,
                                             body: GetGuestsWaitingApprovalRespMsgBody) extends BbbCoreMsg
  case class GetGuestsWaitingApprovalRespMsgBody(guests: Vector[GuestWaitingVO])

  case class GuestWaitingVO(intId: String, name: String, role: String)

  object GuestsWaitingApprovalEvtMsg {
    val NAME = "GuestsWaitingApprovalEvtMsg"

    def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GuestsWaitingApprovalEvtMsg = {
      val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

      val body = GuestsWaitingApprovalEvtMsgBody(guests)
      GuestsWaitingApprovalEvtMsg(header, body)
    }
  }

  case class GuestsWaitingApprovalEvtMsg(header: BbbClientMsgHeader,
                                         body: GuestsWaitingApprovalEvtMsgBody) extends BbbCoreMsg
  case class GuestsWaitingApprovalEvtMsgBody(guests: Vector[GuestWaitingVO])

  object GuestsWaitingApprovedEvtMsg {
    val NAME = "GuestsWaitingApprovedEvtMsg"

    def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GuestsWaitingApprovedEvtMsg = {
      val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

      val body = GuestsWaitingApprovedEvtMsgBody(guests)
      GuestsWaitingApprovedEvtMsg(header, body)
    }
  }

  case class GuestsWaitingApprovedEvtMsg(header: BbbClientMsgHeader,
                                         body: GuestsWaitingApprovedEvtMsgBody) extends BbbCoreMsg
  case class GuestsWaitingApprovedEvtMsgBody(guests: Vector[GuestWaitingVO])

  object GuestsWaitingApprovedMsg {
    val NAME = "GuestsWaitingApprovedMsg"

    def apply(meetingId: String, userId: String, guests: Vector[String]): GuestsWaitingApprovedMsg = {
      val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

      val body = GuestsWaitingApprovedMsgBody(guests)
      GuestsWaitingApprovedMsg(header, body)
    }
  }

  case class GuestsWaitingApprovedMsg(header: BbbClientMsgHeader,
                                      body: GuestsWaitingApprovedMsgBody) extends BbbCoreMsg
  case class GuestsWaitingApprovedMsgBody(guests: Vector[String])


}

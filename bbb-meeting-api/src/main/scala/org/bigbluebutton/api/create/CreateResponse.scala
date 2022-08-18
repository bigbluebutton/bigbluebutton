package org.bigbluebutton.api.create

import org.bigbluebutton.common2.domain.DefaultProps

object CreateResponse {

  case class SuccessWithMeetingInfoResponse(msg: String, defaultprops: DefaultProps) {
    def toXml =
      <response>
        <returncode>SUCCESS</returncode>
        <meetingID>
          {defaultprops.meetingProp.extId}
        </meetingID>
        <internalMeetingID>
          {defaultprops.meetingProp.intId}
        </internalMeetingID>
        <parentMeetingID>
          {defaultprops.breakoutProps.parentId}
        </parentMeetingID>
        <attendeePW>
          {defaultprops.password.viewerPass}
        </attendeePW>
        <moderatorPW>
          {defaultprops.password.moderatorPass}
        </moderatorPW>
        <createTime>
          {defaultprops.durationProps.createdTime}
        </createTime>
        <voiceBridge>
          {defaultprops.voiceProp.telVoice}
        </voiceBridge>
        <dialNumber>
          {defaultprops.voiceProp.dialNumber}
        </dialNumber>
        <createDate>
          {defaultprops.durationProps.createdDate}
        </createDate>
        <hasUserJoined>false</hasUserJoined>
        <duration>0</duration>
        <hasBeenForciblyEnded>false</hasBeenForciblyEnded>
        <messageKey/>
        <message>
          {msg}
        </message>
      </response>
  }

  case class FailedResponse(messageKey: String, msg: String) {
    def toXml: xml.Elem = <response>
      <returncode>FAILED</returncode>
      <messageKey>
        {messageKey}
      </messageKey>
      <message>
        {msg}
      </message>
    </response>
  }

}

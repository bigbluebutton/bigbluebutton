<#-- GET_RECORDINGS FreeMarker XML template -->
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${returnCode}</returncode>
  <#list meetingDetailsList>
  <meetings>
    <#items as meetingDetail>
      <#assign meeting = meetingDetail.getMeeting()>
      <meeting>
        <meetingName>${meeting.getName()}</meetingName>
        <meetingID>${meeting.getExternalId()}</meetingID>
        <internalMeetingID>${meeting.getInternalId()}</internalMeetingID>
        <createTime>${meeting.getCreateTime()?c}</createTime>
        <createDate>${meetingDetail.getCreatedOn()}</createDate>
        <voiceBridge>${meeting.getTelVoice()}</voiceBridge>
        <dialNumber>${meeting.getDialNumber()}</dialNumber>
        <attendeePW>${meeting.getViewerPassword()}</attendeePW>
        <moderatorPW>${meeting.getModeratorPassword()}</moderatorPW>
        <running>${meeting.isRunning()?c}</running>
        <duration>${meeting.getDuration()}</duration>
        <hasUserJoined>${meeting.hasUserJoined()?c}</hasUserJoined>
        <recording>${meeting.isRecord()?c}</recording>
        <hasBeenForciblyEnded>${meeting.isForciblyEnded()?c}</hasBeenForciblyEnded>
        <startTime>${meeting.getStartTime()?c}</startTime>
        <endTime>${meeting.getEndTime()}</endTime>
        <participantCount>${meeting.getNumUsers()}</participantCount>
        <listenerCount>${meeting.getNumListenOnly()}</listenerCount>
        <voiceParticipantCount>${meeting.getNumVoiceJoined()}</voiceParticipantCount>
        <videoCount>${meeting.getNumVideos()}</videoCount>
        <maxUsers>${meeting.getMaxUsers()}</maxUsers>
        <moderatorCount>${meeting.getNumModerators()}</moderatorCount>
        <attendees>
        <#list meetingDetail.meeting.getUsers() as att>
          <attendee>
              <userID>${att.getInternalUserId()}</userID>
              <fullName>${att.getFullname()}</fullName>
              <role>${att.getRole()}</role>
              <isPresenter>${att.isPresenter()?c}</isPresenter>
              <isListeningOnly>${att.isListeningOnly()?c}</isListeningOnly>
              <hasJoinedVoice>${att.isVoiceJoined()?c}</hasJoinedVoice>
              <hasVideo>${att.hasVideo()?c}</hasVideo>
              <#if meeting.getUserCustomData(att.getExternalUserId())??>
                  <#assign ucd = meetingDetail.meeting.getUserCustomData(att.getExternalUserId())>
                  <customdata>
                      <#list ucd?keys as prop>
                          <${prop}><![CDATA[${ucd[prop]}]]></${prop}>
                      </#list>
                  </customdata>
              </#if>
          </attendee>
        </#list>
        </attendees>
        <#assign m = meetingDetail.meeting.getMetadata()>
        <metadata>
        <#list m?keys as prop>
           <${prop}><![CDATA[${m[prop]}]]></${prop}>
        </#list>
        </metadata>

        <#if meetingDetail.meeting.isBreakout()>
          <breakout>
           <parentMeetingID>${meetingDetail.meeting.getParentMeetingId()}</parentMeetingID>
           <sequence>${meetingDetail.meeting.getSequence()}</sequence>
          </breakout>
        </#if>

        <#list meetingDetail.meeting.getBreakoutRooms()>
           <breakoutRooms>
           <#items as room>
              <breakout>${room}</breakout>
           </#items>
           </breakoutRooms>
        </#list>
      </meeting>
    </#items>
  </meetings>
  </#list>
</response>
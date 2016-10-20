<#-- GET_RECORDINGS FreeMarker XML template -->
<#compress>
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${returnCode}</returncode>
  <meetingName>${meeting.getName()}</meetingName>
  <isBreakout>${meeting.isBreakout()?c}</isBreakout>
  <meetingID>${meeting.getExternalId()}</meetingID>
  <internalMeetingID>${meeting.getInternalId()}</internalMeetingID>
  <createTime>${meeting.getCreateTime()}</createTime>
  <createDate>${createdOn}</createDate>
  <voiceBridge>${meeting.getTelVoice()}</voiceBridge>
  <dialNumber>${meeting.getDialNumber()}</dialNumber>
  <attendeePW>${meeting.getViewerPassword()}</attendeePW>
  <moderatorPW>${meeting.getModeratorPassword()}</moderatorPW>
  <running>${meeting.isRunning()?c}</running>
  <duration>${meeting.getDuration()}</duration>
  <hasUserJoined>${meeting.hasUserJoined()?c}</hasUserJoined>
  <recording>${meeting.isRecord()?c}</recording>
  <hasBeenForciblyEnded>${meeting.isForciblyEnded()?c}</hasBeenForciblyEnded>
  <startTime>${meeting.getStartTime()}</startTime>
  <endTime>${meeting.getEndTime()}</endTime>
  <participantCount>${meeting.getNumUsers()}</participantCount>
  <listenerCount>${meeting.getNumListenOnly()}</listenerCount>
  <voiceParticipantCount>${meeting.getNumVoiceJoined()}</voiceParticipantCount>
  <videoCount>${meeting.getNumVideos()}</videoCount>
  <maxUsers>${meeting.getMaxUsers()}<maxUsers>
  <moderatorCount>${meeting.getNumModerators()}</moderatorCount>
  <attendees>
  <#list meeting.getUsers() as att>
    <attendee>
        <userID>${att.getInternalUserId()}</userID>
        <fullName>${att.getFullname()}</fullName>
        <role>${att.getRole()}</role>
        <isPresenter>${att.isPresenter()}</isPresenter>
        <isListeningOnly>${att.isListeningOnly()}</isListeningOnly>
        <hasJoinedVoice>${att.isVoiceJoined()}</hasJoinedVoice>
        <hasVideo>${att.hasVideo()}</hasVideo>
        <#assign ucd = r.getUserCustomData(att.getExternalUserId())>
        <customdata>
          <#list ucd?keys as prop>
            <${prop}><![CDATA[${ucd[prop]}]]></${prop}>
          </#list>
        </customdata>
  </attendees>
  <#assign m = r.getMetadata()>
  <metadata>
  <#list m?keys as prop>
     <${prop}><![CDATA[${m[prop]}]]></${prop}>
  </#list>
  </metadata>
  <messageKey>${messageKey}</messageKey>
  <message>${message}</message>
</response>
</#compress>

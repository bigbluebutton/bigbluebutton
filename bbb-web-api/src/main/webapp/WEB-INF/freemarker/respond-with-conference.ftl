<#-- GET_RECORDINGS FreeMarker XML template -->
<#compress>
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${returnCode}</returncode>
  <meetingID>${meeting.getExternalId()}</meetingID>
  <attendeePW>${meeting.getViewerPassword()}</attendeePW>
  <moderatorPW>${meeting.getModeratorPassword()}</moderatorPW>
  <createTime>${meeting.getCreateTime()}</createTime>
  <voiceBridge>${meeting.getTelVoice()}</voiceBridge>
  <dialNumber>${meeting.getDialNumber()}</dialNumber>
  <createDate>${createdOn}</createDate>
  <hasUserJoined>${meeting.hasUserJoined()?c}</hasUserJoined>
  <duration>${meeting.getDuration()?c}</duration>
  <hasBeenForciblyEnded>${meeting.isForciblyEnded()?c}</hasBeenForciblyEnded>
  <messageKey>${messageKey}</messageKey>
  <message>${message}</message>
</response>
</#compress>

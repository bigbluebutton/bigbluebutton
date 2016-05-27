<#-- GET_RECORDINGS FreeMarker XML template -->
<#compress>
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${code}</returncode>
  <recordings>
  </recordings>
  <messageKey>noRecordings</messageKey>
  <message>There are not recordings for the meetings</message>
</response>
</#compress>

<#-- GET_RECORDINGS FreeMarker XML template -->
<#compress>
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${returnCode}</returncode>
  <recordings>
  <#list recordings as r>
    <recording>
      <recordID>${r.getId()}</recordID>
      <meetingID>${r.getMeeting().getId()?html}</meetingID>
      <externalMeetingID>${r.getMeeting().getExternalId()?html}</externalMeetingID>
      <name><![CDATA[${r.getMeeting().getName()}]]></name>
      <isBreakout>${r.getMeeting().isBreakout()?c}</isBreakout>
      <published>${r.getPublished()?string}</published>
      <state>${r.getState()?string}</state>
      <startTime><#if r.getStartTime()?? && r.getStartTime() != "">${r.getStartTime()}</#if></startTime>
      <endTime><#if r.getEndTime()?? && r.getEndTime() != "">${r.getEndTime()}</#if></endTime>
      <participants><#if r.getParticipants()??>${r.getParticipants()}</#if></participants>
      <#if r.getBreakout()??>
        <#assign breakout = r.getBreakout()>
        <breakout>
          <parentId>${breakout.getParentMeetingId()}</parentId>
          <sequence>${breakout.getSequence()?c}</sequence>
        </breakout>
      </#if>
      <#if r.getBreakoutRooms()??>
        <#list r.getBreakoutRooms()>
        <breakoutRooms>
          <#items as broom>
          <breakoutRoom>${broom.getValue()}</breakoutRoom>
          </#items>
        </breakoutRooms>
        </#list>
      </#if>
      <#assign m = r.getMeta().get()>
      <metadata>
      <#list m?keys as prop>
        <${prop}><![CDATA[${m[prop]}]]></${prop}>
      </#list>
      </metadata>
      <#assign pb = r.getPlayback()>
      <playback>
         <format>${pb.getFormat()}</format>
         <link>${pb.getLink()}</link>
         <processingTime>${pb.getProcessingTime()?c}</processingTime>
         <duration>${pb.getDuration()?c}</duration>
         <#if pb.getExtensions()??>
         <extensions>
           <#if pb.getExtensions().getPreview()??>
           <#assign prev = pb.getExtensions().getPreview()>
           <preview>
             <#list prev.getImages()>
             <images>
             <#items as image>
                <image width="${image.getWidth()}" height="${image.getHeight()}" alt="${image.getAlt()}">${image.getValue()}</image>
             </#items>
             </images>
             </#list>
           </preview>
           </#if>
         </extensions>
         </#if>
      </playback>
    </recording>
  </#list>
  </recordings>
</response>
</#compress>
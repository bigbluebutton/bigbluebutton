<#-- GET_RECORDINGS FreeMarker XML template -->
<#compress>
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${code}</returncode>
  <recordings>
  <#-- Where recs is a String -> Recording HashMap -->
  <#list recs as r>
    <recording>
      <recordID>${r.getId()}</recordID>
      <meetingID><#if r.getMeetingID()?? && r.getMeetingID() != "">${r.getMeetingID()?html}</#if></meetingID>
      <name><#if r.getName()?? && r.getName() != ""><![CDATA[${r.getName()}]]></#if></name>
      <published>${r.isPublished()?string}</published>
      <state>${r.getState()?string}</state>
      <startTime><#if r.getStartTime()?? && r.getStartTime() != "">${r.getStartTime()}</#if></startTime>
      <endTime><#if r.getEndTime()?? && r.getEndTime() != "">${r.getEndTime()}</#if></endTime>
      <#assign m = r.getMetadata()>
      <metadata>
      <#list m?keys as prop>
        <${prop}><![CDATA[${m[prop]}]]></${prop}>
      </#list>
      </metadata>
      <playback>
        <#if r.getPlaybacks()??>
        <#list r.getPlaybacks() as p>
          <#if p?? && p.getFormat()??>
          <format>
            <type>${p.getFormat()}</type>
            <url>${p.getUrl()}</url>
            <length>${p.getLength()}</length>
            <#-- Missing p.getExtensions() -->
          </format>
          </#if>
        </#list>
        </#if>
      </playback>
    </recording>
  </#list>
  </recordings>
</response>
</#compress>
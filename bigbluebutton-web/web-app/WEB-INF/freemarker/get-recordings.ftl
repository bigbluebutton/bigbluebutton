<#-- GET_RECORDINGS FreeMarker XML template -->
<response>
  <#-- Where code is a 'SUCCESS' or 'FAILED' String -->
  <returncode>${code}</returncode>
  <recordings>
  <#-- Where recs is a String -> Recording HashMap -->
  <#list recs as r>
    <recording>
      <recordID>${r.getId()}</recordID>
      <meetingID>${r.getMeetingID()?html}</meetingID>
      <name><![CDATA[${r.getName()}]]></name>
      <published>${r.isPublished()?string}</published>
      <startTime>${r.getStartTime()}</startTime>
      <endTime>${r.getEndTime()}</endTime>
      <#assign m = r.getMetadata()>
      <metadata>
      <#list m?keys as prop>
        <${prop}><![CDATA[${m[prop]}]]></${prop}>
      </#list>
      </metadata>
      <playback>
        <#list r.getPlaybacks() as p>
          <format>
            <type>${p.getFormat()}</type>
            <url>${p.getUrl()}</url>
            <length>${p.getLength()}</length>
            <#-- Missing p.getExtensions() -->
          </format>
        </#list>
      </playback>
    </recording>
  </#list>
  </recordings>
</response>
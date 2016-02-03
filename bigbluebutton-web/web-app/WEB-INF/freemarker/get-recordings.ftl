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
      <meetingID>${r.getMeetingID()?html}</meetingID>
      <name><![CDATA[${r.getName()}]]></name>
      <published>${r.isPublished()?string}</published>
      <startTime>${r.getStartTime()}</startTime>
      <endTime>${r.getEndTime()}</endTime>
      <size>${r.getSize()}</size>
      <rawSize>${r.getRawSize()}</rawSize>
      <#assign m = r.getMetadata()>
      <metadata>
      <#list m?keys?sort as prop>
        <${prop}><![CDATA[${m[prop]}]]></${prop}>
      </#list>
      </metadata>
      <playback>
        <#list r.getPlaybacks() as p>
          <format>
            <type>${p.getFormat()}</type>
            <url>${p.getUrl()}</url>
            <length>${p.getLength()}</length>
            <size>${p.getSize()}</size>
            <#-- Missing p.getExtensions() -->
          </format>
        </#list>
      </playback>
      <download>
        <#list r.getDownloads() as p>
          <format>
            <type>${p.getFormat()}</type>
            <url>${p.getUrl()}</url>
            <md5>${p.getMd5()}</md5>
            <key>${p.getKey()}</key>
            <length>${p.getLength()}</length>
            <size>${p.getSize()}</size>
          </format>
        </#list>
      </download>
    </recording>
  </#list>
  </recordings>
</response>
</#compress>

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
      <size><#if r.getSize()?? && r.getSize() != "">${r.getSize()}</#if></size>
      <rawSize><#if r.getRawSize()?? && r.getRawSize() != "">${r.getRawSize()}</#if></rawSize>
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
            <size>${p.getSize()}</size>
            <#-- Missing p.getExtensions() -->
          </format>
          </#if>
        </#list>
        </#if>
      </playback>
      <download>
        <#if r.getDownloads()??>
        <#list r.getDownloads() as p>
          <#if p?? && p.getFormat()??>
          <format>
            <type>${p.getFormat()}</type>
            <url>${p.getUrl()}</url>
            <md5>${p.getMd5()}</md5>
            <key>${p.getKey()}</key>
            <length>${p.getLength()}</length>
            <size>${p.getSize()}</size>
          </format>
          </#if>
        </#list>
        </#if>
      </download>
    </recording>
  </#list>
  </recordings>
</response>
</#compress>
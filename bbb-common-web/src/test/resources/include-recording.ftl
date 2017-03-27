<recordID>${r.getId()}</recordID>

<#if r.getMeeting()??>
    <meetingID>${r.getMeeting().getId()?html}</meetingID>
    <externalMeetingID>${r.getMeeting().getExternalId()?html}</externalMeetingID>
    <name><![CDATA[${r.getMeeting().getName()}]]></name>
    <isBreakout>${r.getMeeting().isBreakout()?c}</isBreakout>
<#else>
    <meetingID>${r.getMeetingId()?html}</meetingID>
    <name><![CDATA[${r.getMeetingName()}]]></name>
    <isBreakout>${r.isBreakout()?c}</isBreakout>
</#if>

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
        <${prop}><![CDATA[${(m[prop])!""}]]></${prop}>
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
                    <#if prev.getImages()??>
                        <#list prev.getImages()>
                            <images>
                                <#if image??>
                                    <#items as image>
                                        <image width="${image.getWidth()}" height="${image.getHeight()}" alt="${image.getAlt()}">${image.getValue()}</image>
                                    </#items>
                                </#if>
                            </images>
                        </#list>
                    </#if>
                </preview>
            </#if>
        </extensions>
    </#if>
</playback>

/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.api;

import groovy.util.XmlSlurper;
import groovy.util.slurpersupport.GPathResult;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RecordingServiceHelperImp implements RecordingServiceHelper {
    private static Logger log = LoggerFactory.getLogger(RecordingServiceHelperImp.class);
    /*
    <recording>
        <id>6e35e3b2778883f5db637d7a5dba0a427f692e91-1398363221956</id>
        <state>available</state>
        <published>true</published>
        <start_time>1398363223514</start_time>
        <end_time>1398363348994</end_time>
        <playback>
            <format>presentation</format>
            <link>http://example.com/playback/presentation/playback.html?meetingID=6e35e3b2778883f5db637d7a5dba0a427f692e91-1398363221956</link>
            <processing_time>5429</processing_time>
            <duration>101014</duration>
            <extension>
                ... Any XML element, to be passed through into playback format element.
            </extension>
        </playback>
        <meta>
            <meetingId>English 101</meetingId>
            <meetingName>English 101</meetingName>
            <description>Test recording</description>
            <title>English 101</title>
        </meta>
    </recording>
    */

    public void writeRecordingInfo(String path, Recording info) {
        def writer = new StringWriter()
        def builder = new groovy.xml.MarkupBuilder(writer)
        def metadataXml = builder.recording {
            builder.id(info.getId())
            builder.state(info.getState())
            builder.published(info.isPublished())
            builder.start_time(info.getStartTime())
            builder.end_time(info.getEndTime())
            if ( info.getPlaybackFormat() == null ) {
                builder.playback()
            } else {
                builder.playback {
                    builder.format(info.getPlaybackFormat())
                    builder.link(info.getPlaybackLink())
                    builder.duration(info.getPlaybackDuration())
                    builder.extension(info.getPlaybackExtensions())
                }
            }
            Map<String,String> metainfo = info.getMetadata();
            builder.meta{
                metainfo.keySet().each { key ->
                    builder."$key"(metainfo.get(key))
                }
            }
        }
        def xmlEventFile = new File(path + File.separatorChar + "metadata.xml")
        xmlEventFile.write writer.toString()
    }

    public Recording getRecordingInfo(File dir) {
        if (dir.isDirectory()) {
            try {
                File file = new File(dir.getPath() + File.separatorChar + "metadata.xml");
                if ( file ) {
                    def recording = new XmlSlurper().parse(file);
                    return getInfo(recording);
                }
            } catch ( FileNotFoundException e) {
                // Do nothing, just return null
            } catch ( Exception e) {
                log.debug(e.getMessage())
            }
        }
        return null;
    }

    private Recording getInfo(GPathResult rec) {
        Recording r = new Recording();
        r.setId(rec.id.text());
        r.setState(rec.state.text());
        r.setPublished(Boolean.parseBoolean(rec.published.text()));
        r.setStartTime(rec.start_time.text());
        r.setEndTime(rec.end_time.text());
        if ( !rec.playback.text().equals("") ) {
            r.setPlaybackFormat(rec.playback.format.text());
            r.setPlaybackLink(rec.playback.link.text());
            r.setPlaybackDuration(rec.playback.duration.text());
        }

/*
        Commenting this out to see if this is causing memory to hang around resulting in
        OOM in tomcat7 (ralam july 23, 2015)
        r.setPlaybackExtensions(rec.playback.extension.children());
*/		
        Map<String, String> meta = new HashMap<String, String>();
        rec.meta.children().each { anode ->
            meta.put(anode.name().toString(), anode.text().toString());
        }
        r.setMetadata(meta);
        return r;
    }

}

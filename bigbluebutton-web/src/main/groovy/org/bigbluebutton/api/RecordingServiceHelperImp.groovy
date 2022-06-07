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

import groovy.json.JsonBuilder;
import groovy.util.XmlSlurper;
import groovy.util.slurpersupport.Attributes;
import groovy.util.slurpersupport.GPathResult;
import groovy.xml.MarkupBuilder;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;

import org.bigbluebutton.api.domain.Extension;
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
              <!-- Any XML element, to be passed through into playback format element. -->
              <preview> <!-- The first level is the name of the extension -->
                <text>Instrument Flying</text>
                <images>
                  <image width="176" height="136" alt="Instrument Flying">http://bbb-server/.../thumb-1.png</image>
                  <image width="176" height="136" alt="Course Structure">http://bbb-server/.../thumb-2.png</image>
                  <image width="176" height="136" alt="Requirements">http://bbb-server/.../thumb-3.png</image>
                </images>
              </preview>
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
        builder.recording {
            builder.id(info.getId())
            builder.state(info.getState())
            builder.published(info.isPublished())
            builder.start_time(info.getStartTime())
            builder.end_time(info.getEndTime())
            builder.raw_size(info.getRawSize())
            if ( info.getPlaybackFormat() == null ) {
                builder.playback()
            } else {
                builder.playback {
                    builder.format(info.getPlaybackFormat())
                    builder.link(info.getPlaybackLink())
                    builder.duration(info.getPlaybackDuration())
                    builder.size(info.getPlaybackSize())
                    builder.processing_time(info.getProcessingTime())
                    def extensions = info.getPlaybackExtensions()
                    if ( !extensions.isEmpty() ) {
                        builder.extensions {
                            extensions.each { extension ->
                                def extensionType = extension.getType()
                                builder."${extensionType}"{
                                    extensionPropertiesToXML(builder, extension.getProperties())
                                }
                            }
                        }
                    }
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

    public Recording getRecordingInfo(String id, String recordingDir, String playbackFormat) {
        String path = recordingDir + File.separatorChar + playbackFormat + File.separatorChar + id;
        File dir = new File(path);
        return getRecordingInfo(dir);
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
                log.error(e);
            } catch ( Exception e) {
                log.error(e)
            }
        }
        return null;
    }

    private Recording getInfo(GPathResult rec) {
        Recording r = new Recording();
        //Add basic information
        r.setId(rec.id.text());
        r.setState(rec.state.text());
        r.setPublished(Boolean.parseBoolean(rec.published.text()));
        r.setStartTime(rec.start_time.text());
        r.setEndTime(rec.end_time.text());
        r.setNumParticipants(rec.participants.text());
        r.setRawSize(rec.raw_size.text());
        if ( !rec.playback.text().equals("") ) {
            r.setPlaybackFormat(rec.playback.format.text());
            r.setPlaybackLink(rec.playback.link.text());
            r.setPlaybackDuration(rec.playback.duration.text());
            r.setPlaybackSize(rec.playback.size.text());
            r.setProcessingTime(rec.playback.processing_time.text());
        }

        //Add extensions
        List<Extension> extensions = new ArrayList<Extension>()
        rec.playback.extensions.children().each { extension ->
            extensions.add( new Extension(extension.name(), extensionPropertiesToMap(extension)) )
        }
        r.setPlaybackExtensions(extensions)

        //Add metadata
        Map<String, String> meta = new HashMap<String, String>();
        rec.meta.children().each { anode ->
            meta.put(anode.name().toString(), anode.text().toString());
        }
        r.setMetadata(meta);
        return r;
    }

    private Map<String, ?> processNode( Map<String, ?> map, node) {
        if (  !map[node.name()] ) {
            map[node.name()] = map.getClass().newInstance()
        }
        Map<String, ?> nodeMap = map[node.name()]
        node.children().each { it ->
            if (it.children().size() == 0) {
                processLeaf( nodeMap, it)
            } else {
                processNode( nodeMap, it)
            }
        }
        nodeMap
    }

    private Map<String, ?> processLeaf(Map<String, ?> map, node) {
        //Initialize map for node content
        Map<String, ?> nodeContent = [ : ]
        //Assign node content text
        nodeContent["text"] = node.text()
        //Assign node content attributes (if any)
        Map attributes = node.attributes()
        if( attributes.size() > 0 ) {
            nodeContent["attributes"] = [ : ]
            attributes.each { attribute ->
              nodeContent["attributes"][attribute.getKey()] = attribute.getValue()
            }
        }
        //Add content to the node
        if ( map[node.name()] == null ) {
            map[node.name()] = nodeContent
        } else {
            if ( ! (map[node.name()] instanceof List) ) {
                map[node.name()] = [ map[node.name()] ]
            }
            map[node.name()] << nodeContent
        }
        map
    }

    private Map<String, ?> extensionPropertiesToMap(GPathResult xml) {
        Map<String, ?> map = [ : ]
        xml.children().each {
            if ( it.children().size() == 0 ) {
                processLeaf(map, it)
            } else {
                processNode(map, it)
            }
        }
        map
    }

    private void processMap(builder, node) {
        node.each { key, value ->
            if ( value instanceof Collection ) {
                processCollection(builder, key, value)
            } else if ( value instanceof Map ) {
                if ( value.containsKey("text") && value.containsKey("attributes") ) {
                    builder."${key}"(value["attributes"], value["text"])
                } else {
                    builder."${key}" {
                        processMap(builder, value)
                    }
                }
            } else {
                builder."${key}"(value)
            }
        }
    }

    private void processCollection(builder, nodesKey, nodes) {
        nodes.each { node ->
            processMap(builder, [ "${nodesKey}" : node ])
        }
    }

    private void extensionPropertiesToXML(builder, properties) {
        properties.each { propertyKey, propertyValue ->
            if ( propertyValue instanceof Collection ) {
                builder."${propertyKey}" {
                    processCollection(builder, propertyKey, propertyValue)
                }
            } else {
                builder."${propertyKey}" {
                    processMap(builder, propertyValue)
                }
            }
        }
    }
}

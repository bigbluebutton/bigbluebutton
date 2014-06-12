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
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RecordingServiceHelperImp implements RecordingServiceHelper {
	private static Logger log = LoggerFactory.getLogger(RecordingServiceHelperImp.class);
	/*
	<recording>
		<id>Demo Meeting-3243244</id>
		<state>available</state>
		<published>true</published>
		<start_time>3553545445</start_time>
		<end_time>5674545234</end_time>
		<playback>
			<format>simple</format>
			<link>http://server.com/simple/playback?recordingID=Demo Meeting-3243244</link>
		</playback>
		<meta>
			<title>Test Recording 2</title>
			<subject>English 232 session</subject>
			<description>Second  test recording</description>
			<creator>Omar Shammas</creator>
			<contributor>Blindside</contributor>
			<language>en_US</language>
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
			builder.playback {
				builder.format(info.getPlaybackFormat())
				builder.link(info.getPlaybackLink())	
				builder.duration(info.getPlaybackDuration())
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
		String path = recordingDir + File.separatorChar + playbackFormat;		
		File dir = new File(path);
		if (dir.isDirectory()) {
			def recording = new XmlSlurper().parse(new File(path + File.separatorChar + id + File.separatorChar + "metadata.xml"));
			return getInfo(recording);
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
		r.setPlaybackFormat(rec.playback.format.text());
		r.setPlaybackLink(rec.playback.link.text());
		r.setPlaybackDuration(rec.playback.duration.text());
		
		Map<String, String> meta = new HashMap<String, String>();		
		rec.meta.children().each { anode ->
				log.debug("metadata: "+anode.name()+" "+anode.text())
				meta.put(anode.name().toString(), anode.text().toString());
		}
		r.setMetadata(meta);
		return r;
	}

}

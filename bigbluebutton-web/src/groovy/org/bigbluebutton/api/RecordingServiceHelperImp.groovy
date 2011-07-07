package org.bigbluebutton.api;

import groovy.util.XmlSlurper;
import groovy.util.slurpersupport.GPathResult;
import java.io.File;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;

public class RecordingServiceHelperImp implements RecordingServiceHelper {
	/*
	<recording>
		<id>Demo Meeting-3243244</id>
		<state>available</state>
		<published>true</published>
		<start_time>Thu Mar 04 14:05:56 UTC 2010</start_time>
		<end_time>Thu Mar 04 15:01:01 UTC 2010</end_time>
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
			builder.identity(info.getId())
			builder.state(info.getState())
			builder.published(info.isPublished())
			builder.start_time(info.getStartTime())
			builder.end_time(info.getEndTime())
			builder.playback {
				builder.format(info.getPlaybackFormat())
				builder.link(info.getPlaybackLink())	
			}
			Map<String,String> meta = info.getMetadata();
			meta.keySet().each { key ->
				builder."$key"(meta.get(key))
			} 
		}
		
		xmlEventFile = new File(path + File.pathSeparatorChar + "metadata.xml")
		xmlEventFile.write writer.toString()
	}
		
	public Recording getRecordingInfo(String id, String recordingDir, String playbackFormat) {
		String path = recordingDir + File.pathSeparator + playbackFormat;		
		File dir = new File(path);
		if (dir.isDirectory()) {
			def recording = new XmlSlurper().parse(new File(path + File.pathSeparatorChar + "metadata.xml"));
			return getInfo(recording);
		}
		return null;
	}
	
	private Recording getInfo(GPathResult rec) {
		Recording r = new Recording();		
		r.setId(rec.id.text())
		r.setState(rec.state.text())
		r.setPublished(rec.published.text())
		r.setStartTime(rec.start_time.text())
		r.setEndTime(rec.end_time.text())
		r.setPlaybackLink(rec.playback.text())
		
		Map<String, String> meta = new HashMap<String, String>();		
		rec.meta.children().each { anode ->
				meta.put(node.name(), anode.text());
		}
		r.setMetadata(meta);
		
		return r;
	}

}
package org.bigbluebutton.api;

import groovy.util.XmlSlurper;
import groovy.util.slurpersupport.GPathResult;
import java.io.File;
import org.bigbluebutton.api.domain.Recording;

public class RecordingServiceHelperImp implements RecordingServiceHelper {
	public Recording getRecordingInfo(String id, String publishedDir, String playbackFormat) {
		String path = publishedDir + File.pathSeparator + playbackFormat;		
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
package org.bigbluebutton.api;

import org.bigbluebutton.api.domain.Recording;

public interface RecordingServiceHelper {
	public Recording getRecordingInfo(String id, String publishedDir, String playbackFormat);
	public void writeRecordingInfo(String path, Recording info);
}

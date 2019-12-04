package org.bigbluebutton.api2;

import java.io.File;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.RecordingMetadata;
import org.bigbluebutton.api2.domain.UploadedTrack;

import scala.Option;

public interface RecordingServiceGW {

  String getRecordings2x(ArrayList<RecordingMetadata> recs);
  Option<RecordingMetadata> getRecordingMetadata(File xml);
  boolean saveRecordingMetadata(File xml, RecordingMetadata metadata);
  boolean validateTextTrackSingleUseToken(String recordId, String caption, String token);
  String getRecordingTextTracks(String recordId, String captionsDir, String captionBasUrl);
  String putRecordingTextTrack(UploadedTrack track);
}

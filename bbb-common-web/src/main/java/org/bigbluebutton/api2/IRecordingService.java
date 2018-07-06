package org.bigbluebutton.api2;

import java.util.List;
import java.util.Map;

import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.RecordingMetadata;

public interface IRecordingService {
  List<RecordingMetadata> getRecordingsMetadata(List<String> idList, List<String> states);
  Map<String, Recording> getRecordings(List<String> idList, List<String> states);
  List<RecordingMetadata> filterRecordingsByMetadata(List<RecordingMetadata> recsList,
                                                     Map<String, String> metadataFilters);
  Map<String, Recording> filterRecordingsByMetadata(Map<String, Recording> recordings,
                                                    Map<String, String> metadataFilters);
  Map<String, Recording> reorderRecordings(List<Recording> olds);
  boolean existsAnyRecording(List<String> idList);
  void setPublishRecording(List<String> idList, boolean publish);
  void deleteRecordings(List<String> idList);

  void updateRecordings(List<String> idList, Map<String, String> metaParams);
  void processRecording(String meetingId);
}

package org.bigbluebutton.api.util;

import java.io.File;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.RecordingMetadata;
import org.bigbluebutton.api2.RecordingServiceGW;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import scala.Option;

public class RecordingMetadataReaderHelper {
  private static Logger log = LoggerFactory.getLogger(RecordingMetadataReaderHelper.class);

  private RecordingServiceGW recordingServiceGW;

  public String getRecordings2x(ArrayList<RecordingMetadata> recs) {
    return recordingServiceGW.getRecordings2x(recs);
  }

  public RecordingMetadata getRecordingMetadata(File metadataXml) {

    RecordingMetadata recMeta = null;

    Option<RecordingMetadata> rm = recordingServiceGW.getRecordingMetadata(metadataXml);
    if (rm.isDefined()) {
      return rm.get();
    }

    return recMeta;
  }

  public File getMetadataXmlLocation(String destDir) {
    return new File(destDir + File.separatorChar + "metadata.xml");
  }

  public void saveRecordingMetadata(File metadataXml, RecordingMetadata recordingMetadata) {
    recordingServiceGW.saveRecordingMetadata(metadataXml, recordingMetadata);
  }

  public void setRecordingServiceGW(RecordingServiceGW recordingServiceGW) {
    this.recordingServiceGW = recordingServiceGW;
  }
}

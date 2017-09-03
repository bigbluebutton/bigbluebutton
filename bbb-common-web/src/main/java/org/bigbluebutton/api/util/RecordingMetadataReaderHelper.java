package org.bigbluebutton.api.util;


import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.bigbluebutton.api.domain.RecordingMetadata;
import com.fasterxml.jackson.databind.SerializationFeature;

import javax.xml.stream.*;
import java.io.*;
import java.util.ArrayList;

import org.bigbluebutton.api2.RecordingServiceGW;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import scala.Option;
import scala.Some;
import scala.None;

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

    //XMLOutputFactory factory  = XMLOutputFactory.newInstance();
    JacksonXmlModule module   = new JacksonXmlModule();
    module.setDefaultUseWrapper(false);

    XmlMapper mapper  = new XmlMapper(module);

    //Reading from xml file and creating XMLStreamReader
    //XMLStreamWriter writer   = null;
    try {
      //writer = factory.createXMLStreamWriter(new FileOutputStream(metadataXml));
      mapper.enable(SerializationFeature.INDENT_OUTPUT);
      mapper.writeValue(metadataXml, recordingMetadata);
    } catch (FileNotFoundException e) {
      log.error("File not found: " + metadataXml.getAbsolutePath(), e);
    } catch (IOException e) {
      log.error("IOException on " + metadataXml.getAbsolutePath(), e);
    }
  }

  public void setRecordingServiceGW(RecordingServiceGW recordingServiceGW) {
    this.recordingServiceGW = recordingServiceGW;
  }
}

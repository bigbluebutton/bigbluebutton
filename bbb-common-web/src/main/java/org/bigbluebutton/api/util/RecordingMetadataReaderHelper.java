package org.bigbluebutton.api.util;


import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.bigbluebutton.api.domain.RecordingMetadata;
import com.fasterxml.jackson.databind.SerializationFeature;

import javax.xml.stream.*;
import java.io.*;

public class RecordingMetadataReaderHelper {

  public static String inputStreamToString(InputStream is) throws IOException {
    StringBuilder sb = new StringBuilder();
    String line;
    BufferedReader br = new BufferedReader(new InputStreamReader(is));
    while ((line = br.readLine()) != null) {
      sb.append(line);
    }
    br.close();
    return sb.toString();
  }

  public static RecordingMetadata getRecordingMetadata(File metadataXml) {
    XMLInputFactory factory  = XMLInputFactory.newInstance();

    JacksonXmlModule module   = new JacksonXmlModule();
    // and then configure, for example:
    module.setDefaultUseWrapper(false);

    XmlMapper mapper  = new XmlMapper(module);

    //Reading from xml file and creating XMLStreamReader
    XMLStreamReader reader   = null;
    RecordingMetadata recMeta = null;
    try {
      reader = factory.createXMLStreamReader(new FileInputStream(metadataXml));
      recMeta  = mapper.readValue(reader, RecordingMetadata.class);
    } catch (XMLStreamException e) {
      e.printStackTrace();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return recMeta;
  }

  public static File getMetadataXmlLocation(String destDir) {
    return new File(destDir + File.separatorChar + "metadata.xml");
  }

  public static void saveRecordingMetadata(File metadataXml, RecordingMetadata recordingMetadata) {

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
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}

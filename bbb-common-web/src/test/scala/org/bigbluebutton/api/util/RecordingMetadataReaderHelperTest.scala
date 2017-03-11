package org.bigbluebutton.api.util

import java.io.{File, FileInputStream}
import javax.xml.stream.{XMLInputFactory, XMLStreamReader}

import com.fasterxml.jackson.dataformat.xml.{JacksonXmlModule, XmlMapper}
import org.bigbluebutton.api.domain.RecordingMetadataPlayback

/**
  * Created by ralam on 3/10/2017.
  */
class RecordingMetadataReaderHelperTest extends UnitSpec {

  it should "find template" in {
    val factory: XMLInputFactory  = XMLInputFactory.newInstance();

    val templateLoc = new File("src/test/resources/playback-metadata.xml")
    val module: JacksonXmlModule  = new JacksonXmlModule();
    // and then configure, for example:
    module.setDefaultUseWrapper(false);

    val mapper: XmlMapper = new XmlMapper(module)

    //Reading from xml file and creating XMLStreamReader
    val reader: XMLStreamReader  = factory.createXMLStreamReader(new FileInputStream(templateLoc))

    val openCredentials: RecordingMetadataPlayback = mapper.readValue(reader, classOf[RecordingMetadataPlayback])

    println(openCredentials)

    assert(openCredentials.getDuration == 545949)
  }

}

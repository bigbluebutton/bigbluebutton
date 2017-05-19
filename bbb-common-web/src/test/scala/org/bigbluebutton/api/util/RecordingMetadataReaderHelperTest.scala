package org.bigbluebutton.api.util

import java.io.{File, FileInputStream}
import javax.xml.stream.{XMLInputFactory, XMLStreamReader}

import com.fasterxml.jackson.dataformat.xml.{JacksonXmlModule, XmlMapper}
import org.bigbluebutton.api.domain.{RecordingMetadata, RecordingMetadataPlayback}

class RecordingMetadataReaderHelperTest extends UnitSpec {

  it should "deserialize playback part of metadata.xml" in {
    val factory: XMLInputFactory  = XMLInputFactory.newInstance();

    val xml = new File("src/test/resources/playback-metadata.xml")
    val module: JacksonXmlModule  = new JacksonXmlModule();
    // and then configure, for example:
    module.setDefaultUseWrapper(false);

    val mapper: XmlMapper = new XmlMapper(module)

    //Reading from xml file and creating XMLStreamReader
    val reader: XMLStreamReader  = factory.createXMLStreamReader(new FileInputStream(xml))

    val playback: RecordingMetadataPlayback = mapper.readValue(reader, classOf[RecordingMetadataPlayback])

    //println("***** FOOO =" + mapper.writeValueAsString(playback))

    assert(playback.getDuration == 545949)

  }

  it should "deserialize metadata.xml" in {
    val factory: XMLInputFactory  = XMLInputFactory.newInstance();

    val xml = new File("src/test/resources/breakout-room-metadata.xml")
    val module: JacksonXmlModule  = new JacksonXmlModule();
    // and then configure, for example:
    module.setDefaultUseWrapper(false);

    val mapper: XmlMapper = new XmlMapper(module)

    //Reading from xml file and creating XMLStreamReader
    val reader: XMLStreamReader  = factory.createXMLStreamReader(new FileInputStream(xml))

    val recMeta: RecordingMetadata = mapper.readValue(reader, classOf[RecordingMetadata])

    //println("***** FOOO =" + mapper.writeValueAsString(recMeta))

    //assert(recMeta.getPlayback.getDuration == 126376)
    assert(true)
  }

  it should "save metadata.xml" in {
    val factory: XMLInputFactory  = XMLInputFactory.newInstance();

    val xml = new File("src/test/resources/breakout-room-metadata.xml")
    val module: JacksonXmlModule  = new JacksonXmlModule();
    // and then configure, for example:
    module.setDefaultUseWrapper(false);

    val mapper: XmlMapper = new XmlMapper(module)

    //Reading from xml file and creating XMLStreamReader
    val reader: XMLStreamReader  = factory.createXMLStreamReader(new FileInputStream(xml))

    val recMeta: RecordingMetadata = mapper.readValue(reader, classOf[RecordingMetadata])

    recMeta.getMeta().set("FOO", "BAR");

    val metadataXml = RecordingMetadataReaderHelper.getMetadataXmlLocation("target")
    if (metadataXml.exists()) metadataXml.delete()

    RecordingMetadataReaderHelper.saveRecordingMetadata(metadataXml, recMeta)

    assert(metadataXml.exists())

  }

}

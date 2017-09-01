package org.bigbluebutton.api2.util

import org.bigbluebutton.api.util.UnitSpec

class RecMetaXmlHelperTests extends UnitSpec {

  val metaFile = "src/test/resources/sample-metadata.xml"

  it should "load metadata xml" in {
   val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    println("METADATAXML = \n" + xml)
  }

  it should "get meta elements" in {
    val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMetaXmlHelper.getMeta(metaXml) match {
          case Some(meta) =>
            assert(meta.size == 8)
          case None => fail("Failed to get meta element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get meeting element" in {
    val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMetaXmlHelper.getMeeting(metaXml) match {
          case Some(meeting) =>
            assert(meeting.id == "b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984")
            assert(meeting.breakout == false)
          case None => fail("Failed to get meeting element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get playback element" in {
    val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMetaXmlHelper.getPlayback(metaXml) match {
          case Some(playback) =>
            assert(playback.size == 531235)
            assert(playback.extensions.isDefined)
          case None => fail("Failed to get playback element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get extensions" in {
    val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMetaXmlHelper.getMeta(metaXml) match {
          case Some(meta) =>
            assert(meta.size == 8)
          case None => fail("Failed to get extensions element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }
}

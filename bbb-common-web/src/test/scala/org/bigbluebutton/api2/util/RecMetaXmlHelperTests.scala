package org.bigbluebutton.api2.util

import org.bigbluebutton.api.util.UnitSpec
import org.bigbluebutton.api2.domain.RecMeta

class RecMetaXmlHelperTests extends UnitSpec {

  val metaFile = "src/test/resources/sample-metadata.xml"

  it should "load metadata xml" in {
    val helper = new RecMetaXmlHelper

    val xml = helper.loadMetadataXml(metaFile)
   // println("METADATAXML = \n" + xml)
  }

  it should "get meta elements" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getMeta(metaXml) match {
          case Some(meta) =>
            assert(meta.size == 8)
          case None => fail("Failed to get meta element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get meeting element" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getMeeting(metaXml) match {
          case Some(meeting) =>
            assert(meeting.id == "b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984")
            assert(meeting.breakout == false)
          case None => fail("Failed to get meeting element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get playback element" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getPlayback(metaXml) match {
          case Some(playback) =>
            assert(playback.size == 531235)
            assert(playback.extensions.isDefined)
          case None => fail("Failed to get playback element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get extensions" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getMeta(metaXml) match {
          case Some(meta) =>
            assert(meta.size == 8)
          case None => fail("Failed to get extensions element.")
        }

      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get breakout rooms" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        val rooms = RecMeta.getBreakoutRooms(metaXml)
        println(rooms)
        assert(rooms.length == 2)


      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get breakout" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getBreakout(metaXml) match {
          case Some(br) => assert(br.sequence == 2)
          case None => fail("Failed to get breakout.")
        }
      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get recording metadata" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getRecMeta(metaXml) match {
          case Some(br) => assert(br.id == "b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984")
            println(br.toXml())
          case None => fail("Failed to get recording metadata.")
        }
      case None => fail("Failed to load metadata.xml")
    }
  }

  it should "get recording metadata and format back to metadata" in {
    val helper = new RecMetaXmlHelper
    val xml = helper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMeta.getRecMeta(metaXml) match {
          case Some(br) => assert(br.id == "b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984")
            println(br.toMetadataXml())
          case None => fail("Failed to get recording metadata.")
        }
      case None => fail("Failed to load metadata.xml")
    }
  }

  /*
  it should "get copy meta" in {
    val xml = RecMetaXmlHelper.loadMetadataXml(metaFile)
    xml match {
      case Some(metaXml) =>
        RecMetaXmlHelper.getMetaCopy(metaXml) match {
          case Some(br) =>
            println(br)
            assert(true)
          case None => fail("Failed to get recording metadata.")
        }
      case None => fail("Failed to load metadata.xml")
    }
  }
  */
}

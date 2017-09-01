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

  it should "get extensions" in {
    val xml =
  }
}

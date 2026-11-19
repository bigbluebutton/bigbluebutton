package org.bigbluebutton.presentation

import java.io.File
import java.util.{ ArrayList, Arrays }

import org.bigbluebutton.presentation.imp.PageArtifacts
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

class PageIdsTest extends AnyFlatSpec with Matchers {

  private def presentation() =
    new UploadedPresentation("pod", "meeting", "pres", "slides.pdf", "", true, "token", false, new ArrayList[String]())

  private val id1 = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
  private val id2 = "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d"

  "UploadedPresentation.mintPageIds" should "mint one distinct, valid page id per page, in order" in {
    val pres = presentation()
    pres.mintPageIds(3)
    val ids = pres.getPageIds.asScala.toList
    ids should have size 3
    ids.distinct should have size 3
    all(ids) should fullyMatch regex PageArtifacts.PAGE_ID.pattern()
    (1 to 3).map(pres.pageId) shouldBe ids
  }

  it should "refuse a second call" in {
    val pres = presentation()
    pres.mintPageIds(2)
    an[IllegalStateException] should be thrownBy pres.mintPageIds(2)
  }

  it should "refuse a call after adoptPageIds" in {
    val pres = presentation()
    pres.adoptPageIds(Arrays.asList(id1, id2))
    an[IllegalStateException] should be thrownBy pres.mintPageIds(2)
  }

  "UploadedPresentation.adoptPageIds" should "register the given ids in order" in {
    val pres = presentation()
    pres.adoptPageIds(Arrays.asList(id1, id2))
    pres.pageId(1) shouldBe id1
    pres.pageId(2) shouldBe id2
  }

  it should "refuse a call after mintPageIds" in {
    val pres = presentation()
    pres.mintPageIds(1)
    an[IllegalStateException] should be thrownBy pres.adoptPageIds(Arrays.asList(id1))
  }

  "UploadedPresentation.pageId" should "throw before any id is registered" in {
    an[IllegalStateException] should be thrownBy presentation().pageId(1)
    presentation().getPageIds shouldBe empty
  }

  it should "throw for a page without an id" in {
    val pres = presentation()
    pres.mintPageIds(2)
    an[IllegalStateException] should be thrownBy pres.pageId(0)
    an[IllegalStateException] should be thrownBy pres.pageId(3)
  }

  "PageArtifacts" should "name every artifact by page id" in {
    val presDir = new File("/pres")
    PageArtifacts.Type.SVG.file(presDir, id1).getPath shouldBe s"/pres/svgs/slide$id1.svg"
    PageArtifacts.Type.PNG.file(presDir, id1).getPath shouldBe s"/pres/pngs/slide-$id1.png"
    PageArtifacts.Type.THUMBNAIL.file(presDir, id1).getPath shouldBe s"/pres/thumbnails/thumb-$id1.png"
    PageArtifacts.Type.TEXT.file(presDir, id1).getPath shouldBe s"/pres/textfiles/slide-$id1.txt"
  }

  it should "refuse an invalid page id" in {
    for (bad <- Seq("1", "pres/1", "../x", id1.toUpperCase, id1 + "x", "3f2b8c1e-5d4a-1f6b-9c7d-0e1a2b3c4d5e", "", null)) {
      PageArtifacts.isValidPageId(bad) shouldBe false
      an[IllegalArgumentException] should be thrownBy PageArtifacts.Type.SVG.fileName(bad)
    }
  }

  it should "read the page id back from a file name" in {
    PageArtifacts.Type.THUMBNAIL.pageIdOf(s"thumb-$id1.png") shouldBe id1
    PageArtifacts.Type.THUMBNAIL.pageIdOf("thumb-1.png") shouldBe null
    PageArtifacts.Type.SVG.pageIdOf(s"slide-$id1.svg") shouldBe null
  }

  it should "mark png as the only optional artifact" in {
    PageArtifacts.Type.values().filterNot(_.required).toList shouldBe List(PageArtifacts.Type.PNG)
  }
}

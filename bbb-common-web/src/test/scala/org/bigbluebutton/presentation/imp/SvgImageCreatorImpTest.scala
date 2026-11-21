package org.bigbluebutton.presentation.imp

import java.io.{ File, IOException }
import java.nio.file.Files

import org.bigbluebutton.api.util.UnitSpec

/**
 * The rasterized slide replaces the vector svg of the same name. A write that
 * fails must leave the vector svg untouched, as it is then the slide served
 * (issue #23953).
 */
class SvgImageCreatorImpTest extends UnitSpec {

  private def withSlide(test: File => Any): Unit = {
    val dir = Files.createTempDirectory("svg-image-creator").toFile
    val slide = new File(dir, "slide1.svg")
    try {
      Files.writeString(slide.toPath, "vector")
      test(slide)
    } finally {
      Option(dir.listFiles).foreach(_.foreach(_.delete()))
      dir.delete()
    }
  }

  it should "replace the file with the new content" in withSlide { slide =>
    SvgImageCreatorImp.replaceFile(slide, "raster")

    assert(Files.readString(slide.toPath) == "raster")
    assert(slide.getParentFile.list.toList == List("slide1.svg"))
  }

  it should "create the file when there is none to replace" in withSlide { slide =>
    slide.delete()

    SvgImageCreatorImp.replaceFile(slide, "raster")

    assert(Files.readString(slide.toPath) == "raster")
  }

  it should "leave the file untouched when the write fails" in withSlide { slide =>
    // A directory in the way of the temporary file makes the write fail
    new File(slide.getAbsolutePath + ".tmp").mkdir()

    assertThrows[IOException] {
      SvgImageCreatorImp.replaceFile(slide, "raster")
    }
    assert(Files.readString(slide.toPath) == "vector")
  }

}

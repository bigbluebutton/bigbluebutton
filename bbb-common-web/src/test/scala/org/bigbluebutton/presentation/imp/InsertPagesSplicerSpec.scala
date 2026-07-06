package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.file.Files

import org.bigbluebutton.api.util.UnitSpec

/**
 * Exercises the pure file-shuffling logic of [[InsertPagesSplicer]]. Each page is represented by a
 * single-line marker file per artifact directory so we can assert both the final page count and
 * that the right page landed in the right slot (order preservation), across every artifact type.
 */
class InsertPagesSplicerSpec extends UnitSpec {

  // svgs use "slideN" (no dash), the rest use a dashed prefix. Mirrors InsertPagesSplicer.ARTIFACTS.
  private val artifacts = Seq(
    ("svgs", "slide", ".svg"),
    ("pngs", "slide-", ".png"),
    ("textfiles", "slide-", ".txt"),
    ("thumbnails", "thumb-", ".png")
  )

  private def newDir(): File = Files.createTempDirectory("insert-pages-spec").toFile

  /** Writes marker files for pages 1..count into dir, each tagged with `label-<page>`. */
  private def seedPages(dir: File, count: Int, label: String): Unit = {
    for ((sub, prefix, ext) <- artifacts) {
      val subDir = new File(dir, sub)
      subDir.mkdirs()
      for (n <- 1 to count) {
        Files.write(new File(subDir, prefix + n + ext).toPath, s"$label-$n".getBytes("UTF-8"))
      }
    }
  }

  /** Reads the marker of the svgs slide at page `n` in dir, or "" if absent. */
  private def svgMarker(dir: File, n: Int): String = {
    val f = new File(new File(dir, "svgs"), "slide" + n + ".svg")
    if (f.exists()) new String(Files.readAllBytes(f.toPath), "UTF-8") else ""
  }

  private def svgPageCount(dir: File): Int = {
    val svgs = new File(dir, "svgs")
    Option(svgs.listFiles()).map(_.count(_.getName.matches("slide\\d+\\.svg"))).getOrElse(0)
  }

  it should "insert pages in range, shifting later pages up while preserving order" in {
    val insertDir = newDir(); seedPages(insertDir, 2, "ins")
    val targetDir = newDir(); seedPages(targetDir, 3, "tgt")

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, 2)

    assert(position == 2)
    assert(total == 5)
    assert(svgPageCount(targetDir) == 5)
    // slide1 untouched; inserted at 2,3; originals 2,3 shifted to 4,5.
    assert(svgMarker(targetDir, 1) == "tgt-1")
    assert(svgMarker(targetDir, 2) == "ins-1")
    assert(svgMarker(targetDir, 3) == "ins-2")
    assert(svgMarker(targetDir, 4) == "tgt-2")
    assert(svgMarker(targetDir, 5) == "tgt-3")
  }

  it should "clamp a position below 1 to a prepend" in {
    val insertDir = newDir(); seedPages(insertDir, 1, "ins")
    val targetDir = newDir(); seedPages(targetDir, 2, "tgt")

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 0, 1)

    assert(position == 1)
    assert(total == 3)
    assert(svgMarker(targetDir, 1) == "ins-1")
    assert(svgMarker(targetDir, 2) == "tgt-1")
    assert(svgMarker(targetDir, 3) == "tgt-2")
  }

  it should "clamp a position past the end to an append" in {
    val insertDir = newDir(); seedPages(insertDir, 1, "ins")
    val targetDir = newDir(); seedPages(targetDir, 2, "tgt")

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 99, 1)

    assert(position == 3) // clamped to targetTotal + 1
    assert(total == 3)
    assert(svgMarker(targetDir, 1) == "tgt-1")
    assert(svgMarker(targetDir, 2) == "tgt-2")
    assert(svgMarker(targetDir, 3) == "ins-1")
  }

  it should "handle an insert count greater than one" in {
    val insertDir = newDir(); seedPages(insertDir, 3, "ins")
    val targetDir = newDir(); seedPages(targetDir, 2, "tgt")

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, 3)

    assert(position == 2)
    assert(total == 5)
    assert(svgMarker(targetDir, 1) == "tgt-1")
    assert(svgMarker(targetDir, 2) == "ins-1")
    assert(svgMarker(targetDir, 3) == "ins-2")
    assert(svgMarker(targetDir, 4) == "ins-3")
    assert(svgMarker(targetDir, 5) == "tgt-2")
  }

  it should "insert into an empty target presentation" in {
    val insertDir = newDir(); seedPages(insertDir, 2, "ins")
    val targetDir = newDir(); new File(targetDir, "svgs").mkdirs() // 0 pages

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 5, 2)

    assert(position == 1) // clamped: targetTotal(0) + 1
    assert(total == 2)
    assert(svgMarker(targetDir, 1) == "ins-1")
    assert(svgMarker(targetDir, 2) == "ins-2")
  }

  it should "insert a single (blank) page" in {
    val insertDir = newDir(); seedPages(insertDir, 1, "ins")
    val targetDir = newDir(); seedPages(targetDir, 3, "tgt")

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, 1)

    assert(position == 2)
    assert(total == 4)
    assert(svgMarker(targetDir, 1) == "tgt-1")
    assert(svgMarker(targetDir, 2) == "ins-1")
    assert(svgMarker(targetDir, 3) == "tgt-2")
    assert(svgMarker(targetDir, 4) == "tgt-3")
  }

  it should "move every artifact type, not just svgs" in {
    val insertDir = newDir(); seedPages(insertDir, 1, "ins")
    val targetDir = newDir(); seedPages(targetDir, 2, "tgt")

    InsertPagesSplicer.splice(insertDir, targetDir, 1, 1)

    // Inserted page now at slot 1 across all artifact dirs; original page 1 shifted to slot 2.
    def read(sub: String, prefix: String, ext: String, n: Int): String =
      new String(Files.readAllBytes(new File(new File(targetDir, sub), prefix + n + ext).toPath), "UTF-8")

    assert(read("pngs", "slide-", ".png", 1) == "ins-1")
    assert(read("pngs", "slide-", ".png", 2) == "tgt-1")
    assert(read("textfiles", "slide-", ".txt", 1) == "ins-1")
    assert(read("thumbnails", "thumb-", ".png", 3) == "tgt-2")
  }

  it should "raise when the target directory does not exist" in {
    val insertDir = newDir(); seedPages(insertDir, 1, "ins")
    val missing = new File(newDir(), "does-not-exist")

    assertThrows[java.io.IOException] {
      InsertPagesSplicer.splice(insertDir, missing, 1, 1)
    }
  }
}

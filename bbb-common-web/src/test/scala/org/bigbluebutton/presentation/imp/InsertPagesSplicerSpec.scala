package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.file.Files
import java.util.{ LinkedHashMap => JLinkedHashMap, Map => JMap }

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.bigbluebutton.api.util.UnitSpec

import scala.jdk.CollectionConverters._

/**
 * Exercises the manifest-driven splicing logic of [[InsertPagesSplicer]]. Page files are named by
 * opaque page id, so splicing never renames existing target files: it moves the inserted pages'
 * artifacts into the target directory and re-keys the target's pages.json manifest. Each page is
 * represented by a single-line marker file per artifact directory so we can assert that files
 * moved (or stayed) with their content intact.
 */
class InsertPagesSplicerSpec extends UnitSpec {

  // svgs use "slide<id>" (no dash), the rest use a dashed prefix. Mirrors InsertPagesSplicer.ARTIFACTS.
  private val artifacts = Seq(
    ("svgs", "slide", ".svg"),
    ("pngs", "slide-", ".png"),
    ("textfiles", "slide-", ".txt"),
    ("thumbnails", "thumb-", ".png")
  )

  private def newDir(): File = Files.createTempDirectory("insert-pages-spec").toFile

  /** Writes marker files for every page id into dir, each tagged with `label-<id>`. */
  private def seedPages(dir: File, ids: Seq[String], label: String): Unit = {
    for ((sub, prefix, ext) <- artifacts) {
      val subDir = new File(dir, sub)
      subDir.mkdirs()
      for (id <- ids) {
        Files.write(new File(subDir, prefix + id + ext).toPath, s"$label-$id".getBytes("UTF-8"))
      }
    }
  }

  /** Writes the num -> pageId manifest (pages.json) for ids at positions 1..ids.size. */
  private def writeManifest(dir: File, ids: Seq[String]): Unit = {
    val byNum = new JLinkedHashMap[String, String]()
    ids.zipWithIndex.foreach { case (id, i) => byNum.put((i + 1).toString, id) }
    Files.write(new File(dir, PageIdManifest.FILENAME).toPath, new Gson().toJson(byNum).getBytes("UTF-8"))
  }

  /** Reads the manifest back as a plain num -> pageId map. */
  private def readManifest(dir: File): Map[String, String] = {
    val json = new String(Files.readAllBytes(new File(dir, PageIdManifest.FILENAME).toPath), "UTF-8")
    val mapType = new TypeToken[JMap[String, String]]() {}.getType
    new Gson().fromJson[JMap[String, String]](json, mapType).asScala.toMap
  }

  private def insertIds(ids: String*): JMap[Integer, String] = {
    val m = new JLinkedHashMap[Integer, String]()
    ids.zipWithIndex.foreach { case (id, i) => m.put(Integer.valueOf(i + 1), id) }
    m
  }

  /** Reads the marker of the svgs artifact of page `id` in dir, or "" if absent. */
  private def svgMarker(dir: File, id: String): String = {
    val f = new File(new File(dir, "svgs"), "slide" + id + ".svg")
    if (f.exists()) new String(Files.readAllBytes(f.toPath), "UTF-8") else ""
  }

  it should "insert pages in range, re-keying the manifest while leaving existing files untouched" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1", "i2"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1", "t2", "t3"), "tgt"); writeManifest(targetDir, Seq("t1", "t2", "t3"))

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, insertIds("i1", "i2"))

    assert(position == 2)
    assert(total == 5)
    // Manifest: page 1 keeps its id, inserted ids land at 2..3, original 2..3 shift to 4..5.
    assert(readManifest(targetDir) == Map("1" -> "t1", "2" -> "i1", "3" -> "i2", "4" -> "t2", "5" -> "t3"))
    // Existing target files are never renamed and keep their content.
    assert(svgMarker(targetDir, "t1") == "tgt-t1")
    assert(svgMarker(targetDir, "t2") == "tgt-t2")
    assert(svgMarker(targetDir, "t3") == "tgt-t3")
    // Inserted files moved into the target dir under their unchanged pageId names.
    assert(svgMarker(targetDir, "i1") == "ins-i1")
    assert(svgMarker(targetDir, "i2") == "ins-i2")
    assert(svgMarker(insertDir, "i1") == "")
  }

  it should "shift double-digit manifest positions numerically, not lexicographically" in {
    val targetIds = (1 to 10).map(n => s"t$n")
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, targetIds, "tgt"); writeManifest(targetDir, targetIds)

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, insertIds("i1"))

    assert(position == 2)
    assert(total == 11)
    val manifest = readManifest(targetDir)
    assert(manifest("2") == "i1")
    assert(manifest("3") == "t2")
    assert(manifest("11") == "t10") // "10" must shift to 11 (numeric), not stay behind "2" (lexicographic)
  }

  it should "clamp a position below 1 to a prepend" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1", "t2"), "tgt"); writeManifest(targetDir, Seq("t1", "t2"))

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 0, insertIds("i1"))

    assert(position == 1)
    assert(total == 3)
    assert(readManifest(targetDir) == Map("1" -> "i1", "2" -> "t1", "3" -> "t2"))
  }

  it should "clamp a position past the end to an append" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1", "t2"), "tgt"); writeManifest(targetDir, Seq("t1", "t2"))

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 99, insertIds("i1"))

    assert(position == 3) // clamped to targetTotal + 1
    assert(total == 3)
    assert(readManifest(targetDir) == Map("1" -> "t1", "2" -> "t2", "3" -> "i1"))
  }

  it should "insert a single (blank) page" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1", "t2", "t3"), "tgt"); writeManifest(targetDir, Seq("t1", "t2", "t3"))

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, insertIds("i1"))

    assert(position == 2)
    assert(total == 4)
    assert(readManifest(targetDir) == Map("1" -> "t1", "2" -> "i1", "3" -> "t2", "4" -> "t3"))
    assert(svgMarker(targetDir, "i1") == "ins-i1")
  }

  it should "move every artifact type, not just svgs" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1"), "tgt"); writeManifest(targetDir, Seq("t1"))

    InsertPagesSplicer.splice(insertDir, targetDir, 1, insertIds("i1"))

    def read(sub: String, prefix: String, ext: String, id: String): String =
      new String(Files.readAllBytes(new File(new File(targetDir, sub), prefix + id + ext).toPath), "UTF-8")

    assert(read("pngs", "slide-", ".png", "i1") == "ins-i1")
    assert(read("textfiles", "slide-", ".txt", "i1") == "ins-i1")
    assert(read("thumbnails", "thumb-", ".png", "i1") == "ins-i1")
    assert(read("thumbnails", "thumb-", ".png", "t1") == "tgt-t1")
  }

  it should "tolerate a missing artifact type on the inserted pages" in {
    val insertDir = newDir()
    // svg-only insert flow: no pngs/textfiles/thumbnails directories at all.
    val svgs = new File(insertDir, "svgs"); svgs.mkdirs()
    Files.write(new File(svgs, "slidei1.svg").toPath, "ins-i1".getBytes("UTF-8"))
    val targetDir = newDir(); seedPages(targetDir, Seq("t1"), "tgt"); writeManifest(targetDir, Seq("t1"))

    val Array(position, total) = InsertPagesSplicer.splice(insertDir, targetDir, 2, insertIds("i1"))

    assert(position == 2)
    assert(total == 2)
    assert(readManifest(targetDir) == Map("1" -> "t1", "2" -> "i1"))
    assert(svgMarker(targetDir, "i1") == "ins-i1")
  }

  it should "raise when the target manifest is missing" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1"), "tgt") // no pages.json

    assertThrows[java.io.IOException] {
      InsertPagesSplicer.splice(insertDir, targetDir, 1, insertIds("i1"))
    }
  }

  it should "raise IOException when the target manifest contains malformed JSON" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("t1"), "tgt")
    Files.write(new File(targetDir, PageIdManifest.FILENAME).toPath, "{broken".getBytes("UTF-8"))

    assertThrows[java.io.IOException] {
      InsertPagesSplicer.splice(insertDir, targetDir, 1, insertIds("i1"))
    }
  }

  it should "raise when an inserted artifact would overwrite an existing file" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("same"), "ins")
    val targetDir = newDir(); seedPages(targetDir, Seq("same"), "tgt"); writeManifest(targetDir, Seq("same"))

    assertThrows[java.io.IOException] {
      InsertPagesSplicer.splice(insertDir, targetDir, 1, insertIds("same"))
    }
    assert(svgMarker(targetDir, "same") == "tgt-same")
  }

  it should "raise when the target directory does not exist" in {
    val insertDir = newDir(); seedPages(insertDir, Seq("i1"), "ins")
    val missing = new File(newDir(), "does-not-exist")

    assertThrows[java.io.IOException] {
      InsertPagesSplicer.splice(insertDir, missing, 1, insertIds("i1"))
    }
  }
}

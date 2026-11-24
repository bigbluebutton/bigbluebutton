package org.bigbluebutton.presentation.imp

import java.io.{ ByteArrayInputStream, ByteArrayOutputStream, FileInputStream }
import java.nio.file.{ Files, Path }
import java.util.zip.GZIPInputStream

import com.amazonaws.services.s3.model.S3Object
import org.apache.commons.compress.archivers.tar.{ TarArchiveEntry, TarArchiveInputStream, TarArchiveOutputStream }
import org.apache.commons.compress.compressors.gzip.GzipCompressorOutputStream
import org.scalatest.flatspec.AnyFlatSpec

// The office conversion saves the speaker notes before the cache is checked, so the cache must never carry them
class TarGzManagerTest extends AnyFlatSpec {
  private def entryNames(archive: java.io.File): List[String] = {
    val tar = new TarArchiveInputStream(new GZIPInputStream(new FileInputStream(archive)))
    try Iterator.continually(tar.getNextTarEntry).takeWhile(_ != null).map(_.getName).toList finally tar.close()
  }

  private def archiveOf(files: (String, String)*): S3Object = {
    val bytes = new ByteArrayOutputStream()
    val tar = new TarArchiveOutputStream(new GzipCompressorOutputStream(bytes))
    for ((name, content) <- files) {
      val data = content.getBytes("UTF-8")
      val entry = new TarArchiveEntry(name)
      entry.setSize(data.length)
      tar.putArchiveEntry(entry)
      tar.write(data)
      tar.closeArchiveEntry()
    }
    tar.close()
    val s3Object = new S3Object()
    s3Object.setObjectContent(new ByteArrayInputStream(bytes.toByteArray))
    s3Object
  }

  it should "leave the speaker notes out of the cached outputs" in {
    val dir: Path = Files.createTempDirectory("cache-compress")
    Files.writeString(Files.createDirectories(dir.resolve("textfiles")).resolve("slide-1.txt"), "text")
    Files.writeString(Files.createDirectories(dir.resolve("speakernotes")).resolve("slide-1.txt"), "notes")
    Files.writeString(dir.resolve("page-1.pdf"), "pdf")

    val names = entryNames(TarGzManager.compress(dir.toString, "cache-test", 1))
    assert(names.exists(_.startsWith("textfiles")))
    assert(!names.exists(_.startsWith("speakernotes")))
  }

  it should "not restore speaker notes from an entry cached with them" in {
    val dir: Path = Files.createTempDirectory("cache-decompress")
    TarGzManager.decompress(archiveOf("textfiles/slide-1.txt" -> "text", "speakernotes/slide-1.txt" -> "cached notes"), dir.toString)

    assert(Files.readString(dir.resolve("textfiles/slide-1.txt")) == "text")
    assert(!Files.exists(dir.resolve("speakernotes")))
  }

  it should "keep the notes the conversion just saved when the cache is restored" in {
    val dir: Path = Files.createTempDirectory("cache-keep")
    Files.writeString(Files.createDirectories(dir.resolve("speakernotes")).resolve("slide-1.txt"), "fresh notes")
    TarGzManager.decompress(archiveOf("speakernotes/slide-1.txt" -> "cached notes"), dir.toString)

    assert(Files.readString(dir.resolve("speakernotes/slide-1.txt")) == "fresh notes")
  }
}

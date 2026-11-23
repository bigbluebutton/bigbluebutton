package org.bigbluebutton.api2.util

import com.fasterxml.jackson.databind.ObjectMapper
import java.io.{ InputStreamReader, Reader }
import java.nio.charset.{ CodingErrorAction, StandardCharsets }
import java.nio.file.{ Files, Path }
import scala.util.{ Try, Using }

object SpeakerNotesJsonReader {
  val DefaultCap: Int = 1024 * 1024
  private val mapper = new ObjectMapper()

  def readUtf8Capped(path: Path, cap: Int = DefaultCap): Option[String] = Try {
    val decoder = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT)
    Using.resource[Reader, String](new InputStreamReader(Files.newInputStream(path), decoder)) { reader =>
      val result = new StringBuilder
      val buffer = new Array[Char](8192)
      var remaining = cap + 1
      var read = 0
      while (remaining > 0 && { read = reader.read(buffer, 0, Math.min(buffer.length, remaining)); read != -1 }) {
        result.appendAll(buffer, 0, read); remaining -= read
      }
      if (result.length > cap) throw new IllegalArgumentException("speaker notes JSON exceeds cap")
      result.toString
    }
  }.toOption

  def readValidJson(path: Path, cap: Int = DefaultCap): Option[String] =
    readUtf8Capped(path, cap).filter(value => Try(mapper.readTree(value)).isSuccess)
}

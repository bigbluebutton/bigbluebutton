package org.bigbluebutton.api2.util

import com.fasterxml.jackson.databind.ObjectMapper
import java.io.InputStream
import java.nio.ByteBuffer
import java.nio.charset.{ CodingErrorAction, StandardCharsets }
import java.nio.file.{ Files, Path }
import scala.util.{ Try, Using }

object SpeakerNotesJsonReader {
  // In UTF-8 bytes, the same limit the conversion applies when it writes the file
  val DefaultCap: Int = 1024 * 1024
  private val mapper = new ObjectMapper()

  def readUtf8Capped(path: Path, cap: Int = DefaultCap): Option[String] = Try {
    val bytes = Using.resource[InputStream, Array[Byte]](Files.newInputStream(path))(_.readNBytes(cap + 1))
    if (bytes.length > cap) throw new IllegalArgumentException("speaker notes JSON exceeds cap")
    val decoder = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT)
    decoder.decode(ByteBuffer.wrap(bytes)).toString
  }.toOption

  def readValidJson(path: Path, cap: Int = DefaultCap): Option[String] =
    readUtf8Capped(path, cap).filter(value => Try(mapper.readTree(value)).isSuccess)
}

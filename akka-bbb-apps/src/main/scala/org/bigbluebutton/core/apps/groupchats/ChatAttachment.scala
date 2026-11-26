package org.bigbluebutton.core.apps.groupchats

import java.util.Locale
import java.util.regex.Pattern

import scala.jdk.CollectionConverters._

/**
 * The file attached to a chat message, as the client sends it in `metadata.attachment`:
 * `{url, name, size, mime}`, the response of the bbb-file-upload service.
 *
 * Metadata comes from the client, so the attachment is only kept when it describes an
 * upload that could exist: a file served by bbb-file-upload for this very meeting, of a
 * type both the meeting allows and the service verifies, within the size limit, with a
 * name of that type. Anything else is removed from the message - the message itself
 * still goes through, it just carries no attachment.
 */
object ChatAttachment {

  val MetadataKey = "attachment"

  /** The types bbb-file-upload verifies by magic bytes, with the extensions each may use. */
  val SupportedTypes: Map[String, List[String]] = Map(
    "image/png" -> List("png"),
    "image/jpeg" -> List("jpg", "jpeg"),
    "image/gif" -> List("gif"),
    "image/webp" -> List("webp"),
    "application/pdf" -> List("pdf"),
    "video/mp4" -> List("mp4"),
    "audio/mpeg" -> List("mp3")
  )

  val DefaultAllowedMimeTypes: List[String] = List(
    "image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf", "video/mp4", "audio/mpeg"
  )

  private val MaxNameLength = 255

  private val ControlChars = Pattern.compile("[\\x00-\\x1f\\x7f]")

  /** `metadata` with the attachment either normalized to its four fields or removed. */
  def sanitize(
      metadata:         Map[String, Any],
      meetingId:        String,
      allowedMimeTypes: List[String],
      maxSizeBytes:     Long
  ): Map[String, Any] = {
    val safeMetadata = Option(metadata).getOrElse(Map.empty[String, Any])

    safeMetadata.get(MetadataKey) match {
      case None => safeMetadata
      case Some(raw) =>
        validate(raw, meetingId, allowedMimeTypes, maxSizeBytes) match {
          case Some(attachment) => safeMetadata + (MetadataKey -> attachment)
          case None             => safeMetadata - MetadataKey
        }
    }
  }

  private def validate(
      raw:              Any,
      meetingId:        String,
      allowedMimeTypes: List[String],
      maxSizeBytes:     Long
  ): Option[Map[String, Any]] = {
    val fields = asMap(raw)
    for {
      mime <- fields.get("mime").collect { case s: String => s }
      extensions <- SupportedTypes.get(mime) if allowedMimeTypes.contains(mime)
      url <- fields.get("url").collect { case s: String => s } if isUploadUrl(url, meetingId, extensions)
      name <- fields.get("name").collect { case s: String => s } if isFileName(name, extensions)
      size <- fields.get("size").flatMap(wholeNumber) if size >= 0 && size <= maxSizeBytes
    } yield Map("url" -> url, "name" -> name, "size" -> size, "mime" -> mime)
  }

  // Jackson binds the untyped metadata into Scala or Java collections depending on the
  // payload, so both are accepted (same as GroupChatApp.parseRequestedMentions).
  private def asMap(raw: Any): Map[String, Any] = raw match {
    case m: scala.collection.Map[_, _] => m.asInstanceOf[scala.collection.Map[String, Any]].toMap
    case m: java.util.Map[_, _]        => m.asInstanceOf[java.util.Map[String, Any]].asScala.toMap
    case _                             => Map.empty
  }

  // The exact serving shape, pinned to this meeting: a file uploaded elsewhere is not
  // reachable from here, and a lax prefix check would let `/\evil.com/...` through.
  private def isUploadUrl(url: String, meetingId: String, extensions: List[String]): Boolean = {
    val pattern = s"^/bigbluebutton/fileUpload/${Pattern.quote(meetingId)}/[a-f0-9-]+\\.(${extensions.mkString("|")})$$"
    url.matches(pattern)
  }

  // The name a download is saved as: a bare file name ending in an extension of the type,
  // so a pdf can never be offered as "page.html".
  private def isFileName(name: String, extensions: List[String]): Boolean = {
    val lower = name.toLowerCase(Locale.ROOT)
    name.length <= MaxNameLength &&
      !name.contains('/') && !name.contains('\\') &&
      !ControlChars.matcher(name).find() &&
      extensions.exists(ext => lower.endsWith(s".$ext") && lower.length > ext.length + 1)
  }

  private def wholeNumber(raw: Any): Option[Long] = raw match {
    case n: java.lang.Integer    => Some(n.longValue())
    case n: java.lang.Long       => Some(n.longValue())
    case n: java.lang.Short      => Some(n.longValue())
    case n: java.math.BigInteger => if (n.bitLength() < 64) Some(n.longValue()) else None
    case n: scala.math.BigInt    => if (n.isValidLong) Some(n.toLong) else None
    case n: java.lang.Double =>
      val d = n.doubleValue()
      if (!d.isInfinite && d.isWhole) Some(d.toLong) else None
    case n: java.math.BigDecimal  => scala.util.Try(n.longValueExact()).toOption
    case n: scala.math.BigDecimal => if (n.isWhole && n.isValidLong) Some(n.toLong) else None
    case _                        => None
  }
}

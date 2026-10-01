package org.bigbluebutton.core.util

object LocaleUtil {
  // "caption"."locale" and "caption_locale"."locale" are varchar(15)
  private val MaxLocaleLength = 15
  private val MaxCaptionIdLength = 40

  private val LocalePattern = """[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*""".r
  private val CaptionIdPattern = """[A-Za-z0-9_-]+""".r

  def isValidLocale(locale: String, allowEmpty: Boolean = false): Boolean = locale match {
    case null                            => false
    case ""                              => allowEmpty
    case l if l.length > MaxLocaleLength => false
    case l                               => LocalePattern.pattern.matcher(l).matches()
  }

  def isValidCaptionId(captionId: String): Boolean = captionId match {
    case null                               => false
    case ""                                 => false
    case c if c.length > MaxCaptionIdLength => false
    case c                                  => CaptionIdPattern.pattern.matcher(c).matches()
  }
}

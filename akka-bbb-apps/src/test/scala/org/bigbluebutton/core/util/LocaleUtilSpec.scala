package org.bigbluebutton.core.util

import org.scalatest.flatspec.AnyFlatSpec

// LocaleUtil decides which locales and caption ids akka-apps accepts from
// clients and from bbb-transcription-controller. A locale is stored in
// varchar(15) columns and, for transcripts, names the recording's caption file;
// a caption id is stored as "<userId>-<captionId>" in varchar(100).
class LocaleUtilSpec extends AnyFlatSpec {

  behavior of "LocaleUtil.isValidLocale"

  it should "accept the language tags the client can send" in {
    val valid = Seq(
      "en", "de", "pt", "en-US", "es-ES", "pt-BR", "zh-CN", "es-419", "zh-Hant-TW", "sr-Latn-RS",
      "ca-ES-valencia", // 14 characters, the longest in common use
      "auto"            // Gladia's language detection value
    )
    valid.foreach(locale => assert(LocaleUtil.isValidLocale(locale), s"'$locale' should be a valid locale"))
  }

  it should "reject anything that is not a language tag" in {
    val invalid = Seq(
      "en_US", "pt_BR", "en US", "en.US", "en-", "-en", "en--US", "a", "1-1", "00",
      "../x", "a/b", "<b>x", "<script>", "en;rm", "en\u0000"
    )
    invalid.foreach(locale => assert(!LocaleUtil.isValidLocale(locale), s"'$locale' should be rejected"))
    assert(!LocaleUtil.isValidLocale(null))
  }

  it should "stop at the 15 characters the locale columns hold" in {
    assert(LocaleUtil.isValidLocale("abcdefgh-abcdef"))
    assert(!LocaleUtil.isValidLocale("abcdefgh-abcdefg"))
  }

  it should "take an empty locale only where it means 'disabled'" in {
    assert(!LocaleUtil.isValidLocale(""))
    assert(LocaleUtil.isValidLocale("", allowEmpty = true))
    assert(!LocaleUtil.isValidLocale("en_US", allowEmpty = true))
  }

  behavior of "LocaleUtil.isCanonicalLocale"

  it should "accept a tag only in its canonical BCP 47 form" in {
    assert(LocaleUtil.isCanonicalLocale("en-US"))
    assert(LocaleUtil.isCanonicalLocale("pt-BR"))
    assert(LocaleUtil.isCanonicalLocale("zh-Hant-TW"))
    assert(LocaleUtil.isCanonicalLocale("es-419"))
    // Well formed, but not canonical: two spellings of one locale would be two caption files.
    assert(!LocaleUtil.isCanonicalLocale("EN-us"))
    assert(!LocaleUtil.isCanonicalLocale("en-us"))
    assert(!LocaleUtil.isCanonicalLocale("zh-hant-tw"))
  }

  it should "reject ill-formed tags and null" in {
    assert(!LocaleUtil.isCanonicalLocale("en_US"))
    assert(!LocaleUtil.isCanonicalLocale(""))
    assert(!LocaleUtil.isCanonicalLocale(null))
  }

  behavior of "LocaleUtil.isValidCaptionId"

  it should "accept the ids the clients and the transcription controller generate" in {
    assert(LocaleUtil.isValidCaptionId("1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed")) // uuid v4 (html5, plugins)
    assert(LocaleUtil.isValidCaptionId("w_abcdefghijkl-1762800000000"))        // <userId>-<Date.now()> (older clients)
    assert(LocaleUtil.isValidCaptionId("w_abcdefghijkl-en-US-1762800000"))     // bbb-transcription-controller
    assert(LocaleUtil.isValidCaptionId("w_abcdefghijkl-ca-ES-valencia-1762800000")) // 40 characters
  }

  it should "reject empty, null, overlong and non-alphanumeric ids" in {
    assert(!LocaleUtil.isValidCaptionId(""))
    assert(!LocaleUtil.isValidCaptionId(null))
    assert(LocaleUtil.isValidCaptionId("x" * 40))
    assert(!LocaleUtil.isValidCaptionId("x" * 41))
    Seq("../x", "a b", "a/b", "<b>", "id;drop", "a.b", "a\u0000").foreach { id =>
      assert(!LocaleUtil.isValidCaptionId(id), s"'$id' should be rejected")
    }
  }
}

package org.bigbluebutton.api.util

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ParamsUtilTest extends AnyFlatSpec with Matchers {

  it should "strip out control chars from text" in {
    val text = "a\u0000b\u0007c\u008fd"
    val cleaned = ParamsUtil.stripControlChars(text)
    assert("abcd" == cleaned)
  }

  it should "complain about invalid chars in meetingId" in {
    val meetingId = "Demo , Meeting"
    assert(ParamsUtil.isValidMeetingId(meetingId) == false)
  }

  it should "accept valid chars in meetingId" in {
    val meetingId = "Demo Meeting - 123"
    assert(ParamsUtil.isValidMeetingId(meetingId) == true)
  }

  "getSessionToken" should "return null when there is no URL" in {
    ParamsUtil.getSessionToken(null) shouldBe null
  }

  it should "return null for an empty URL" in {
    ParamsUtil.getSessionToken("") shouldBe null
  }

  it should "return undefined for a URL without a query string" in {
    ParamsUtil.getSessionToken("/bbb-webrtc-sfu") shouldBe "undefined"
  }

  it should "return undefined for an empty sessionToken parameter" in {
    ParamsUtil.getSessionToken("/html5client/join?sessionToken=") shouldBe "undefined"
  }

  it should "return undefined for a malformed percent escape" in {
    ParamsUtil.getSessionToken("/bbb-webrtc-sfu?sessionToken=%") shouldBe "undefined"
  }

  it should "return the sessionToken parameter" in {
    ParamsUtil.getSessionToken("/bbb-webrtc-sfu?sessionToken=abcdefghijklmnop") shouldBe "abcdefghijklmnop"
  }

  it should "find the sessionToken among other parameters" in {
    ParamsUtil.getSessionToken("/bbb-webrtc-sfu?meetingId=m1&sessionToken=abcdefghijklmnop&x=y") shouldBe "abcdefghijklmnop"
  }

}

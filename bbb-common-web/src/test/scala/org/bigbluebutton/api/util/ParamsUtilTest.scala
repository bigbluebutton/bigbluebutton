package org.bigbluebutton.api.util

class ParamsUtilTest extends UnitSpec {

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

}

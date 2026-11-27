package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

// AudioCaptions turns each caption submission into the edit the recording keeps
// (EditCaptionHistoryEvent: start, end, text) against one running transcript per
// locale. The offsets a client sends are relative to the transcript it last
// submitted under its own transcriptId; the model shifts them by the text already
// committed in that locale. These tests pin what a submission may and may not
// touch: only the current transcript of the user who opened it, and only inside it.
class AudioCaptionsSpec extends AnyFlatSpec {

  private val alice = "w_alice0000001"
  private val bob = "w_bob000000001"
  private val en = "en-US"

  private def submit(
      captions:     AudioCaptions,
      userId:       String,
      transcriptId: String,
      start:        Int,
      end:          Int,
      text:         String,
      transcript:   String,
      locale:       String = en
  ): Option[(Int, Int, String)] =
    AudioCaptions.editTranscript(captions, userId, transcriptId, start, end, text, transcript, locale)

  behavior of "AudioCaptions.editTranscript"

  it should "open the first transcript of a locale at offset 0" in {
    val captions = new AudioCaptions
    assert(submit(captions, alice, "t1", 0, 0, "hello", "hello") === Some((0, 0, "hello")))
    assert(captions.localeCount === 1)
  }

  it should "apply the owner's edit to its own current transcript" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "hello", "hello")
    // The client diffed "hello" -> "hello world": insert " world" at 5.
    assert(submit(captions, alice, "t1", 5, 5, " world", "hello world") === Some((5, 5, " world")))
    // Replace "world" by "there": offsets 6..11 of the current transcript.
    assert(submit(captions, alice, "t1", 6, 11, "there", "hello there") === Some((6, 11, "there")))
  }

  it should "shift the owner's offsets by the text already committed in the locale" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "first sentence", "first sentence")
    // A new transcriptId commits the previous transcript (14 chars) and appends the new one.
    assert(submit(captions, alice, "t2", 0, 0, "second", "second") === Some((14, 14, "second")))
    // An edit of the new transcript lands after the committed text.
    assert(submit(captions, alice, "t2", 6, 6, " one", "second one") === Some((20, 20, " one")))
  }

  it should "clamp offsets outside the current transcript to its bounds" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "hello world", "hello world") // 11 chars

    // Negative start, end far beyond the text: the edit covers the whole current transcript, no more.
    assert(submit(captions, alice, "t1", -4, 50, "x", "x") === Some((0, 11, "x")))
    // Now the current transcript is "x" (1 char): offsets past it collapse to its end.
    assert(submit(captions, alice, "t1", 20, 25, "y", "xy") === Some((1, 1, "y")))
    // start after end: end is pulled up to start, so nothing before start can be deleted.
    assert(submit(captions, alice, "t1", 2, 0, "z", "xyz") === Some((2, 2, "z")))
  }

  it should "never let an edit reach text committed before the current transcript" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "committed", "committed") // 9 chars
    submit(captions, alice, "t2", 0, 0, "current", "current")     // committed length 9

    val edit = submit(captions, alice, "t2", -9, 7, "", "")
    assert(edit.isDefined)
    val (start, end, _) = edit.get
    assert(start === 9, "an edit must not start inside the committed text")
    assert(end === 16)
  }

  it should "give a submission that carries another user's transcriptId its own segment" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "alice said this", "alice said this") // 15 chars

    // Bob replays Alice's transcriptId with offsets that would delete her text.
    val bobsEdit = submit(captions, bob, "t1", 0, 15, "", "")
    // His submission is appended after her text instead; nothing of hers is addressed.
    assert(bobsEdit === Some((15, 15, "")))

    val bobsText = submit(captions, bob, "t1", 0, 0, "bob", "bob")
    assert(bobsText.exists { case (start, _, _) => start >= 15 }, "Bob's edits must stay after Alice's text")
  }

  it should "let the owner keep editing after a foreign submission with the same transcriptId" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "hello", "hello")
    submit(captions, bob, "t1", 0, 5, "", "")

    // Alice's next cumulative update is appended whole after everything committed so far,
    // as any transcript change of hands is; it is never applied inside Bob's segment.
    val edit = submit(captions, alice, "t1", 5, 5, " world", "hello world")
    assert(edit.isDefined)
    val (start, end, text) = edit.get
    assert(start === end)
    assert(start >= 5)
    assert(text === "hello world")
  }

  it should "keep transcripts of different locales independent" in {
    val captions = new AudioCaptions
    submit(captions, alice, "t1", 0, 0, "hello", "hello", "en-US")
    assert(submit(captions, alice, "t2", 0, 0, "hola", "hola", "es-ES") === Some((0, 0, "hola")))
    assert(submit(captions, alice, "t1", 5, 5, "!", "hello!", "en-US") === Some((5, 5, "!")))
    assert(captions.localeCount === 2)
  }

  it should "refuse a new locale once MaxLocalesPerMeeting are open, but keep updating the open ones" in {
    val captions = new AudioCaptions
    val locales = (1 to AudioCaptions.MaxLocalesPerMeeting).map(i => f"aa-L$i%02d")
    locales.foreach(locale => assert(submit(captions, alice, s"t-$locale", 0, 0, "x", "x", locale).isDefined))
    assert(captions.localeCount === AudioCaptions.MaxLocalesPerMeeting)

    assert(submit(captions, alice, "t-new", 0, 0, "x", "x", "zz-ZZ").isEmpty, "the next locale must be refused")
    assert(captions.localeCount === AudioCaptions.MaxLocalesPerMeeting)

    val first = locales.head
    assert(submit(captions, alice, s"t-$first", 1, 1, "y", "xy", first) === Some((1, 1, "y")))
  }
}

package org.bigbluebutton.core.util

// The pre-3.1 org.scalatest.{ FlatSpec, Matchers } names are gone from the pinned scalatest,
// so this follows WhiteboardModelSpec/PollHdlrHelpersSpec and takes them from their packages.
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MarkdownUtilMentionTests extends AnyFlatSpec with Matchers {

  // Keys are the escaped, lowercased names, as GroupChatApp builds them from the user list.
  private val namesakes = Map("joão" -> List("w_one", "w_two"))
  private val unique = Map("joão" -> List("w_one"), "joão antônio" -> List("w_three"))

  "processMentions" should "resolve a name that belongs to a single participant" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>hi @João</p>", unique)

    html shouldBe """<p>hi <span class="chat-mention" data-userid="w_one">@João</span></p>"""
    ids shouldBe List("w_one")
  }

  it should "leave namesakes alone when nobody was picked from the list" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>hi @João</p>", namesakes)

    html shouldBe "<p>hi @João</p>"
    ids shouldBe empty
  }

  it should "mention only the participant that was picked from the list" in {
    val (html, ids) = MarkdownUtil.processMentions(
      "<p>hi @João</p>",
      namesakes,
      Map("joão" -> List("w_two"))
    )

    html shouldBe """<p>hi <span class="chat-mention" data-userid="w_two">@João</span></p>"""
    ids shouldBe List("w_two")
  }

  it should "hand each namesake its own id, in message order" in {
    val (html, ids) = MarkdownUtil.processMentions(
      "<p>@João and @João</p>",
      namesakes,
      Map("joão" -> List("w_two", "w_one"))
    )

    html shouldBe "<p>" +
      """<span class="chat-mention" data-userid="w_two">@João</span>""" +
      " and " +
      """<span class="chat-mention" data-userid="w_one">@João</span>""" +
      "</p>"
    ids shouldBe List("w_two", "w_one")
  }

  it should "fall back to the name once the picked ids run out" in {
    val (html, ids) = MarkdownUtil.processMentions(
      "<p>@João and @João</p>",
      unique,
      Map("joão" -> List("w_one"))
    )

    // Both resolve to the same participant: the name is unambiguous on its own.
    ids shouldBe List("w_one")
    html should include("""data-userid="w_one">@João</span> and """)
  }

  it should "not mention namesakes typed after the picked ones run out" in {
    val (html, ids) = MarkdownUtil.processMentions(
      "<p>@João and @João</p>",
      namesakes,
      Map("joão" -> List("w_two"))
    )

    ids shouldBe List("w_two")
    html shouldBe "<p>" +
      """<span class="chat-mention" data-userid="w_two">@João</span>""" +
      " and @João</p>"
  }

  it should "prefer the longest name so a prefix doesn't win over it" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>@João Antônio</p>", unique)

    html shouldBe """<p><span class="chat-mention" data-userid="w_three">@João Antônio</span></p>"""
    ids shouldBe List("w_three")
  }

  it should "skip mentions inside code, pre and links" in {
    val (html, ids) = MarkdownUtil.processMentions(
      """<p><code>@João</code> <a href="#">@João</a></p>""",
      unique
    )

    html shouldBe """<p><code>@João</code> <a href="#">@João</a></p>"""
    ids shouldBe empty
  }

  it should "not mention on an e-mail-like address" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>contato@João.com</p>", unique)

    html shouldBe "<p>contato@João.com</p>"
    ids shouldBe empty
  }

  it should "ignore a picked id whose name no longer matches the text" in {
    // GroupChatApp drops the mismatch, so processMentions only ever sees confirmed pairs;
    // an id offered for another name must not leak onto this one.
    val (html, ids) = MarkdownUtil.processMentions(
      "<p>hi @João</p>",
      namesakes,
      Map("maria" -> List("w_four"))
    )

    html shouldBe "<p>hi @João</p>"
    ids shouldBe empty
  }

  it should "return the html untouched when there is no mention" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>plain message</p>", unique)

    html shouldBe "<p>plain message</p>"
    ids shouldBe empty
  }

  it should "not mention on a name glued to inline markup on its left" in {
    val (html, ids) = MarkdownUtil.processMentions("<p><strong>bold</strong>@João</p>", unique)

    html shouldBe "<p><strong>bold</strong>@João</p>"
    ids shouldBe empty
  }

  it should "not mention on a name glued to inline markup on its right" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>@João<strong>bold</strong></p>", unique)

    html shouldBe "<p>@João<strong>bold</strong></p>"
    ids shouldBe empty
  }

  it should "not mention on a name glued to a code span" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>check <code>code</code>@João</p>", unique)

    html shouldBe "<p>check <code>code</code>@João</p>"
    ids shouldBe empty
  }

  it should "not mention on a name glued to a link" in {
    val (html, ids) = MarkdownUtil.processMentions("""<p><a href="#">click</a>@João</p>""", unique)

    html shouldBe """<p><a href="#">click</a>@João</p>"""
    ids shouldBe empty
  }

  it should "still mention across inline markup that leaves a space behind" in {
    val (html, ids) = MarkdownUtil.processMentions("<p><strong>hi</strong> @João</p>", unique)

    html shouldBe """<p><strong>hi</strong> <span class="chat-mention" data-userid="w_one">@João</span></p>"""
    ids shouldBe List("w_one")
  }

  it should "mention right after a line break, where the text really does start over" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>hi<br />@João</p>", unique)

    html shouldBe """<p>hi<br /><span class="chat-mention" data-userid="w_one">@João</span></p>"""
    ids shouldBe List("w_one")
  }

  it should "mention at the end of a paragraph" in {
    val (html, ids) = MarkdownUtil.processMentions("<p>hi @João</p><p>bye</p>", unique)

    html shouldBe """<p>hi <span class="chat-mention" data-userid="w_one">@João</span></p><p>bye</p>"""
    ids shouldBe List("w_one")
  }

  "parseRenderedMentions" should "read back the pairs a previous render resolved, in order" in {
    val html = "<p>" +
      """<span class="chat-mention" data-userid="w_two">@João</span>""" +
      " and " +
      """<span class="chat-mention" data-userid="w_one">@João</span>""" +
      "</p>"

    MarkdownUtil.parseRenderedMentions(html) shouldBe List(("w_two", "João"), ("w_one", "João"))
  }

  it should "unescape a name that commonmark escaped on the way in" in {
    val html = """<p><span class="chat-mention" data-userid="w_one">@Ana &amp; Bia</span></p>"""

    MarkdownUtil.parseRenderedMentions(html) shouldBe List(("w_one", "Ana & Bia"))
  }

  it should "find nothing in html that carries no mention" in {
    MarkdownUtil.parseRenderedMentions("<p>hi @João</p>") shouldBe empty
  }
}

package org.bigbluebutton.core.util

import org.scalatest.flatspec.AnyFlatSpec

// Exercises the same-origin image gate that guards markdown-to-HTML rendering for
// chat. When image paste is enabled the renderer keeps `<img>` only for uploads
// served same-origin by the file-upload service and drops everything else, so a
// crafted `![](...)` cannot turn a chat message into a tracking pixel / IP leak.
// The gate is private, so it is exercised end-to-end through the public
// markdownToSafeHtml (which is also how it runs in production).
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec still
// imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). Mirrors
// WhiteboardModelSpec.
class MarkdownUtilSpec extends AnyFlatSpec {

  private val validSrc = "/bigbluebutton/fileUpload/meeting-abc/0a1b2c3d-4e5f.png"

  private def renderWithImages(md: String): String =
    MarkdownUtil.markdownToSafeHtml(md, enableImages = true)

  it should "render an image referencing a same-origin upload when images are enabled" in {
    val html = renderWithImages(s"![alt]($validSrc)")
    assert(html.contains("<img"))
    assert(html.contains(validSrc))
  }

  it should "accept the jpg/jpeg/gif/webp upload extensions" in {
    List("jpg", "jpeg", "gif", "webp").foreach { ext =>
      val src = s"/bigbluebutton/fileUpload/meeting-abc/0a1b2c3d-4e5f.$ext"
      assert(renderWithImages(s"![alt]($src)").contains("<img"), s"expected '.$ext' upload to render")
    }
  }

  it should "drop a backslash-authority bypass the browser would load cross-origin" in {
    // A browser folds the backslash to a slash, so `/\evil.com/pixel.png` loads
    // from https://evil.com/... . The old "starts with / but not //" check let
    // this through; the shape match must not.
    val html = renderWithImages("![x](/\\evil.com/pixel.png)")
    assert(!html.contains("<img"))
    assert(!html.contains("evil.com"))
  }

  it should "drop a source with a control char (tab) in the authority" in {
    // A raw tab is not a valid markdown link destination, so commonmark never
    // creates an Image node here: the input falls through as literal text and
    // is HTML-escaped (which is why the path may still appear as inert text).
    // The property that matters is that no <img> is ever rendered from it.
    val html = renderWithImages("![x](/\thost/pixel.png)")
    assert(!html.contains("<img"))
  }

  it should "drop a protocol-relative authority (//host)" in {
    val html = renderWithImages("![x](//tracker.example/pixel.png)")
    assert(!html.contains("<img"))
    assert(!html.contains("tracker.example"))
  }

  it should "drop an absolute external URL (tracking pixel / IP leak)" in {
    val html = renderWithImages("![x](https://tracker.example/pixel.png)")
    assert(!html.contains("<img"))
    assert(!html.contains("tracker.example"))
  }

  it should "drop a rooted path that is not a file-upload URL" in {
    val html = renderWithImages("![x](/etc/passwd)")
    assert(!html.contains("<img"))
  }

  it should "drop an upload path with a traversal segment (dot outside the extension)" in {
    val html = renderWithImages("![x](/bigbluebutton/fileUpload/meeting-abc/../../secret.png)")
    assert(!html.contains("<img"))
  }

  it should "drop an upload path whose filename is not lowercase hex (serving contract)" in {
    // nginx only serves [a-f0-9-]+ filenames; the renderer mirrors that so it
    // never emits an <img> that could not be served anyway.
    val html = renderWithImages("![x](/bigbluebutton/fileUpload/meeting-abc/DEADBEEF-4e5f.png)")
    assert(!html.contains("<img"))
    val html2 = renderWithImages("![x](/bigbluebutton/fileUpload/meeting-abc/not-a-uuid.png)")
    assert(!html2.contains("<img"))
  }

  it should "never render images when the feature flag is off, even for a valid upload" in {
    val html = MarkdownUtil.markdownToSafeHtml(s"![alt]($validSrc)", enableImages = false)
    assert(!html.contains("<img"))
  }
}

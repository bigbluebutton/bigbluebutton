package org.bigbluebutton.core.util

import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.commonmark.renderer.NodeRenderer
import org.commonmark.renderer.html._
import org.commonmark.node._
import org.commonmark.renderer.html.{ AttributeProvider, AttributeProviderContext }
import java.util.regex.{ Matcher, Pattern }

import java.util
import java.util.Locale

class LinkAttributeProvider extends AttributeProvider {
  override def setAttributes(node: Node, tagName: String, attributes: util.Map[String, String]): Unit = {
    node match {
      case _: Link =>
        attributes.put("target", "_blank") //always open in a different tab
        attributes.put("rel", "noopener") //prevents the new tab from accessing window.opener
      case _ => // ignore others
    }
  }
}

// Custom renderer that *skips images*
class NoImageNodeRenderer extends NodeRenderer {
  override def getNodeTypes: util.Set[Class[_ <: Node]] = {
    val s = new util.HashSet[Class[_ <: Node]]()
    s.add(classOf[Image])
    s
  }

  // Do nothing => image not rendered
  override def render(node: Node): Unit = ()
}

class NoImageNodeRendererFactory extends HtmlNodeRendererFactory {
  override def create(context: HtmlNodeRendererContext): NodeRenderer =
    new NoImageNodeRenderer()
}

object MarkdownUtil {

  val parser = Parser.builder().build()
  val rendererNoImages = HtmlRenderer.builder()
    .escapeHtml(true) // blocks raw HTML
    .sanitizeUrls(true) // blocks javascript: and similar
    .attributeProviderFactory((_: AttributeProviderContext) => new LinkAttributeProvider())
    .nodeRendererFactory(new NoImageNodeRendererFactory)
    .build()

  val rendererWithImages = HtmlRenderer.builder()
    .escapeHtml(true) // blocks raw HTML
    .sanitizeUrls(true) // blocks javascript: and similar
    .attributeProviderFactory((_: AttributeProviderContext) => new LinkAttributeProvider())
    .build()

  /**
   * Visitor that transforms Text snippets containing http(s) URLs into Link nodes,
   * respecting exceptions (not within code, nor within link/img, and ignoring "https://").
   */
  private class AutoLinkVisitor extends AbstractVisitor {
    // Simple URL: starts with http(s) and continues until space/<>.
    // Avoids capturing common closing characters at the end (.,),;!?]}) ).
    private val urlPattern: Pattern =
      Pattern.compile("(?i)https?://[^\\s<>]+[^\\s<>\\]\\)\\}\\.,;!\\?]")

    override def visit(text: Text): Unit = {
      if (isInside(text, classOf[Link], classOf[Image], classOf[Code], classOf[FencedCodeBlock], classOf[IndentedCodeBlock])) {
        return
      }

      val literal = text.getLiteral
      val m: Matcher = urlPattern.matcher(literal)

      if (!m.find()) {
        super.visit(text)
        return
      }

      var lastIdx = 0
      m.reset()

      while (m.find()) {
        val start = m.start()
        val end = m.end()
        val url = literal.substring(start, end)

        // prefix before the link
        if (start > lastIdx) {
          val prefix = new Text(literal.substring(lastIdx, start))
          text.insertBefore(prefix)
        }

        if (!isBareSchemeOnly(url)) {
          val link = new Link(url, null)
          link.appendChild(new Text(url))
          text.insertBefore(link)
        } else {
          // keeps "http(s)://" as plain text
          text.insertBefore(new Text(url))
        }

        lastIdx = end
      }

      if (lastIdx < literal.length) {
        val suffix = new Text(literal.substring(lastIdx))
        text.insertBefore(suffix)
      }

      text.unlink()
    }

    private def isBareSchemeOnly(url: String): Boolean = {
      val lower = url.toLowerCase
      lower == "http://" || lower == "https://"
    }

    private def isInside(node: Node, clazzes: Class[_ <: Node]*): Boolean = {
      var cur: Node = node
      while (cur != null) {
        if (clazzes.exists(_.isInstance(cur))) return true
        cur = cur.getParent
      }
      false
    }
  }

  private def autolinkUrls(root: Node): Unit = {
    root.accept(new AutoLinkVisitor)
  }
  private val MaxMessageLength = 5000

  private val MarkdownSyntaxChars: Array[Char] =
    Array('[', ']', '<', '>', '(', ')', '*', '_', '`', '~')

  private val MaxSyntaxCharRepetitions = 100

  private def hasPathologicalInput(text: String): Boolean = {
    val counts = new Array[Int](MarkdownSyntaxChars.length)
    var i = 0
    while (i < text.length) {
      val c = text.charAt(i)
      var j = 0
      while (j < MarkdownSyntaxChars.length) {
        if (c == MarkdownSyntaxChars(j)) {
          counts(j) += 1
          if (counts(j) > MaxSyntaxCharRepetitions) return true
        }
        j += 1
      }
      i += 1
    }
    false
  }

  /** Prefix markdown syntax characters with backslash so the parser treats them as literal text. */
  private def escapeMarkdownSyntax(text: String): String = {
    val sb = new StringBuilder(text.length * 2)
    var i = 0
    while (i < text.length) {
      val c = text.charAt(i)
      if (MarkdownSyntaxChars.contains(c)) sb.append('\\')
      sb.append(c)
      i += 1
    }
    sb.toString()
  }

  def markdownToSafeHtml(md: String, enableImages: Boolean = false): String = {
    val safeMd = if (md.length > MaxMessageLength) md.substring(0, MaxMessageLength) else md
    val processedMd = if (hasPathologicalInput(safeMd)) escapeMarkdownSyntax(safeMd) else safeMd

    val doc = parser.parse(processedMd)
    autolinkUrls(doc) // extra step: create links from plain text URLs
    val chosenRenderer = if (enableImages) rendererWithImages else rendererNoImages
    chosenRenderer.render(doc)
  }

  def processMentions(html: String, userNameToIds: Map[String, List[String]]): (String, List[String]) = {
    if (userNameToIds.isEmpty || html.indexOf('@') < 0) return (html, List.empty)

    val sortedNames = userNameToIds.keys.toSeq.sortBy(-_.length)

    val escapedAlternatives = sortedNames.map(n => Pattern.quote(n)).mkString("|")
    val mentionPattern: Pattern = Pattern.compile(
      s"@($escapedAlternatives)(?=[\\s,\\.!\\?;:\\)\\]>\"']|&nbsp;|<|$$)",
      Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    )

    val tagPattern: Pattern = Pattern.compile("<[^>]+>")
    val tagMatcher = tagPattern.matcher(html)

    val result = new StringBuilder(html.length + 128)
    val mentionedIds = scala.collection.mutable.LinkedHashSet.empty[String]

    var skipDepth = 0
    var lastEnd = 0

    while (tagMatcher.find()) {
      val tagStart = tagMatcher.start()
      val tagEnd = tagMatcher.end()
      val tag = tagMatcher.group()
      val tagLower = tag.toLowerCase

      if (tagStart > lastEnd) {
        val textNode = html.substring(lastEnd, tagStart)
        if (skipDepth == 0) {
          val (processed, ids) = replaceMentionsInText(textNode, mentionPattern, userNameToIds)
          result.append(processed)
          mentionedIds ++= ids
        } else {
          result.append(textNode)
        }
      }

      val isClosingTag = tagLower.startsWith("</")
      val isSelfClosing = tagLower.endsWith("/>") || tagLower.matches("<(br|hr|img|input)[^>]*/?>")
      val tagName = tagLower.replaceAll("[<>/\\s].*", "").replaceAll("[<>/]", "").trim

      if (!isSelfClosing) {
        if (isClosingTag && Seq("code", "pre", "a").contains(tagName)) {
          skipDepth = math.max(0, skipDepth - 1)
        } else if (!isClosingTag && Seq("code", "pre", "a").contains(tagName)) {
          skipDepth += 1
        }
      }

      result.append(tag)
      lastEnd = tagEnd
    }

    if (lastEnd < html.length) {
      val textNode = html.substring(lastEnd)
      if (skipDepth == 0) {
        val (processed, ids) = replaceMentionsInText(textNode, mentionPattern, userNameToIds)
        result.append(processed)
        mentionedIds ++= ids
      } else {
        result.append(textNode)
      }
    }

    (result.toString(), mentionedIds.toList)
  }

  private def replaceMentionsInText(
    text:           String,
    pattern:        Pattern,
    userNameToIds:  Map[String, List[String]]
  ): (String, List[String]) = {
    val m = pattern.matcher(text)
    val sb = new StringBuilder(text.length + 64)
    val ids = scala.collection.mutable.ListBuffer.empty[String]
    var last = 0

    while (m.find()) {
      sb.append(text.substring(last, m.start()))
      val matchedName = m.group(1)
      val userIds = userNameToIds.getOrElse(matchedName.toLowerCase(Locale.ROOT), List.empty)
      if (userIds.nonEmpty) {
        ids ++= userIds
        sb.append(s"""<span class="chat-mention" data-userid="${userIds.mkString(",")}">@$matchedName</span>""")
      } else {
        sb.append(m.group())
      }
      last = m.end()
    }

    sb.append(text.substring(last))
    (sb.toString(), ids.toList)
  }
}

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

  private val TagPattern: Pattern = Pattern.compile("<[^>]+>")

  private val TagNamePattern: Pattern = Pattern.compile("^</?([a-z0-9]+)")

  private val MentionSkippedTags: Set[String] = Set("code", "pre", "a")

  private val NonBreakingSpace = "&nbsp;"

  private val MentionLeftBoundaryChars: Set[Char] = Set('(', '[', '>', '"', '\'')

  private val MentionRightBoundaryChars: Set[Char] =
    Set(',', '.', '!', '?', ';', ':', ')', ']', '>', '<', '"', '\'')

  /** Escapes the same characters commonmark escapes when it renders a text node. */
  def escapeHtmlText(text: String): String = {
    val sb = new StringBuilder(text.length + 16)
    var i = 0
    while (i < text.length) {
      text.charAt(i) match {
        case '&' => sb.append("&amp;")
        case '<' => sb.append("&lt;")
        case '>' => sb.append("&gt;")
        case '"' => sb.append("&quot;")
        case c   => sb.append(c)
      }
      i += 1
    }
    sb.toString()
  }

  def processMentions(html: String, userNameToIds: Map[String, List[String]]): (String, List[String]) = {
    if (userNameToIds.isEmpty || html.indexOf('@') < 0) return (html, List.empty)

    // Scanning the '@' positions keeps this off compiling an alternation with one branch
    // per participant on the meeting actor's thread, once per message.
    val maxNameLength = userNameToIds.keys.map(_.length).max

    val tagMatcher = TagPattern.matcher(html)

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
          val (processed, ids) = replaceMentionsInText(textNode, userNameToIds, maxNameLength)
          result.append(processed)
          mentionedIds ++= ids
        } else {
          result.append(textNode)
        }
      }

      val isClosingTag = tagLower.startsWith("</")
      val isSelfClosing = tagLower.endsWith("/>") || tagLower.matches("<(br|hr|img|input)[^>]*/?>")

      if (!isSelfClosing && MentionSkippedTags.contains(extractTagName(tagLower))) {
        if (isClosingTag) {
          skipDepth = math.max(0, skipDepth - 1)
        } else {
          skipDepth += 1
        }
      }

      result.append(tag)
      lastEnd = tagEnd
    }

    if (lastEnd < html.length) {
      val textNode = html.substring(lastEnd)
      if (skipDepth == 0) {
        val (processed, ids) = replaceMentionsInText(textNode, userNameToIds, maxNameLength)
        result.append(processed)
        mentionedIds ++= ids
      } else {
        result.append(textNode)
      }
    }

    (result.toString(), mentionedIds.toList)
  }

  private def extractTagName(tagLower: String): String = {
    val m = TagNamePattern.matcher(tagLower)
    if (m.find()) m.group(1) else ""
  }

  private def hasLeftBoundary(text: String, atIndex: Int): Boolean = {
    if (atIndex == 0) return true

    val c = text.charAt(atIndex - 1)
    Character.isWhitespace(c) ||
      MentionLeftBoundaryChars.contains(c) ||
      text.startsWith(NonBreakingSpace, atIndex - NonBreakingSpace.length)
  }

  private def hasRightBoundary(text: String, endIndex: Int): Boolean = {
    if (endIndex >= text.length) return true

    val c = text.charAt(endIndex)
    Character.isWhitespace(c) ||
      MentionRightBoundaryChars.contains(c) ||
      text.startsWith(NonBreakingSpace, endIndex)
  }

  /** Longest candidate first, so a name that prefixes another one doesn't win over it. */
  private def findMentionAt(
    text:          String,
    atIndex:       Int,
    userNameToIds: Map[String, List[String]],
    maxNameLength: Int
  ): Option[(String, List[String])] = {
    val nameStart = atIndex + 1
    var length = math.min(maxNameLength, text.length - nameStart)

    while (length > 0) {
      if (hasRightBoundary(text, nameStart + length)) {
        val candidate = text.substring(nameStart, nameStart + length)
        userNameToIds.get(candidate.toLowerCase(Locale.ROOT)) match {
          case Some(userIds) if userIds.nonEmpty => return Some((candidate, userIds))
          case _                                 =>
        }
      }
      length -= 1
    }

    None
  }

  private def replaceMentionsInText(
    text:          String,
    userNameToIds: Map[String, List[String]],
    maxNameLength: Int
  ): (String, List[String]) = {
    if (text.indexOf('@') < 0) return (text, List.empty)

    val sb = new StringBuilder(text.length + 64)
    val ids = scala.collection.mutable.ListBuffer.empty[String]
    var i = 0
    var last = 0

    while (i < text.length) {
      if (text.charAt(i) == '@' && hasLeftBoundary(text, i)) {
        findMentionAt(text, i, userNameToIds, maxNameLength) match {
          case Some((matchedName, userIds)) =>
            sb.append(text.substring(last, i))
            sb.append(s"""<span class="chat-mention" data-userid="${userIds.mkString(",")}">@$matchedName</span>""")
            ids ++= userIds
            i += matchedName.length + 1
            last = i
          case None =>
            i += 1
        }
      } else {
        i += 1
      }
    }

    sb.append(text.substring(last))
    (sb.toString(), ids.toList)
  }
}

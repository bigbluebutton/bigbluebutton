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

  /**
   * Tags that don't break the rendered text apart. What sits on the other side of one is still
   * the same word as far as a mention goes, so `**reminder**@Name` isn't one: the character
   * before the "@" is the "r" the bold tag hides, not the start of a line.
   */
  private val MentionInlineTags: Set[String] = Set(
    "a", "b", "code", "del", "em", "i", "ins", "mark", "s", "small",
    "span", "strike", "strong", "sub", "sup", "u"
  )

  private val MentionPattern: Pattern =
    Pattern.compile("""<span class="chat-mention" data-userid="([^"]*)">@([^<]*)</span>""")

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

  /** Undoes `escapeHtmlText`, so a name read back out of rendered html matches the user list. */
  def unescapeHtmlText(text: String): String = {
    text
      .replace("&quot;", "\"")
      .replace("&gt;", ">")
      .replace("&lt;", "<")
      .replace("&amp;", "&")
  }

  /**
   * The (userId, name) pairs a previous render already resolved, in message order.
   *
   * Editing a message re-runs the whole mention pass, and the client doesn't have to resend
   * what it picked the first time. Reading the pairs back out of the stored html keeps a
   * mention the sender never touched from disappearing on an unrelated edit.
   */
  def parseRenderedMentions(html: String): List[(String, String)] = {
    if (html.indexOf("chat-mention") < 0) return List.empty

    val matcher = MentionPattern.matcher(html)
    val pairs = List.newBuilder[(String, String)]

    while (matcher.find()) {
      pairs += ((unescapeHtmlText(matcher.group(1)), unescapeHtmlText(matcher.group(2))))
    }

    pairs.result()
  }

  /**
   * Wraps every mention in the rendered HTML and returns the ids it resolved to.
   *
   * `authorizedByName` carries the ids the sender picked from the mention list, keyed by the
   * escaped lowercase name and kept in message order, so the nth "@name" hit takes the nth id.
   * A name typed by hand resolves only when it belongs to a single participant: with namesakes
   * there is no way to tell which one was meant, and guessing would notify the wrong person.
   */
  def processMentions(
      html:             String,
      userNameToIds:    Map[String, List[String]],
      authorizedByName: Map[String, List[String]] = Map.empty
  ): (String, List[String]) = {
    if (userNameToIds.isEmpty || html.indexOf('@') < 0) return (html, List.empty)

    // Scanning the '@' positions keeps this off compiling an alternation with one branch
    // per participant on the meeting actor's thread, once per message.
    val maxNameLength = userNameToIds.keys.map(_.length).max

    val queues = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Queue[String]]
    authorizedByName.foreach {
      case (name, userIds) => queues(name) = scala.collection.mutable.Queue(userIds: _*)
    }

    // Tokenized up front because a name's boundaries can sit on the far side of a tag, in the
    // text node before or after this one.
    val tokens = tokenizeHtml(html)

    val result = new StringBuilder(html.length + 128)
    val mentionedIds = scala.collection.mutable.LinkedHashSet.empty[String]

    var skipDepth = 0
    var index = 0

    while (index < tokens.length) {
      val (isTag, raw) = tokens(index)

      if (isTag) {
        val tagLower = raw.toLowerCase(Locale.ROOT)
        val isClosingTag = tagLower.startsWith("</")
        val isSelfClosing = tagLower.endsWith("/>") || tagLower.matches("<(br|hr|img|input)[^>]*/?>")

        if (!isSelfClosing && MentionSkippedTags.contains(extractTagName(tagLower))) {
          if (isClosingTag) {
            skipDepth = math.max(0, skipDepth - 1)
          } else {
            skipDepth += 1
          }
        }

        result.append(raw)
      } else if (skipDepth == 0 && raw.indexOf('@') >= 0) {
        val (processed, ids) = replaceMentionsInText(
          raw,
          textBefore(tokens, index),
          textAfter(tokens, index),
          userNameToIds,
          queues,
          maxNameLength
        )
        result.append(processed)
        mentionedIds ++= ids
      } else {
        result.append(raw)
      }

      index += 1
    }

    (result.toString(), mentionedIds.toList)
  }

  /** The html split into its tags and the text nodes between them, in order. */
  private def tokenizeHtml(html: String): Vector[(Boolean, String)] = {
    val tokens = Vector.newBuilder[(Boolean, String)]
    val tagMatcher = TagPattern.matcher(html)
    var lastEnd = 0

    while (tagMatcher.find()) {
      if (tagMatcher.start() > lastEnd) {
        tokens += ((false, html.substring(lastEnd, tagMatcher.start())))
      }
      tokens += ((true, tagMatcher.group()))
      lastEnd = tagMatcher.end()
    }

    if (lastEnd < html.length) {
      tokens += ((false, html.substring(lastEnd)))
    }

    tokens.result()
  }

  private def breaksMentionText(tagRaw: String): Boolean =
    !MentionInlineTags.contains(extractTagName(tagRaw.toLowerCase(Locale.ROOT)))

  /**
   * The rendered text that runs into this node from the left, empty once a tag that starts a
   * new line of text (a paragraph, a list item, a `<br>`) gets in the way.
   */
  private def textBefore(tokens: Vector[(Boolean, String)], index: Int): String = {
    var i = index - 1

    while (i >= 0) {
      val (isTag, raw) = tokens(i)
      if (!isTag) {
        if (raw.nonEmpty) return raw
      } else if (breaksMentionText(raw)) {
        return ""
      }
      i -= 1
    }

    ""
  }

  /** The mirror of `textBefore`: what runs into this node from the right. */
  private def textAfter(tokens: Vector[(Boolean, String)], index: Int): String = {
    var i = index + 1

    while (i < tokens.length) {
      val (isTag, raw) = tokens(i)
      if (!isTag) {
        if (raw.nonEmpty) return raw
      } else if (breaksMentionText(raw)) {
        return ""
      }
      i += 1
    }

    ""
  }

  private def extractTagName(tagLower: String): String = {
    val m = TagNamePattern.matcher(tagLower)
    if (m.find()) m.group(1) else ""
  }

  /** True when the rendered text ending with `prefix` leaves a word boundary behind it. */
  private def endsAtBoundary(prefix: String): Boolean = {
    if (prefix.isEmpty) return true

    val c = prefix.charAt(prefix.length - 1)
    Character.isWhitespace(c) ||
      MentionLeftBoundaryChars.contains(c) ||
      prefix.endsWith(NonBreakingSpace)
  }

  /** True when the rendered text starting with `suffix` opens on a word boundary. */
  private def startsAtBoundary(suffix: String): Boolean = {
    if (suffix.isEmpty) return true

    val c = suffix.charAt(0)
    Character.isWhitespace(c) ||
      MentionRightBoundaryChars.contains(c) ||
      suffix.startsWith(NonBreakingSpace)
  }

  private def hasLeftBoundary(text: String, atIndex: Int, prevText: String): Boolean = {
    // At the edge of the node the neighbouring character lives in another text node, which is
    // what keeps `**bold**@Name` from reading as a mention.
    if (atIndex == 0) return endsAtBoundary(prevText)

    val c = text.charAt(atIndex - 1)
    Character.isWhitespace(c) ||
      MentionLeftBoundaryChars.contains(c) ||
      text.startsWith(NonBreakingSpace, atIndex - NonBreakingSpace.length)
  }

  private def hasRightBoundary(text: String, endIndex: Int, nextText: String): Boolean = {
    if (endIndex >= text.length) return startsAtBoundary(nextText)

    val c = text.charAt(endIndex)
    Character.isWhitespace(c) ||
      MentionRightBoundaryChars.contains(c) ||
      text.startsWith(NonBreakingSpace, endIndex)
  }

  /** Longest candidate first, so a name that prefixes another one doesn't win over it. */
  private def findMentionAt(
      text:          String,
      atIndex:       Int,
      nextText:      String,
      userNameToIds: Map[String, List[String]],
      maxNameLength: Int
  ): Option[String] = {
    val nameStart = atIndex + 1
    var length = math.min(maxNameLength, text.length - nameStart)

    while (length > 0) {
      if (hasRightBoundary(text, nameStart + length, nextText)) {
        val candidate = text.substring(nameStart, nameStart + length)
        if (userNameToIds.contains(candidate.toLowerCase(Locale.ROOT))) return Some(candidate)
      }
      length -= 1
    }

    None
  }

  /**
   * A picked id first, so namesakes resolve to the participant the sender chose. Falling back
   * to the name is only safe while it belongs to a single participant.
   */
  private def resolveMentionId(
      nameKey:       String,
      userNameToIds: Map[String, List[String]],
      queues:        scala.collection.mutable.Map[String, scala.collection.mutable.Queue[String]]
  ): Option[String] = {
    queues.get(nameKey).filter(_.nonEmpty).map(_.dequeue()) orElse {
      userNameToIds.get(nameKey) match {
        case Some(userId :: Nil) => Some(userId)
        case _                   => None
      }
    }
  }

  private def replaceMentionsInText(
      text:          String,
      prevText:      String,
      nextText:      String,
      userNameToIds: Map[String, List[String]],
      queues:        scala.collection.mutable.Map[String, scala.collection.mutable.Queue[String]],
      maxNameLength: Int
  ): (String, List[String]) = {
    if (text.indexOf('@') < 0) return (text, List.empty)

    val sb = new StringBuilder(text.length + 64)
    val ids = scala.collection.mutable.ListBuffer.empty[String]
    var i = 0
    var last = 0

    while (i < text.length) {
      if (text.charAt(i) == '@' && hasLeftBoundary(text, i, prevText)) {
        findMentionAt(text, i, nextText, userNameToIds, maxNameLength) match {
          case Some(matchedName) =>
            resolveMentionId(matchedName.toLowerCase(Locale.ROOT), userNameToIds, queues) match {
              case Some(userId) =>
                sb.append(text.substring(last, i))
                sb.append(s"""<span class="chat-mention" data-userid="${escapeHtmlText(userId)}">@$matchedName</span>""")
                ids += userId
                i += matchedName.length + 1
                last = i
              case None =>
                // Ambiguous and not picked from the list: leave the text alone rather than
                // notify a namesake. Skipping the whole name keeps a shorter one from matching.
                i += matchedName.length + 1
            }
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

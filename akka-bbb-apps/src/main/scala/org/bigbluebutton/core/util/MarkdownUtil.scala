package org.bigbluebutton.core.util

import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.commonmark.renderer.NodeRenderer
import org.commonmark.renderer.html._
import org.commonmark.node._
import org.commonmark.renderer.html.{ AttributeProvider, AttributeProviderContext }
import java.util.regex.{ Matcher, Pattern }

import java.util

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
  def markdownToSafeHtml(md: String, enableImages: Boolean = false): String = {

    val doc = parser.parse(md)
    autolinkUrls(doc) // extra step: create links from plain text URLs
    val chosenRenderer = if (enableImages) rendererWithImages else rendererNoImages
    chosenRenderer.render(doc)
  }
}

package org.bigbluebutton.core.util

import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.commonmark.renderer.NodeRenderer
import org.commonmark.renderer.html._
import org.commonmark.node._
import org.commonmark.renderer.html.{ AttributeProvider, AttributeProviderContext, AttributeProviderFactory, HtmlRenderer }

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
  val renderer = HtmlRenderer.builder()
    .escapeHtml(true) // blocks raw HTML
    .sanitizeUrls(true) // blocks javascript: and similar
    .attributeProviderFactory((_: AttributeProviderContext) => new LinkAttributeProvider())
    .nodeRendererFactory(new NoImageNodeRendererFactory)
    .build()

  def markdownToSafeHtml(md: String): String = {
    val doc = parser.parse(md)
    renderer.render(doc)
  }
}

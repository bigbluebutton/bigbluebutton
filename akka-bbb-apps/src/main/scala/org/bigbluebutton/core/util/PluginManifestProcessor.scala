package org.bigbluebutton.core.util

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.protos.PluginManifest

import java.io.{BufferedReader, InputStreamReader}
import java.net.URL
import java.util.concurrent.Executors
import scala.collection.concurrent.TrieMap
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, ExecutionContext, Future, blocking}
import scala.util.{Failure, Success, Try}

object PluginManifestProcessor {
  implicit val ec: ExecutionContext = ExecutionContext.fromExecutor(Executors.newFixedThreadPool(10))
  private val objectMapper = new ObjectMapper().registerModule(DefaultScalaModule)

  private def replaceMetaParameters(manifestContent: String, metadata: Map[String, String]): Try[String] = Try {
    val pattern = "\\$\\{([\\w\\-]+)\\}".r
    pattern.replaceAllIn(manifestContent, matcher => {
      val variableName = matcher.group(1)
      if (variableName.startsWith("meta_") && variableName.length > 5) {
        val key = variableName.substring(5).toLowerCase
        metadata.getOrElse(key, throw new NoSuchFieldException(s"Metadata $variableName not found in URL parameters"))
      } else {
        throw new NoSuchFieldException(s"Metadata $variableName is malformed, please provide a valid one")
      }
    })
  }

  private def fetchManifestContent(urlString: String): Try[String] = Try {
    val url = new URL(urlString)
    val reader = new BufferedReader(new InputStreamReader(url.openStream()))
    try reader.lines().toArray.mkString("\n") finally reader.close()
  }

  private def validateChecksum(content: String, checksum: String): Boolean = {
    if (checksum.isEmpty) true
    else DigestUtils.sha256Hex(content) == checksum
  }

  def parseJson(content: String): Try[JsonNode] = Try(objectMapper.readTree(content))

  private def processManifest(pluginManifest: PluginManifest, metadata: Map[String, String]): Future[Option[(String, Map[String, Any])]] = Future {
    blocking {
      fetchManifestContent(pluginManifest.url) match {
        case Success(content) =>
          if (!validateChecksum(content, pluginManifest.checksum)) {
            println(s"Checksum mismatch for URL: ${pluginManifest.url}")
            None
          } else {
            parseJson(content) match {
              case Success(jsonNode) if jsonNode.has("name") =>
                val name = jsonNode.get("name").asText()
                replaceMetaParameters(content, metadata) match {
                  case Success(updatedContent) =>
                    val mappedContent = objectMapper.readValue[Map[String, Any]](updatedContent, classOf[Map[String, Any]])
                    Some(name -> Map("url" -> pluginManifest.url, "content" -> mappedContent))
                  case Failure(ex) =>
                    println(s"Failed to replace parameters in manifest: $ex")
                    None
                }
              case Success(_) =>
                println(s"No name field found for URL: ${pluginManifest.url}")
                None
              case Failure(ex) =>
                println(s"Failed to parse JSON: $ex")
                None
            }
          }
        case Failure(ex) =>
          println(s"Failed to fetch content from URL: ${pluginManifest.url}, error: $ex")
          None
      }
    }
  }

  def requestPluginManifests(meetingMetadata: Map[String, String], pluginManifests: Seq[PluginManifest]): Map[String, AnyRef] = {
    val urlContents = TrieMap.empty[String, AnyRef]

    val futures = pluginManifests.map { pluginManifest =>
      processManifest(pluginManifest, meetingMetadata).map {
        case Some((key, value)) => urlContents.put(key, value)
        case None =>
      }
    }

    Await.result(Future.sequence(futures), 30.seconds) // Adjust timeout as needed
    urlContents.toMap
  }
}

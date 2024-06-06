package org.bigbluebutton.common2.util

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.scala.{ DefaultScalaModule, ScalaObjectMapper }

import scala.util.Try

object YamlUtil {
  val mapper = new ObjectMapper(new YAMLFactory()) with ScalaObjectMapper
  mapper.registerModule(DefaultScalaModule)

  def mergeImmutableMaps(target: Map[String, Object], source: Map[String, Object]): Map[String, Object] = {
    source.foldLeft(target) {
      case (acc, (key, sourceValue)) if acc.contains(key) =>
        val targetValue = acc(key)
        val mergedValue = (targetValue, sourceValue) match {
          case (targetMap: Map[String, Object], sourceMap: Map[String, Object]) =>
            // If both source and target values are maps, recursively merge them.
            mergeImmutableMaps(targetMap, sourceMap)
          case _ =>
            // If not, replace the target value with the source value.
            sourceValue
        }
        acc.updated(key, mergedValue)
      case (acc, (key, sourceValue)) =>
        // If the key is not in the target map, add it.
        acc + (key -> sourceValue)
    }
  }

  def toMap[V](yaml: String)(implicit m: Manifest[V]): Try[Map[String, V]] = fromYaml[Map[String, V]](yaml)

  def fromYaml[T](yaml: String)(implicit m: Manifest[T]): Try[T] = {
    for {
      result <- Try(mapper.readValue[T](yaml))
    } yield result
  }
}

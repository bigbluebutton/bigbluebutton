package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import scala.jdk.CollectionConverters._
import scala.util.{ Failure, Success, Try }
import com.typesafe.config.{ Config, ConfigFactory, ConfigRenderOptions, ConfigValueType }
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.db.{ PresAnnotationDAO, PresAnnotationHistoryDAO }
import org.slf4j.LoggerFactory

object WhiteboardModel {
  private val logger = LoggerFactory.getLogger(getClass)

  val AllowedAnnotationTypesPath = "whiteboard.allowedAnnotationTypes"

  // Applied when whiteboard.allowedAnnotationTypes is unset. Keep identical to the list
  // shipped in src/universal/conf/application.conf.
  val DefaultAllowedAnnotationTypes: Set[String] =
    Set("draw", "geo", "arrow", "line", "text", "note", "highlight", "frame", "group", "poll")

  val ForbiddenAnnotationTypes: Set[String] =
    Set("embed", "bookmark", "image", "video")

  private val AllowedUrlPrefixes = Set("http://", "https://")

  private val Delete = 0x7f.toChar

  lazy val allowedAnnotationTypes: Set[String] = {
    val types = effectiveAllowedTypes(readConfiguredTypes(ConfigFactory.load()))

    if (types.isEmpty) {
      logger.warn("No whiteboard annotation type is enabled; all annotations will be rejected.")
    } else {
      logger.info("Whiteboard annotation types enabled: [{}]", types.toList.sorted.mkString(", "))
    }

    types
  }

  def readConfiguredTypes(config: Config): Set[String] = {
    if (!config.hasPath(AllowedAnnotationTypesPath)) {
      Set.empty
    } else {
      Try(config.getList(AllowedAnnotationTypesPath).asScala.toList) match {
        case Success(configuredValues) =>
          val nonStrings = configuredValues.filter(_.valueType() != ConfigValueType.STRING)

          if (nonStrings.nonEmpty) {
            logger.error(
              "Every [{}] entry must be a quoted string; falling back to the default list. Rejected entries: [{}]",
              AllowedAnnotationTypesPath, nonStrings.map(_.render(ConfigRenderOptions.concise())).mkString(", ")
            )
            Set.empty
          } else {
            configuredValues.map(_.unwrapped().asInstanceOf[String].trim).filter(_.nonEmpty).toSet
          }
        case Failure(ex) =>
          logger.error(
            "Could not read [{}] as a list of strings; falling back to the default list: {}",
            AllowedAnnotationTypesPath, ex.getMessage
          )
          Set.empty
      }
    }
  }

  def effectiveAllowedTypes(configuredTypes: Set[String]): Set[String] = {
    val requestedTypes = if (configuredTypes.isEmpty) DefaultAllowedAnnotationTypes else configuredTypes

    val forbidden = requestedTypes.intersect(ForbiddenAnnotationTypes)
    if (forbidden.nonEmpty) {
      logger.warn(
        "Ignoring [{}] entries that cannot be enabled: [{}]",
        AllowedAnnotationTypesPath, forbidden.toList.sorted.mkString(", ")
      )
    }

    requestedTypes -- ForbiddenAnnotationTypes
  }

  def isAllowedAnnotationType(annotationInfo: Map[String, _], allowedTypes: Set[String]): Boolean = {
    annotationInfo.get("type") match {
      case Some(annotationType: String) => allowedTypes.contains(annotationType)
      case _                            => false
    }
  }

  def hasSafeAnnotationUrl(annotationInfo: Map[String, _]): Boolean = {
    annotationInfo.get("props") match {
      case Some(props: Map[String, _] @unchecked) => props.get("url") match {
        case None              => true
        case Some(url: String) => isSafeAnnotationUrl(url)
        case Some(_)           => false
      }
      case _ => true
    }
  }

  private def isSafeAnnotationUrl(url: String): Boolean = {
    val normalized = url.filterNot(c => c <= ' ' || c == Delete).toLowerCase
    normalized.isEmpty || AllowedUrlPrefixes.exists(normalized.startsWith)
  }
}

class WhiteboardModel extends SystemConfiguration {
  import WhiteboardModel.{ hasSafeAnnotationUrl, isAllowedAnnotationType }

  private val allowedAnnotationTypes = WhiteboardModel.allowedAnnotationTypes

  private var _whiteboards = new HashMap[String, Whiteboard]()

  private def saveWhiteboard(wb: Whiteboard) {
    _whiteboards += wb.id -> wb
  }

  def getWhiteboard(id: String): Whiteboard = {
    _whiteboards.get(id).getOrElse(createWhiteboard(id))
  }

  def hasWhiteboard(id: String): Boolean = {
    _whiteboards.contains(id)
  }

  private def createWhiteboard(wbId: String): Whiteboard = {
    Whiteboard(
      wbId,
      new HashMap[String, AnnotationVO]
    )
  }

  private def deepMerge(test: Map[String, _], that: Map[String, _]): Map[String, _] =
    (for (k <- test.keys ++ that.keys) yield {
      val newValue =
        (test.get(k), that.get(k)) match {
          case (Some(v), None) => v
          case (None, Some(v)) => v
          case (Some(v1), Some(v2)) =>
            if (v1.isInstanceOf[Map[String, _]] && v2.isInstanceOf[Map[String, _]])
              deepMerge(v1.asInstanceOf[Map[String, _]], v2.asInstanceOf[Map[String, _]])
            else v2
          case (_, _) => ???
        }
      k -> newValue
    }).toMap

  def addAnnotations(wbId: String, meetingId: String, userId: String, annotations: Array[AnnotationVO], isPresenter: Boolean, isModerator: Boolean): Array[AnnotationVO] = {

    val wb = getWhiteboard(wbId)

    var annotationsAdded = Array[AnnotationVO]()
    var annotationsDiffAdded = Array[AnnotationVO]()
    var newAnnotationsMap = wb.annotationsMap

    for (annotation <- annotations) {
      val oldAnnotation = wb.annotationsMap.get(annotation.id)
      if (oldAnnotation.isDefined) {
        val hasPermission = isPresenter || isModerator || oldAnnotation.get.userId == userId
        if (hasPermission) {
          val mergedAnnotationInfo = deepMerge(oldAnnotation.get.annotationInfo, annotation.annotationInfo)

          // Apply cleaning if it's an arrow annotation
          val finalAnnotationInfo = if (oldAnnotation.get.annotationInfo.get("type").contains("arrow")) {
            cleanArrowAnnotationProps(mergedAnnotationInfo)
          } else {
            mergedAnnotationInfo
          }

          if (!isAllowedAnnotationType(finalAnnotationInfo, allowedAnnotationTypes)) {
            println(s"Rejected update of annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
          } else if (!hasSafeAnnotationUrl(finalAnnotationInfo)) {
            println(s"Rejected update of annotation ${annotation.id} with disallowed url on page [${wb.id}], ignoring...")
          } else {
            val newAnnotation = oldAnnotation.get.copy(annotationInfo = finalAnnotationInfo)
            newAnnotationsMap += (annotation.id -> newAnnotation)
            annotationsAdded :+= newAnnotation
            annotationsDiffAdded :+= annotation
            println(s"Updated annotation on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
          }
        } else {
          println(s"User $userId doesn't have permission to edit annotation ${annotation.id}, ignoring...")
        }
      } else if (annotation.annotationInfo.contains("type")) {
        if (!isAllowedAnnotationType(annotation.annotationInfo, allowedAnnotationTypes)) {
          println(s"Rejected annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
        } else if (!hasSafeAnnotationUrl(annotation.annotationInfo)) {
          println(s"Rejected annotation ${annotation.id} with disallowed url on page [${wb.id}], ignoring...")
        } else {
          newAnnotationsMap += (annotation.id -> annotation)
          annotationsAdded :+= annotation
          annotationsDiffAdded :+= annotation
          println(s"Adding annotation to page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
        }
      } else {
        println(s"New annotation [${annotation.id}] with no type, ignoring...")
      }
    }

    val annotationUpdatedAt = System.currentTimeMillis()
    PresAnnotationHistoryDAO.insertOrUpdateMap(meetingId, annotationsDiffAdded, annotationUpdatedAt)
    PresAnnotationDAO.insertOrUpdateMap(meetingId, annotationsAdded, annotationUpdatedAt)

    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotationsDiffAdded
  }

  private def overwriteLineShapeHandles(oldProps: Map[String, Any], newProps: Map[String, Any]): Map[String, Any] = {
    val newHandles = newProps.get("handles")
    val updatedProps = oldProps ++ newProps.filter {
      case ("handles", _) => false // Remove the old handles
      case _              => true
    }
    updatedProps ++ newHandles.map("handles" -> _)
  }

  private def cleanArrowAnnotationProps(annotationInfo: Map[String, _]): Map[String, _] = {
    annotationInfo.get("props") match {
      case Some(props: Map[String, _]) =>
        val cleanedProps = props.map {
          case ("end", endProps: Map[String, _])     => "end" -> cleanEndOrStartProps(endProps)
          case ("start", startProps: Map[String, _]) => "start" -> cleanEndOrStartProps(startProps)
          case other                                 => other
        }
        annotationInfo + ("props" -> cleanedProps)
      case _ => annotationInfo
    }
  }

  private def cleanEndOrStartProps(props: Map[String, _]): Map[String, _] = {
    props.get("type") match {
      case Some("binding") => props - ("x", "y") // Remove 'x' and 'y' for 'binding' type
      case Some("point")   => props - ("boundShapeId", "normalizedAnchor", "isExact", "isPrecise") // Remove unwanted properties for 'point' type
      case _               => props
    }
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    wb.annotationsMap.values.toArray
  }

  def deleteAnnotations(wbId: String, meetingId: String, userId: String, annotationsIds: Array[String], isPresenter: Boolean, isModerator: Boolean): Array[String] = {
    val wb = getWhiteboard(wbId)

    var annotationsIdsRemoved = Array[String]()
    var newAnnotationsMap = wb.annotationsMap

    for (annotationId <- annotationsIds) {
      val annotation = wb.annotationsMap.get(annotationId)

      if (annotation.isDefined) {
        val hasPermission = isPresenter || isModerator || annotation.get.userId == userId
        if (hasPermission) {
          newAnnotationsMap -= annotationId
          println(s"Removed annotation $annotationId on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
          annotationsIdsRemoved :+= annotationId
        } else {
          println(s"User $userId doesn't have permission to remove annotation $annotationId, ignoring...")
        }
      } else {
        println(s"Annotation $annotationId not found while trying to delete it.")
      }
    }

    // Update whiteboard and save
    val updatedWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(updatedWb)

    val annotationUpdatedAt = System.currentTimeMillis()
    PresAnnotationHistoryDAO.deleteAnnotations(meetingId, wb.id, userId, annotationsIdsRemoved, annotationUpdatedAt)
    PresAnnotationDAO.deleteAnnotations(meetingId, wb.id, userId, annotationsIdsRemoved, annotationUpdatedAt)

    annotationsIdsRemoved
  }
}

package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.db.{ PresAnnotationDAO, PresAnnotationHistoryDAO }

object WhiteboardModel {
  // Shape types that must never be stored or broadcast as whiteboard
  // annotations. They render embeddable/rich content (iframes, link
  // previews) instead of being part of the drawing toolset, so they are
  // rejected server-side regardless of any client-side checks. Mirrors the
  // client allowlist (isValidShapeType).
  val DisallowedAnnotationTypes: Set[String] = Set("embed", "bookmark")

  val ImageAnnotationType: String = "image"

  // Cap on the serialized size of a single image annotation. An image annotation
  // only carries a relative URL plus geometry, so this is very generous; it
  // exists to stop a hostile client (bypassing the client by talking to the
  // mutation directly) from stuffing base64 or other large payloads into the
  // annotation and bloating Postgres. Non-image annotations are not capped here
  // (a complex draw can legitimately be large), which keeps the cap targeted.
  val MaxImageAnnotationSizeBytes: Int = 256 * 1024

  // An image annotation may only reference an upload served same-origin from the
  // current meeting: /bigbluebutton/fileUpload/{meetingId}/{uuid}.{ext}. This
  // blocks data: URIs (base64 bloat / bypassing the upload service) and external
  // origins (privacy / SSRF), and pins the meetingId so an annotation cannot
  // point at another meeting's uploads. The filename class mirrors the serving
  // contract (nginx only serves lowercase-hex uuid filenames) and disallows '.'
  // outside the extension, so path traversal cannot slip through.
  private def uploadedImageSrcPattern(meetingId: String): scala.util.matching.Regex =
    ("^/bigbluebutton/fileUpload/" + java.util.regex.Pattern.quote(meetingId) +
      "/[a-f0-9-]+\\.(png|jpe?g|gif|webp)$").r

  private def getImageSrc(annotationInfo: Map[String, _]): Option[String] = {
    annotationInfo.get("meta") match {
      case Some(meta: Map[String, _] @unchecked) =>
        meta.get("bbbImageSrc") match {
          case Some(src: String) => Some(src)
          case _                 => None
        }
      case _ => None
    }
  }

  private def isValidImageAnnotation(annotationInfo: Map[String, _], meetingId: String): Boolean = {
    // Measured in UTF-8 bytes (what actually reaches Postgres), not in UTF-16
    // chars, so a multi-byte payload cannot stretch the cap.
    val withinSizeLimit =
      annotationInfo.toString.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= MaxImageAnnotationSizeBytes
    val hasValidSrc = getImageSrc(annotationInfo).exists { src =>
      // Full match instead of findFirstIn: even anchored, java.util.regex lets
      // `$` match before a trailing newline, which a full match does not.
      uploadedImageSrcPattern(meetingId).matches(src)
    }
    withinSizeLimit && hasValidSrc
  }

  // Single ingestion gate for annotations (WhiteboardModel.addAnnotations is the
  // only writer of pres_annotation). embed/bookmark are always rejected; image is
  // rejected unless the meeting enabled image paste AND the shape references a
  // valid same-origin upload within the size cap; every other type is allowed.
  def isAllowedAnnotation(annotationInfo: Map[String, _], meetingId: String, imagePasteEnabled: Boolean): Boolean = {
    annotationInfo.get("type") match {
      case Some(annotationType: String) if DisallowedAnnotationTypes.contains(annotationType) => false
      case Some(ImageAnnotationType) => imagePasteEnabled && isValidImageAnnotation(annotationInfo, meetingId)
      case _                         => true
    }
  }
}

class WhiteboardModel extends SystemConfiguration {
  import WhiteboardModel.isAllowedAnnotation

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

  // Resolves one incoming annotation to the value to store: the merge into the
  // existing annotation when the user may edit it, or the annotation itself when
  // new. None when it is rejected (no permission, disallowed type, no type).
  private def resolveAnnotation(wb: Whiteboard, annotation: AnnotationVO, meetingId: String, userId: String, isPresenter: Boolean, isModerator: Boolean, imagePasteEnabled: Boolean): Option[AnnotationVO] = {
    wb.annotationsMap.get(annotation.id) match {
      case Some(oldAnnotation) =>
        val hasPermission = isPresenter || isModerator || oldAnnotation.userId == userId
        if (!hasPermission) {
          println(s"User $userId doesn't have permission to edit annotation ${annotation.id}, ignoring...")
          None
        } else {
          val mergedAnnotationInfo = deepMerge(oldAnnotation.annotationInfo, annotation.annotationInfo)

          // Apply cleaning if it's an arrow annotation
          val finalAnnotationInfo = if (oldAnnotation.annotationInfo.get("type").contains("arrow")) {
            cleanArrowAnnotationProps(mergedAnnotationInfo)
          } else {
            mergedAnnotationInfo
          }

          if (isAllowedAnnotation(finalAnnotationInfo, meetingId, imagePasteEnabled)) {
            Some(oldAnnotation.copy(annotationInfo = finalAnnotationInfo))
          } else {
            println(s"Rejected update of annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
            None
          }
        }
      case None if !annotation.annotationInfo.contains("type") =>
        println(s"New annotation [${annotation.id}] with no type, ignoring...")
        None
      case None =>
        if (isAllowedAnnotation(annotation.annotationInfo, meetingId, imagePasteEnabled)) {
          Some(annotation)
        } else {
          println(s"Rejected annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
          None
        }
    }
  }

  def addAnnotations(wbId: String, meetingId: String, userId: String, annotations: Array[AnnotationVO], isPresenter: Boolean, isModerator: Boolean, imagePasteEnabled: Boolean = false): Array[AnnotationVO] = {

    val wb = getWhiteboard(wbId)

    var annotationsAdded = Array[AnnotationVO]()
    var annotationsDiffAdded = Array[AnnotationVO]()
    var newAnnotationsMap = wb.annotationsMap

    for (annotation <- annotations) {
      resolveAnnotation(wb, annotation, meetingId, userId, isPresenter, isModerator, imagePasteEnabled).foreach { newAnnotation =>
        newAnnotationsMap += (annotation.id -> newAnnotation)
        annotationsAdded :+= newAnnotation
        annotationsDiffAdded :+= annotation
        println(s"Stored annotation on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
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
    PresAnnotationDAO.deleteAnnotations(meetingId, userId, annotationsIdsRemoved, annotationUpdatedAt)

    annotationsIdsRemoved
  }
}

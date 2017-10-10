package org.bigbluebutton.api2

import java.io.File
import java.util
import java.util.{ArrayList, HashSet, Iterator, List, Map, Set}

import scala.collection.JavaConversions._


class RecordingServiceGW2x {



  def getRecordings2x1(idList: ArrayList[String], states: ArrayList[String],
                      metadataFilters: Map[String, String],
                      allDirectories: Map[String, ArrayList[File]]): String = {

    val allDirs = allDirectories map (ad => ad._1 -> ad._2.toVector)
    getRecordings2xImp(idList.toVector, states.toVector, mapAsScalaMap(metadataFilters).toMap, allDirs.toMap)
  }

  private def getRecordings2xImp(idList: Vector[String], states: Vector[String],
                                 metafilters: collection.immutable.Map[String, String],
                                 allDirectories: collection.immutable.Map[String, Vector[File]]): String = {
    "FOO"
  }

  private def getRecordingsMeta(idList: Vector[String], allDirectories: collection.immutable.Map[String, Vector[File]]) = {
    var newIdList = Vector[String]()
    if (idList.isEmpty) {
      allDirectories.values.foreach { entry =>
        newIdList :+ getAllRecordingIds(entry)
      }
    }


  }

  private def getAllRecordingIds(recs: Vector[File]): collection.mutable.Set[String] = {
    var ids: Set[String] = collection.mutable.Set[String]()
    recs foreach (r => ids += r.getName)
    ids
  }
}

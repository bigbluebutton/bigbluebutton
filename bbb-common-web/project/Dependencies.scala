package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.9"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.8"

    // Libraries
    val akkaVersion = "2.6.17"
    val gson = "2.8.9"
    val jackson = "2.13.0"
    val freemarker = "2.3.31"
    val apacheHttp = "4.5.13"
    val apacheHttpAsync = "4.1.4"

    // Office and document conversion
    val apachePoi = "5.1.0"
    val nuProcess = "2.0.2"

    // Server
    val servlet = "4.0.1"

    // Apache Commons
    val lang = "3.12.0"
    val io = "2.11.0"
    val pool = "2.11.1"
    val text = "1.10.0"

    // BigBlueButton
    val bbbCommons = "0.0.22-SNAPSHOT"

    // Test
    val scalaTest = "3.2.11"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.13" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.13" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val jacksonXml = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-xml" % Versions.jackson
    val freemarker = "org.freemarker" % "freemarker" % Versions.freemarker
    val apacheHttp = "org.apache.httpcomponents" % "httpclient" % Versions.apacheHttp
    val apacheHttpAsync = "org.apache.httpcomponents" % "httpasyncclient" % Versions.apacheHttpAsync

    val poiXml = "org.apache.poi" % "poi-ooxml" % Versions.apachePoi
    val nuProcess = "com.zaxxer" % "nuprocess" % Versions.nuProcess

    val servletApi = "javax.servlet" % "javax.servlet-api" % Versions.servlet

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apacheIo = "commons-io" % "commons-io" % Versions.io
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool
    val apacheText = "org.apache.commons" % "commons-text" % Versions.text

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % Versions.bbbCommons
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "junit" % "junit" % Versions.junit % "test"
    val junitInteface = "com.novocode" % "junit-interface" % Versions.junitInterface % "test"
    val scalactic = "org.scalactic" % "scalactic_2.13" % Versions.scalactic % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.junitInteface,
    Test.scalactic)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.jacksonXml,
    Compile.freemarker,
    Compile.apacheHttp,
    Compile.apacheHttpAsync,
    Compile.poiXml,
    Compile.nuProcess,
    Compile.servletApi,
    Compile.apacheLang,
    Compile.apacheIo,
    Compile.apachePool2,
    Compile.apacheText,
    Compile.bbbCommons) ++ testing
}

package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.4"
    val scalaXml = "2.0.0-M3"
    val junit = "5.7.0"
    val junitInterface = "0.11"
    val scalactic = "3.2.3"

    // Libraries
    val akkaVersion = "2.6.10"
    val gson = "2.8.6"
    val jackson = "2.12.1"
    val freeMarker = "2.3.30"
    val apacheHttp = "4.5.13"
    val apacheHttpAsync = "4.1.4"

    // Office and document conversion
    val jodConverter = "4.2.2"
    val apachePoi = "4.1.2"
    val nuProcess = "1.2.4"
    val libreOffice = "7.0.4"

    // Server
    val servlet = "3.1.0"

    // Apache Commons
    val lang = "3.11"
    val io = "2.8.0"
    val pool = "2.9.0"

    // BigBlueButton
    val bbbCommons = "0.0.21-SNAPSHOT"

    // Test
    val scalaTest = "3.2.3"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala
    val scalaXml = "org.scala-lang.modules" %% "scala-xml" % Versions.scalaXml

    val akkaActor = "com.typesafe.akka" %% "akka-actor" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" %% "akka-slf4j" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val jacksonXml = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-xml" % Versions.jackson
    val freemarker = "org.freemarker" % "freemarker" % Versions.freeMarker
    val apacheHttp = "org.apache.httpcomponents" % "httpclient" % Versions.apacheHttp
    val apacheHttpAsync = "org.apache.httpcomponents" % "httpasyncclient" % Versions.apacheHttpAsync

    val poiXml = "org.apache.poi" % "poi-ooxml" % Versions.apachePoi
    val nuProcess = "com.zaxxer" % "nuprocess" % Versions.nuProcess

    val servletApi = "javax.servlet" % "javax.servlet-api" % Versions.servlet

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apacheIo = "commons-io" % "commons-io" % Versions.io
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool

    val bbbCommons = "org.bigbluebutton" %% "bbb-common-message" % Versions.bbbCommons
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "org.junit.jupiter" % "junit-jupiter-api" % Versions.junit % "test"
    val scalactic = "org.scalactic" %% "scalactic" % Versions.scalactic % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.scalactic)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.scalaXml,
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
    Compile.bbbCommons) ++ testing
}

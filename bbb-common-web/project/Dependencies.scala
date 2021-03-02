package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.8"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.3"

    // Libraries
    val akkaVersion = "2.5.19"
    val gson = "2.8.5"
    val jackson = "2.9.7"
    val freemarker = "2.3.28"
    val apacheHttp = "4.5.6"
    val apacheHttpAsync = "4.1.4"

    // Office and document conversion
    val jodConverter = "4.3.0"
    val apachePoi = "4.1.2"
    val nuProcess = "1.2.4"
    val libreOffice = "5.4.2"

    // Server
    val servlet = "3.1.0"
    
    // Apache Commons
    val lang = "3.9"
    val io = "2.6"
    val pool = "2.8.0"

    // BigBlueButton
    val bbbCommons = "0.0.20-SNAPSHOT"

    // Test
    val scalaTest = "3.0.5"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.12" % Versions.akkaVersion % "runtime"

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val jacksonXml = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-xml" % Versions.jackson
    val freemarker = "org.freemarker" % "freemarker" % Versions.freemarker
    val apacheHttp = "org.apache.httpcomponents" % "httpclient" % Versions.apacheHttp
    val apacheHttpAsync = "org.apache.httpcomponents" % "httpasyncclient" % Versions.apacheHttpAsync

    val poiXml = "org.apache.poi" % "poi-ooxml" % Versions.apachePoi
    val jodConverter = "org.jodconverter" % "jodconverter-local" % Versions.jodConverter
    val nuProcess = "com.zaxxer" % "nuprocess" % Versions.nuProcess

    val officeUnoil = "org.libreoffice" % "unoil" % Versions.libreOffice
    val officeRidl = "org.libreoffice" % "ridl" % Versions.libreOffice
    val officeJuh = "org.libreoffice" % "juh" % Versions.libreOffice
    val officejurt = "org.libreoffice" % "jurt" % Versions.libreOffice

    val servletApi = "javax.servlet" % "javax.servlet-api" % Versions.servlet
    
    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apacheIo = "commons-io" % "commons-io" % Versions.io
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.12" % Versions.bbbCommons excludeAll (
      ExclusionRule(organization = "org.red5"))
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "junit" % "junit" % Versions.junit % "test"
    val junitInteface = "com.novocode" % "junit-interface" % Versions.junitInterface % "test"
    val scalactic = "org.scalactic" % "scalactic_2.12" % Versions.scalactic % "test"
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
    Compile.jodConverter,
    Compile.nuProcess,
    Compile.servletApi,
    Compile.apacheLang,
    Compile.apacheIo,
    Compile.apachePool2,
    Compile.bbbCommons) ++ testing
}

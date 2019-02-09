package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.8"
    val junitInterface = "0.11"
    val scalactic = "3.0.3"

    // Libraries
    val akkaVersion = "2.5.19"
    val gson = "2.8.5"
    val jackson = "2.9.7"
    val logback = "1.2.3"
    val springVersion = "4.3.12.RELEASE"
    val red5 = "1.0.10-M9"
    val servlet = "2.5"
    val ffmpeg = "4.0.2-1.4.3"
    val openCv = "1.4.3"

    // Apache Commons
    val lang = "3.7"
    val codec = "1.11"
    val pool2 = "2.6.0"

    // Redis
    val lettuce = "5.1.3.RELEASE"

    // BigBlueButton
    val bbbCommons = "0.0.20-SNAPSHOT"

    // Test
    val scalaTest = "3.0.5"
    val akkaTestKit = "2.5.18"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaReflect = "org.scala-lang" % "scala-reflect" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.12" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback % "runtime"
    val red5Server = "org.red5" % "red5-server" % Versions.red5
    val javaServlet = "javax.servlet" % "servlet-api" % Versions.servlet
    val ffmpeg = "org.bytedeco.javacpp-presets" % "ffmpeg" % Versions.ffmpeg
    val openCv = "org.bytedeco" % "javacv" % Versions.openCv

    val springWeb = "org.springframework" % "spring-web" % Versions.springVersion
    val springBeans = "org.springframework" % "spring-beans" % Versions.springVersion
    val springContext = "org.springframework" % "spring-context" % Versions.springVersion
    val springCore = "org.springframework" % "spring-core" % Versions.springVersion
    val springWebmvc = "org.springframework" % "spring-webmvc" % Versions.springVersion
    val springAop = "org.springframework" % "spring-aop" % Versions.springVersion

    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec
    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool2

    val lettuceCore = "io.lettuce" % "lettuce-core" % Versions.lettuce

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.12" % Versions.bbbCommons
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val scalactic = "org.scalactic" % "scalactic_2.12" % Versions.scalactic % "test"
    val akkaTestKit = "com.typesafe.akka" %% "akka-testkit" % Versions.akkaTestKit % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.scalactic,
    Test.akkaTestKit)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaReflect,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.red5Server,
    Compile.javaServlet,
    Compile.ffmpeg,
    Compile.openCv,
    Compile.logback,
    Compile.springWeb,
    Compile.springBeans,
    Compile.springContext,
    Compile.springWebmvc,
    Compile.springAop,
    Compile.commonsCodec,
    Compile.apacheLang,
    Compile.apachePool2,
    Compile.lettuceCore,
    Compile.bbbCommons) ++ testing
}

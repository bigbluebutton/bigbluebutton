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
    val pekkoVersion = "1.0.1"
    val gson = "2.8.9"
    val jackson = "2.22.1"
    val sl4j = "1.7.32"
    val pool = "2.11.1"
    val codec = "1.15"
    val jacksonDataFormat = "2.22.1"

    // Redis
    val lettuce = "6.1.5.RELEASE"

    // Netty. Explicitly pinned to lift the netty 4.1.68.Final that
    // lettuce-core 6.1.5.RELEASE pulls in. These pins can be
    // dropped once lettuce-core is upgraded to a release carrying newer netty.
    val netty = "4.1.137.Final"

    // Test
    val scalaTest = "3.0.8"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val pekkoActor = "org.apache.pekko" %% "pekko-actor" % Versions.pekkoVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val sl4jApi = "org.slf4j" % "slf4j-api" % Versions.sl4j
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec

    val lettuceCore = "io.lettuce" % "lettuce-core" % Versions.lettuce

    // See Versions.netty above: direct deps so they propagate through our POM
    // and win conflict resolution over lettuce-core's older transitive netty.
    val nettyHandler = "io.netty" % "netty-handler" % Versions.netty
    val nettyCodec = "io.netty" % "netty-codec" % Versions.netty
    val jacksonDataFormat = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-yaml" % Versions.jacksonDataFormat
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
    Compile.pekkoActor,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.sl4jApi,
    Compile.commonsCodec,
    Compile.apachePool2,
    Compile.lettuceCore,
    Compile.nettyHandler,
    Compile.nettyCodec,
    Compile.jacksonDataFormat) ++ testing
}

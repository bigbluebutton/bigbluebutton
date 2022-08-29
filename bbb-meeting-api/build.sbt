import Dependencies._
import sbt.Keys.libraryDependencies

enablePlugins(JavaAppPackaging)

lazy val root = (project in file(".")).
  settings(
    inThisBuild(List(
      organization := "org.bigbluebutton",
      scalaVersion := "2.13.8",
      version      := "0.1.0-SNAPSHOT"
    )),
    //resolvers += Resolver.url("bintray-sbt-plugins", url("https://dl.bintray.com/sbt/sbt-plugin-releases/"))(Resolver.ivyStylePatterns),
    //resolvers += Resolver.sbtPluginRepo("releases"),
    //resolvers += "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
    name := "bbb-meeting-api",
    libraryDependencies ++= {
      val akkaHttpVersion = "10.2.9"
      val configVersion = "1.4.2"
      val circeVersion = "0.14.1"
      val akkaVersion = "2.6.19"
      Seq(
        "com.typesafe" % "config" % configVersion,
        "com.typesafe.akka" %% "akka-actor" % akkaVersion,
        "com.typesafe.akka" %% "akka-stream" % akkaVersion,
        "com.typesafe.akka" %% "akka-remote" % akkaVersion,
        "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
        "com.softwaremill.akka-http-session" %% "core" % "0.7.0",
        "com.softwaremill.akka-http-session" %% "jwt" % "0.7.0",
        "org.scala-lang.modules" %% "scala-xml" % "2.1.0",
        "com.typesafe.akka" %% "akka-testkit" % akkaVersion  % Test,
        "com.typesafe.akka" %% "akka-http-testkit" % "10.2.9",
        scalaTest % Test,
        bbbCommons,
//        akkaHttpSessionCore,
//        akkaHttpSessionJwt,
        apacheLang
      )
    }
  )

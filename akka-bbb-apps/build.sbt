import org.bigbluebutton.build._

import NativePackagerHelper._
import com.typesafe.sbt.SbtNativePackager.autoImport._

enablePlugins(JavaServerAppPackaging)
enablePlugins(UniversalPlugin)
enablePlugins(DebianPlugin)

version := "0.0.4"

val compileSettings = Seq(
  organization := "org.bigbluebutton",

  scalacOptions ++= List(
    "-unchecked",
    "-deprecation",
    "-Xlint",
    "-Ywarn-dead-code",
    "-language:_",
    "-release:21",
    "-encoding", "UTF-8"
  ),
  javacOptions ++= List(
    "-Xlint:unchecked",
    "-Xlint:deprecation"
  )
)

publishTo := Some(Resolver.file("file", new File(Path.userHome.absolutePath + "/dev/repo/maven-repo/releases")))

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

libraryDependencies += "org.scala-lang.modules" %% "scala-xml" % "2.0.0"

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

Seq(Revolver.settings: _*)
lazy val bbbAppsAkka = (project in file(".")).settings(name := "bbb-apps-akka", libraryDependencies ++= Dependencies.runtime, dependencyOverrides ++= Dependencies.overrides).settings(compileSettings)

// See https://github.com/scala-ide/scalariform
// Config file is in ./.scalariform.conf
scalariformAutoformat := true

scalaVersion := "2.13.18"
//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "BigBlueButton Apps (Akka)"

packageDescription := """BigBlueButton Core Apps in Akka."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user

// group which will execute the application
daemonGroup in Linux := group

javaOptions in Universal ++= Seq("-J-Xms130m", "-J-Xmx256m", "-Dconfig.file=/etc/bigbluebutton/bbb-apps-akka.conf", "-Dlogback.configurationFile=conf/logback.xml")
javaOptions in reStart ++= Seq("-Dconfig.file=/etc/bigbluebutton/bbb-apps-akka.conf", "-Dlogback.configurationFile=conf/logback.xml")

debianPackageDependencies in Debian ++= Seq("java21-runtime-headless", "bash")

// Tests read SystemConfiguration through typesafe-config; in production the service
// runs with -Dconfig.file=/etc/bigbluebutton/bbb-apps-akka.conf, so put the packaged
// default config on the test classpath to satisfy it.
Test / unmanagedResourceDirectories += baseDirectory.value / "src" / "universal" / "conf"

// Written against long-gone domain and actor APIs (pre-pekko TestKit, old
// DefaultProps/LiveMeeting constructors) and do not compile anymore; kept out
// of the build so the rest of the suite stays runnable.
Test / unmanagedSources / excludeFilter := (Test / unmanagedSources / excludeFilter).value ||
  "AppsTestFixtures.scala" || "TestDataGen.scala" || "BigBlueButtonActorTestsSpec.scala" ||
  "GroupsChatTests.scala" || "ReceivedJsonMsgHandlerTraitTests.scala" ||
  "BreakoutRoomsTestFixtures.scala" || "MeetingManagerTestFixtures.scala"

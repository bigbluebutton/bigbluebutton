import org.bigbluebutton.build._

import NativePackagerHelper._
import com.typesafe.sbt.SbtNativePackager.autoImport._

enablePlugins(JavaServerAppPackaging)
enablePlugins(UniversalPlugin)
enablePlugins(SystemdPlugin)
enablePlugins(DebianPlugin)

name := "bbb-transcode-akka"

version := "0.0.3"

val compileSettings = Seq(
  organization := "org.bigbluebutton",

  scalacOptions ++= List(
    "-unchecked",
    "-deprecation",
    "-Xlint",
    "-Ywarn-dead-code",
    "-language:_",
    "-target:jvm-1.8",
    "-encoding", "UTF-8"
  ),
  javacOptions ++= List(
    "-Xlint:unchecked",
    "-Xlint:deprecation"
  )
)

resolvers += Resolver.sonatypeRepo("releases")

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

Seq(Revolver.settings: _*)
lazy val bbbAppsAkka = (project in file(".")).settings(name := "bbb-apps-akka", libraryDependencies ++= Dependencies.runtime).settings(compileSettings)

// See https://github.com/scala-ide/scalariform
// Config file is in ./.scalariform.conf
scalariformAutoformat := true

//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.Boot")

maintainer in Linux := "Mario Gasparoni <mariogasparoni@gmail.com>"

packageSummary in Linux := "BigBlueButton Transcoder"

packageDescription := """BigBlueButton FFmpeg transcoder."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user

// group which will execute the application
daemonGroup in Linux := group

javaOptions in Universal ++= Seq("-J-Xms130m", "-J-Xmx256m", "-Dconfig.file=conf/application.conf", "-Dlogback.configurationFile=conf/logback.xml")

debianPackageDependencies in Debian ++= Seq("java7-runtime-headless", "bash")

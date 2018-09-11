enablePlugins(JavaServerAppPackaging)

name := "bbb-fsesl-akka"

organization := "org.bigbluebutton"

version := "0.0.1"

scalaVersion  := "2.12.2"

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.8",
  "-encoding", "UTF-8"
)

resolvers ++= Seq(
  "spray repo" at "http://repo.spray.io/",
  "rediscala" at "http://dl.bintray.com/etaty/maven",
  "blindside-repos" at "http://blindside.googlecode.com/svn/repository/"
)

resolvers += Resolver.sonatypeRepo("releases")

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

val akkaVersion  = "2.5.1"
val scalaTestV  = "2.2.6"


libraryDependencies ++= {
  Seq(
    "ch.qos.logback"    	      %  "logback-classic"   % "1.0.3",
    "junit" 				      %  "junit"             % "4.11",
    "commons-codec"             %  "commons-codec"     % "1.10",
    "joda-time"                 %  "joda-time"         % "2.3",
    "org.apache.commons"        %  "commons-lang3"     % "3.2"

  )}

libraryDependencies += "org.bigbluebutton" % "bbb-common-message_2.12" % "0.0.19-SNAPSHOT"

libraryDependencies += "org.bigbluebutton"         %  "bbb-fsesl-client"   % "0.0.6"

// https://mvnrepository.com/artifact/org.scala-lang/scala-library
libraryDependencies += "org.scala-lang" % "scala-library" % "2.12.2"
// https://mvnrepository.com/artifact/org.scala-lang/scala-compiler
libraryDependencies += "org.scala-lang" % "scala-compiler" % "2.12.2"

// https://mvnrepository.com/artifact/com.typesafe.akka/akka-actor_2.12
libraryDependencies += "com.typesafe.akka" % "akka-actor_2.12" % akkaVersion

// https://mvnrepository.com/artifact/com.typesafe.akka/akka-slf4j_2.12
libraryDependencies += "com.typesafe.akka" % "akka-slf4j_2.12" % akkaVersion

// https://mvnrepository.com/artifact/com.github.etaty/rediscala_2.12
libraryDependencies += "com.github.etaty" % "rediscala_2.12" % "1.8.0"

// For generating test reports
libraryDependencies += "org.pegdown" % "pegdown" % "1.6.0" % "test"
// https://mvnrepository.com/artifact/com.typesafe.akka/akka-testkit_2.12
libraryDependencies += "com.typesafe.akka" % "akka-testkit_2.12" % "2.5.1" % "test"

// https://mvnrepository.com/artifact/org.scalactic/scalactic_2.12
libraryDependencies += "org.scalactic" % "scalactic_2.12" % "3.0.3" % "test"

// https://mvnrepository.com/artifact/org.scalatest/scalatest_2.12
libraryDependencies += "org.scalatest" % "scalatest_2.12" % "3.0.3" % "test"

libraryDependencies += "org.mockito" % "mockito-core" % "2.7.22" % "test"

seq(Revolver.settings: _*)

scalariformSettings

//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "BigBlueButton FS-ESL (Akka)"

packageDescription := """BigBlueButton FreeSWITCH ESL in Akka."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user        

// group which will execute the application
daemonGroup in Linux := group 

mappings in Universal <+= (packageBin in Compile, sourceDirectory ) map { (_, src) =>
    // Move the application.conf so the user can override settings here
    val appConf = src / "main" / "resources" / "application.conf"
    appConf -> "conf/application.conf"
}

mappings in Universal <+= (packageBin in Compile, sourceDirectory ) map { (_, src) =>
    // Move logback.xml so the user can override settings here    
    val logConf = src / "main" / "resources" / "logback.xml"
    logConf -> "conf/logback.xml"
}

debianPackageDependencies in Debian ++= Seq("java7-runtime-headless", "bash")

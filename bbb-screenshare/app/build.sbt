
//enablePlugins(JavaServerAppPackaging)
enablePlugins(JettyPlugin)

name := "bbb-screenshare-akka"

organization := "org.bigbluebutton"

version := "0.0.2"

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
    val springVersion = "4.3.12.RELEASE"
  Seq(
    "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
    "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
    "com.typesafe.akka"        %%  "akka-slf4j"        % akkaVersion,
    "com.typesafe"              %  "config"            % "1.3.0",
    "ch.qos.logback"            %  "logback-classic"   % "1.2.3" % "runtime",
    "commons-codec"             %  "commons-codec"     % "1.11",
    "redis.clients"             %  "jedis"             % "2.7.2",
    "org.apache.commons"        %  "commons-pool2"     % "2.3",
    "org.red5"                  %  "red5-server"       % "1.0.10-M5",
    "com.google.code.gson"      %  "gson"              % "2.5",
    "org.springframework"       %  "spring-web"        % springVersion,
    "org.springframework"       %  "spring-beans"      % springVersion,
    "org.springframework"       %  "spring-context"    % springVersion,
    "org.springframework"       %  "spring-core"       % springVersion,
    "org.springframework"       %  "spring-webmvc"     % springVersion,
    "org.springframework"       %  "spring-aop"        % springVersion,
    "javax.servlet"             %  "servlet-api"       % "2.5"


  )}

// https://mvnrepository.com/artifact/org.scala-lang/scala-library
libraryDependencies += "org.scala-lang" % "scala-library" % "2.12.2"
libraryDependencies += "org.scala-lang" % "scala-reflect" % "2.12.2"

libraryDependencies += "org.bigbluebutton" % "bbb-common-message_2.12" % "0.0.19-SNAPSHOT"
// https://mvnrepository.com/artifact/com.github.etaty/rediscala_2.12
libraryDependencies += "com.github.etaty" % "rediscala_2.12" % "1.8.0"
// https://mvnrepository.com/artifact/com.fasterxml.jackson.module/jackson-module-scala_2.12
libraryDependencies += "com.fasterxml.jackson.module" % "jackson-module-scala_2.12" % "2.8.8"

//seq(Revolver.settings: _*)
//
//scalariformSettings


//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
//mainClass := Some("org.bigbluebutton.deskshare.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "BigBlueButton Apps (Akka)"

packageDescription := """BigBlueButton Screenshare in Akka."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user

// group which will execute the application
daemonGroup in Linux := group

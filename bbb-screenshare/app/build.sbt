//enablePlugins(JavaServerAppPackaging)
enablePlugins(JettyPlugin)

name := "bbb-screenshare-akka"

organization := "org.bigbluebutton"

version := "0.0.1"

scalaVersion  := "2.11.7"

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

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

libraryDependencies ++= {
    val akkaVersion  = "2.4.2"
    val springVersion = "4.3.3.RELEASE"
  Seq(
    "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
    "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
    "com.typesafe.akka"        %%  "akka-slf4j"        % akkaVersion,
    "com.typesafe"              %  "config"            % "1.3.0",
    "ch.qos.logback"            %  "logback-classic"   % "1.1.6" % "runtime",
    //    "org.pegdown"               %  "pegdown"           % "1.4.0",
    //    "junit"                     %  "junit"             % "4.11",
    //    "com.etaty.rediscala"      %%  "rediscala"         % "1.4.0",
    "commons-codec"             %  "commons-codec"     % "1.10",
        "redis.clients"             %  "jedis"             % "2.7.2",
    //    "org.apache.commons"        %  "commons-lang3"     % "3.2",
    "org.apache.commons"        %  "commons-pool2"     % "2.3",
    "org.red5"                  %  "red5-server"       % "1.0.8-M13",
    "com.google.code.gson"      %  "gson"              % "2.5",
    "org.springframework"       %  "spring-web"        % springVersion,
    "org.springframework"       %  "spring-beans"      % springVersion,
    "org.springframework"       %  "spring-context"    % springVersion,
    "org.springframework"       %  "spring-core"       % springVersion,
    "org.springframework"       %  "spring-webmvc"     % springVersion,
    "org.springframework"       %  "spring-aop"        % springVersion,
    "org.bigbluebutton"         %  "bbb-common-message"% "0.0.18-SNAPSHOT",
    "javax.servlet"             %  "servlet-api"       % "2.5"


  )}

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

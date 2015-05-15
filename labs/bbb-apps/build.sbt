
name := "apps"

organization := "org.bigbluebutton"

version := "0.1-SNAPSHOT"

scalaVersion  := "2.10.2"

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.6",
  "-encoding", "UTF-8"
)

resolvers ++= Seq(
  "spray repo" at "http://repo.spray.io/",
  "rediscala" at "https://github.com/etaty/rediscala-mvn/raw/master/releases/"
)

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

libraryDependencies ++= {
  val akkaVersion  = "2.2.3"
  val sprayVersion = "1.2-RC3"
  Seq(
	  "io.spray"            %   "spray-can"       % sprayVersion,
	  "io.spray"            %   "spray-routing"   % sprayVersion,
	  "io.spray"            %   "spray-testkit"   % sprayVersion % "test",
	  "io.spray"            %%  "spray-json"      % "1.2.5",
    "com.github.sstone"   %%  "amqp-client"     % "1.3-ML1", 
	  "com.typesafe.akka"   %%  "akka-camel"      % akkaVersion,
	  "com.typesafe.akka"   %%  "akka-actor"      % akkaVersion,
	  "com.typesafe.akka"   %%  "akka-testkit"    % akkaVersion % "test",
	  "org.specs2"          %%  "specs2"          % "2.2.3" % "test",
	  "org.scalatest"       %   "scalatest_2.10"  % "2.0" % "test",
	  "com.typesafe.akka" 	%%  "akka-slf4j"      % akkaVersion,
	  "ch.qos.logback"    	%   "logback-classic" % "1.0.3",
	  "org.pegdown" 		    % 	"pegdown" 			  % "1.4.0",
	  "junit" 				      %   "junit"           % "4.11",
	  "com.etaty.rediscala" %% "rediscala"        % "1.3",
	  "commons-codec"       %   "commons-codec"   % "1.8",
	  "joda-time"           %   "joda-time"       % "2.3",
	  "net.virtual-void" %%  "json-lenses" % "0.5.4"
	)}


seq(Revolver.settings: _*)


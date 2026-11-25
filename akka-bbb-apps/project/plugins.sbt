addSbtPlugin("io.spray" % "sbt-revolver" % "0.9.1")

addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "5.2.4")

addSbtPlugin("org.scalariform" % "sbt-scalariform" % "1.8.2")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.11.7")

// sbt-native-packager 1.11.x pulls scala-xml 2.x while sbt-scalariform pulls 1.x;
// treat scala-xml as always-compatible so the meta-build doesn't fail on eviction.
libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % "always"

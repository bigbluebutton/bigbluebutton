import scala.collection.mutable
import scala.xml.{PCData, XML}

val currentDirectory = new java.io.File(".").getCanonicalPath

//val xml = XML.loadFile("../src/test/resources/sample-metadata.xml")

val xml =
    <recording>
      <id>b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984</id>
      <state>published</state>
      <published>true</published>
      <start_time>1504122319984</start_time>
      <end_time>1504122655395</end_time>
      <participants>4</participants>
      <meeting id="b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984" externalId="5bd0e35013bc9761d06f01d4bfd9b4ae1c8df289" name="Prueba 2" breakout="false"/>
      <meta>
        <isBreakout>false</isBreakout>
        <meeting-name>Prueba 2</meeting-name>
        <gl-webhooks-callback-url>https://demo.bigbluebutton.org/b/rooms/vi-249c619c/Prueba%202/callback</gl-webhooks-callback-url>
        <room-id>vi-249c619c</room-id>
        <meetingName>Prueba 2</meetingName>
        <gl-token>vi-249c619c-Prueba 2</gl-token>
        <meetingId>5bd0e35013bc9761d06f01d4bfd9b4ae1c8df289</meetingId>
        <gl-listed>false</gl-listed>
      </meta>
      <playback>
        <format>presentation</format>
        <link>https://demo.bigbluebutton.org/playback/presentation/2.0/playback.html?meetingId=b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984</link>
        <processing_time>10915</processing_time>
        <duration>105862</duration>
        <extensions>
          <preview>
            <images>
              <image width="176" height="136" alt="Welcome to">https://demo.bigbluebutton.org/presentation/b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1504122320002/thumbnails/thumb-1.png</image>
              <image width="176" height="136" alt="(this slide left blank for use as a whiteboard)">https://demo.bigbluebutton.org/presentation/b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1504122320002/thumbnails/thumb-2.png</image>
              <image width="176" height="136" alt="(this slide left blank for use as a whiteboard)">https://demo.bigbluebutton.org/presentation/b27af2f930d418879550e09c7548d1cdd0be25cf-1504122319984/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1504122320002/thumbnails/thumb-3.png</image>
            </images>
          </preview>
        </extensions>
        <size>531235</size>
      </playback>
      <raw_size>493084</raw_size>
    </recording>


val asdf = xml \ "meta2"
asdf.isEmpty

val id = (xml \\ "id").text
val state = (xml \\ "state").text
val published = (xml \\ "published").text.toBoolean
val format = (xml \\ "playback" \\ "format").text
val meta = (xml \ "meta")(0)

val foo = meta.nonEmptyChildren
println(foo.length)

val foo1 = foo filter (p => p.label != "#PCDATA")

val baz = foo1 map { f =>
    f.label -> f.text
}  toMap

baz.size

val playback = xml \ "playback"

val extensions = playback \ "extensions"
val preview = extensions \ "preview"



val imagesNodes = preview \ "images"

val images = (imagesNodes \ "image") .map { n =>
  val w = (n \ "@width").text
  val h = (n \ "@height").text
  val alt = (n \ "@alt").text
  val link = (n.text)
  new MetaImage(w, h, alt, link)
}

val x = new scala.xml.NodeBuffer
images foreach { im =>
  x += <image width={im.width} height={im.height} alt={im.alt}>{im.link}</image>
}

val imageElem = <images>{x}</images>
println(imageElem)



case class MetaImage(width: String, height: String, alt: String, link: String)

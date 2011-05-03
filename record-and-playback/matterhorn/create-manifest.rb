#!/usr/bin/ruby

require 'builder'
require 'streamio-ffmpeg'
require 'mime/types'
require 'digest/md5'

vpresenter = FFMPEG::Movie.new("videopresenter.flv")
apresenter = FFMPEG::Movie.new("audiopresenter.mp3")
vpresentation = FFMPEG::Movie.new("videopresentation.wmv")

start = "timestamp"
duration = "duration"

xml = Builder::XmlMarkup.new( :indent => 2 )

result = xml.instruct! :xml, :version => "1.0"

timestamp = ( Time::now ).utc.strftime("%Y-%m-%dT%H:%M:%S") 
xml.tag!("ns2:mediapackage", "duration" => vpresenter.duration.round.to_s.split(".")[0] + "000"   , "start" => timestamp, "xmlns:ns2" => "http://mediapackage.opencastproject.org" ){
 
	xml.media{
		xml.track("id" => "track-1", "type" => "presenter/source"){
			xml.mimetype(MIME::Types.type_for(vpresenter.path).first.content_type)
			xml.tags
			xml.url(vpresenter.path)
			xml.checksum(Digest::MD5.hexdigest(File.read(vpresenter.path)),"type" => "md5")
			xml.duration(vpresenter.duration.round.to_s.split(".")[0] + "000")
			xml.video("id" => "video1"){
				xml.encoder("type" => vpresenter.video_codec)
				xml.bitrate(vpresenter.bitrate.to_s + "000")
				xml.framerate(vpresenter.frame_rate)
				xml.resolution(vpresenter.width.to_s + "x" + vpresenter.height.to_s)
			}
		}
	

			xml.track("id" => "track-2", "type" => "presentation/source"){
			xml.mimetype(MIME::Types.type_for(vpresentation.path).first.content_type)			
			xml.tags
			xml.url(vpresentation.path)
			xml.checksum(Digest::MD5.hexdigest(File.read(vpresentation.path)),"type" => "md5")
			xml.duration(vpresentation.duration.round.to_s.split(".")[0] + "000")
			xml.video("id" => "video2"){
				xml.encoder("type" => vpresentation.video_codec)
				xml.bitrate(vpresentation.bitrate.to_s + "000")
				xml.framerate(vpresentation.frame_rate)
				xml.resolution(vpresentation.width.to_s + "x" + vpresentation.height.to_s)
			}
		}
	


		xml.track("id" => "track-3", "type" => "presenter/source"){
			xml.mimetype(MIME::Types.type_for(apresenter.path).first.content_type)
			xml.tags
			xml.url(apresenter.path)
			xml.checksum(Digest::MD5.hexdigest(File.read(apresenter.path)),"type" => "md5")
			xml.duration(apresenter.duration.round.to_s.split(".")[0] + "000")
			xml.audio("id" => "audio1"){
				xml.encoder("type" => apresenter.audio_codec)
				xml.channels(apresenter.audio_channels)
#				xml.bitdeph(apresenter.audio_sample_size)
				xml.bitrate(apresenter.bitrate.to_s + "000")
			}
		}
	}
	xml.metadata{
		xml.catalog("id" => "catalog-1", "type" => "dublincore/episode"){
			xml.mimetype("text/xml")
			xml.url("dublincore.xml")
		}
	}

}


puts result

aFile = File.new("manifest.xml","w+")
aFile.write(result)
aFile.close



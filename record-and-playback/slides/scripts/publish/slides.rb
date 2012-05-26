# Set encoding to utf-8
# encoding: UTF-8

require '../../core/lib/recordandplayback'
require 'rubygems'
require 'trollop'
require 'yaml'
require 'builder'
require 'fastimage' # require fastimage to get the image size of the slides (gem install fastimage)

# used to convert the colours to hex
class String
  def convert_base(from, to)
    self.to_i(from).to_s(to)
  end
end

vbox_width = 800
vbox_height = 600
magic_mystery_number = 2
shapesold_svg_filename = 'shapes_old.svg'
shapes_svg_filename = 'shapes.svg'
panzooms_xml_filename = 'panzooms.xml'

originX = "NaN"
originY = "NaN"
originalOriginX = "NaN"
originalOriginY = "NaN"

rectangle_count = 0
line_count = 0
ellipse_count = 0
global_slide_count = 1
global_page_count = 0
canvas_number = 0
prev_clear_time = 0
pageCleared = "0"
page_number = 0
prev_canvas_time_start = 0 # initial start is 0 seconds. (beginning of video)

prev_time = "NaN"

ss = {}
clearPageTimes = {}
slides_compiled = {}

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

meeting_id = opts[:meeting_id]
puts meeting_id
match = /(.*)-(.*)/.match meeting_id
meeting_id = match[1]
playback = match[2]

puts meeting_id
puts playback
if (playback == "slides")
	logger = Logger.new("/var/log/bigbluebutton/slides/publish-#{meeting_id}.log", 'daily' )
	BigBlueButton.logger = logger
    BigBlueButton.logger.info("Publishing #{meeting_id}")
	# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
	bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
	simple_props = YAML::load(File.open('slides.yml'))

	recording_dir = bbb_props['recording_dir']
	process_dir = "#{recording_dir}/process/slides/#{meeting_id}"
	publish_dir = simple_props['publish_dir']
	playback_host = simple_props['playback_host']

	target_dir = "#{recording_dir}/publish/slides/#{meeting_id}"
	if not FileTest.directory?(target_dir)
		FileUtils.mkdir_p target_dir

		package_dir = "#{target_dir}/#{meeting_id}"
		FileUtils.mkdir_p package_dir

		audio_dir = "#{package_dir}/audio"
		FileUtils.mkdir_p audio_dir

		FileUtils.cp("#{process_dir}/audio.ogg", audio_dir)
		FileUtils.cp("#{process_dir}/temp/#{meeting_id}/audio/recording.wav", audio_dir)
		FileUtils.cp("#{process_dir}/events.xml", package_dir)
		FileUtils.cp_r("#{process_dir}/presentation", package_dir)

		BigBlueButton.logger.info("Creating metadata.xml")
		# Create metadata.xml
		b = Builder::XmlMarkup.new(:indent => 2)

		metaxml = b.recording {
			b.id(meeting_id)
			b.state("available")
			b.published(true)
			# Date Format for recordings: Thu Mar 04 14:05:56 UTC 2010
			b.start_time(BigBlueButton::Events.first_event_timestamp("#{process_dir}/events.xml"))
			b.end_time(BigBlueButton::Events.last_event_timestamp("#{process_dir}/events.xml"))
			b.playback {
				b.format("slides")
				b.link("http://#{playback_host}/playback/slides/playback.html?meetingId=#{meeting_id}")
			}
			b.meta {
				BigBlueButton::Events.get_meeting_metadata("#{process_dir}/events.xml").each { |k,v| b.method_missing(k,v) }
			}
		}
		metadata_xml = File.new("#{package_dir}/metadata.xml","w")
		metadata_xml.write(metaxml)
		metadata_xml.close
		BigBlueButton.logger.info("Generating xml for slides and chat")
		#Create slides.xml
		#presentation_url = "http://" + playback_host + "/slides/" + meeting_id + "/presentation"
		presentation_url = "/slides/" + meeting_id + "/presentation"
		@doc = Nokogiri::XML(File.open("#{process_dir}/events.xml"))

		meeting_start = @doc.xpath("//event[@eventname='ParticipantJoinEvent']")[0]['timestamp']
		meeting_end = @doc.xpath("//event[@eventname='EndAndKickAllEvent']").last()['timestamp']

		first_presentation_start_node = @doc.xpath("//event[@eventname='SharePresentationEvent']")
		first_presentation_start = meeting_end
		if not first_presentation_start_node.empty?
			first_presentation_start = first_presentation_start_node[0]['timestamp']
		end
		first_slide_start = ((first_presentation_start.to_f - meeting_start.to_f) / 1000).round(1)

		slides_events = @doc.xpath("//event[@eventname='GotoSlideEvent' or @eventname='SharePresentationEvent']")
		chat_events = @doc.xpath("//event[@eventname='PublicChatEvent']")
		shape_events = @doc.xpath("//event[@eventname='AddShapeEvent']") # for the creation of shapes
		panzoom_events = @doc.xpath("//event[@eventname='ResizeAndMoveSlideEvent']") # for the action of panning and/or zooming
		clear_page_events = @doc.xpath("//event[@eventname='ClearPageEvent']") # for clearing the svg image

		join_time = @doc.xpath("//event[@eventname='ParticipantJoinEvent']")[0]['timestamp'].to_f
		end_time = @doc.xpath("//event[@eventname='EndAndKickAllEvent']")[0]['timestamp'].to_f
		presentation_name = ""

		BigBlueButton.logger.info("Processing chat events")
		# Create slides.xml and chat.
		slides_doc = Nokogiri::XML::Builder.new do |xml|
			xml.popcorn {
				# Process chat events.
				chat_events.each do |node|
					chat_timestamp =  node['timestamp']
					chat_sender = node.xpath(".//sender")[0].text()
					chat_message =  node.xpath(".//message")[0].text()
					chat_start = (chat_timestamp.to_i - meeting_start.to_i) / 1000
					xml.timeline(:in => chat_start, :direction => "down",  :innerHTML => "<span><strong>#{chat_sender}:</strong> #{chat_message}</span>", :target => "chat" )
				end
			}
		end

		
		# Create shapes.svg file from the events.xml
		BigBlueButton.logger.info("Creating shapes.svg")
		shapes_svg = Nokogiri::XML::Builder.new do |xml|

			# process all the cleared pages events.
			clear_page_events.each do |clearEvent|
				clearTime = ((clearEvent['timestamp'].to_f - join_time)/1000).round(1)
				pageCleared = clearEvent.xpath(".//pageNumber")[0].text()
				clearPageTimes[(prev_clear_time..clearTime)] = [pageCleared, canvas_number]
				prev_clear_time = clearTime
				canvas_number+=1
			end
			
			# put in the last clear events numbers (previous clear to the end of the slideshow)
			endPresentationTime = ((end_time - join_time)/1000).round(1)
			clearPageTimes[(prev_clear_time..endPresentationTime)] = [pageCleared, canvas_number]
			
			# Put the headers on the svg xml file.
			xml.doc.create_internal_subset('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd")
			xml.svg('id' => 'svgfile', 'style' => 'position:absolute; height:600px; width:800px;', 'xmlns' => 'http://www.w3.org/2000/svg', 'xmlns:xlink' => 'http://www.w3.org/1999/xlink', 'version' => '1.1', 'viewBox' => '0 0 800 600') do
				
				#This is for the first image. It is a placeholder for an image that doesn't exist.
				xml.image(:id => "image0", :in => 0, :out => first_slide_start, :src => "logo.png", :width => 800)
				xml.g(:class => "canvas", :id => "canvas0", :image => "image0", :display => "none")
				
				# For each slide (there is only one image per slide)
				slides_events.each do |node|
					eventname =  node['eventname']
					if eventname == "SharePresentationEvent"
						presentation_name = node.xpath(".//presentationName")[0].text()
					else
						slide_timestamp =  node['timestamp']
						slide_start = ((slide_timestamp.to_f - meeting_start.to_f) / 1000).round(1)
						slide_number = node.xpath(".//slide")[0].text()
						# global_slide_count = global_slide_count + 1
						slide_src = "presentation/#{presentation_name}/slide-#{slide_number.to_i + 1}.png"
						image_url = "#{process_dir}/#{slide_src}"
						slide_size = FastImage.size(image_url)

						current_index = slides_events.index(node)
						if(current_index + 1 < slides_events.length)
							slide_end = (( slides_events[current_index + 1]['timestamp'].to_f - meeting_start.to_f ) / 1000).round(1)
						else
							slide_end = (( meeting_end.to_f - meeting_start.to_f ) / 1000).round(1)
						end

						BigBlueButton.logger.info("Processing slide image")
						# Is this a new image or one previously viewed?
						if(slides_compiled[[slide_src, slide_size[1], slide_size[0]]] == nil)
							# If it is, add it to the list with all the data.
							slides_compiled[[slide_src, slide_size[1], slide_size[0]]] = [[slide_start],[slide_end], global_slide_count]
							global_slide_count = global_slide_count + 1
						elsif
							# If not, append new in and out times to the old entry
							slides_compiled[[slide_src, slide_size[1], slide_size[0]]][0] << slide_start
							slides_compiled[[slide_src, slide_size[1], slide_size[0]]][1] << slide_end
						end

						ss[(slide_start..slide_end)] = slide_size # store the size of the slide at that range of time
						puts "#{slide_src} : #{slide_start} -> #{slide_end}"
					end
				end

				BigBlueButton.logger.info("Printing out the gathered images")
				# Print out the gathered/detected images.
				slides_compiled.each do |key, val|
					xml.image(:id => "image#{val[2].to_i}", :in => val[0].join(' '), :out => val[1].join(' '), 'xlink:href' => key[0], :height => key[1], :width => key[2], :visibility => "hidden")
					canvas_number+=1
					xml.g(:class => "canvas", :id => "canvas#{val[2].to_i}", :image => "image#{val[2].to_i}", :display => "none") do
						# Split by the cleared pages.
						clearPageTimes.each do |clearTimeInstance, pageAndCanvasNumbers|
							# Process the clears
							page_number += 1
							xml.g(:class => "page", :id => "page#{page_number}", :in => clearTimeInstance.first.to_s, :out => clearTimeInstance.last.to_s, :image => "image#{val[2].to_i}", :display => "none") do
								# Select and print the shapes within the current image
								shape_events.each do |shape|
								# Get variables
								type = shape.xpath(".//type")[0].text()
								timestamp = shape['timestamp'].to_f
								current_time = ((timestamp-join_time)/1000).round(1)
								thickness = shape.xpath(".//thickness")[0].text()
								pageNumber = shape.xpath(".//pageNumber")[0].text()
								dataPoints = shape.xpath(".//dataPoints")[0].text().split(",")
								colour = shape.xpath(".//color")[0].text()
								
								# Process colours
								colour_hex = colour.to_i.to_s(16) # convert from base 10 to base 16 (hex)
								colour_hex='0'*(6-colour_hex.length) + colour_hex # pad the number with 0's to give it a length of 6
								
								in_this_image = false
								in_this_canvas = false
								index = 0
								numOfTimes = val[0].length
								
								# Checks to see if the current shapes are to be drawn in this particular image
								while((in_this_image == false) && (index < numOfTimes)) do
									# BigBlueButton.logger.info("#{current_time} compared to ( #{val[0][index]} to #{val[1][index]} )")
									if(((val[0][index].to_f)..(val[1][index].to_f)) === current_time)
										# BigBlueButton.logger.info("#{current_time} is in the range of #{val[0][index]} to #{val[1][index]}")
										in_this_image = true
									end
									index+=1
								end
								
								# Checks to see if the current shapes are to be drawn in this particular canvas
								if(clearTimeInstance === current_time)
									# BigBlueButton.logger.info("#{current_time} is in the range of #{val[0][index]} to #{val[1][index]}")
									in_this_canvas = true
								end

								if((in_this_image) && (in_this_canvas))

									# resolve the current image height and width
									ss.each do |t,size|
										if t === current_time
											vbox_width = size[0]
											vbox_height = size[1]
										end
									end

									# Process the pencil shapes.
									if type.eql? "pencil"
										line_count = line_count + 1 # always update the line count!
										# # puts "thickness: #{thickness} and pageNumber: #{pageNumber} and dataPoints: #{dataPoints}"
										xml.g(:class => 'shape', :id=>"draw#{current_time}", :shape =>"line#{line_count}", :style => "stroke:\##{colour_hex}; stroke-width:#{thickness}; visibility:hidden") do
											# get first and last points for now. here in the future we should put a loop to get all the data points and make sub lines within the group.
											xml.line('x1' => "#{((dataPoints[0].to_f)/100)*vbox_width}", 'y1' => "#{((dataPoints[1].to_f)/100)*vbox_height}", 'x2' => "#{((dataPoints[(dataPoints.length)-2].to_f)/100)*vbox_width}", 'y2' => "#{((dataPoints[(dataPoints.length)-1].to_f)/100)*vbox_height}")
										end
										
									# Process the rectangle shapes
									elsif type.eql? "rectangle"
										if(current_time != prev_time)
											if((originalOriginX == ((dataPoints[0].to_f)/100)*vbox_width) && (originalOriginY == ((dataPoints[1].to_f)/100)*vbox_height))
												# do not update the rectangle count
											else
												rectangle_count = rectangle_count + 1
											end
											xml.g(:class => 'shape', 'id'=>"draw#{current_time}", 'shape'=>"rect#{rectangle_count}", 'style'=>"stroke:\##{colour_hex}; stroke-width:#{thickness}; visibility:hidden; fill:none") do
												originX = ((dataPoints[0].to_f)/100)*vbox_width
												originY = ((dataPoints[1].to_f)/100)*vbox_height
												originalOriginX = originX
												originalOriginY = originY
												rectWidth = ((dataPoints[2].to_f - dataPoints[0].to_f)/100)*vbox_width
												rectHeight = ((dataPoints[3].to_f - dataPoints[1].to_f)/100)*vbox_height

												# Cannot have a negative height or width so we adjust
												if(rectHeight < 0)
													originY = originY + rectHeight
													rectHeight = rectHeight.abs
												end
												if(rectWidth < 0)
													originX = originX + rectWidth
													rectWidth = rectWidth.abs
												end
												xml.rect('x' => "#{originX}", 'y' => "#{originY}", 'width' => "#{rectWidth}", 'height' => "#{rectHeight}")
												prev_time = current_time
											end
										end
										
									# Process the ellipse shapes
									elsif type.eql? "ellipse"
										if(current_time != prev_time)
											if((originalOriginX == ((dataPoints[0].to_f)/100)*vbox_width) && (originalOriginY == ((dataPoints[1].to_f)/100)*vbox_height))
												# do not update the rectangle count
											else
												ellipse_count = ellipse_count + 1
											end # end ((originalOriginX == ((dataPoints[0].to_f)/100)*vbox_width) && (originalOriginY == ((dataPoints[1].to_f)/100)*vbox_height))
											xml.g(:class => 'shape', 'id'=>"draw#{current_time}", 'shape'=>"ellipse#{ellipse_count}", 'style'=>"stroke:\##{colour_hex}; stroke-width:#{thickness}; visibility:hidden; fill:none") do
												originX = ((dataPoints[0].to_f)/100)*vbox_width
												originY = ((dataPoints[1].to_f)/100)*vbox_height
												originalOriginX = originX
												originalOriginY = originY
												ellipseWidth = ((dataPoints[2].to_f - dataPoints[0].to_f)/100)*vbox_width
												ellipseHeight = ((dataPoints[3].to_f - dataPoints[1].to_f)/100)*vbox_height
												if(ellipseHeight < 0)
													originY = originY + ellipseHeight
													ellipseHeight = ellipseHeight.abs
												end
												if(ellipseWidth < 0)
													originX = originX + ellipseWidth
													ellipseWidth = ellipseWidth.abs
												end
												xml.ellipse('cx' => "#{originX+(ellipseWidth/2)}", 'cy' => "#{originY+(ellipseHeight/2)}", 'rx' => "#{ellipseWidth/2}", 'ry' => "#{ellipseHeight/2}")
												prev_time = current_time
											end # end xml.g
										end # end if(current_time != prev_time)
									end
								end
							end
						end
					end
				end
			end
		end
	end

		#Create panzooms.xml
		panzooms_xml = Nokogiri::XML::Builder.new do |xml|
			xml.recording('id' => 'panzoom_events') do
				h_ratio_prev = "NaN"
				w_ratio_prev = "NaN"
				x_prev = "NaN"
				y_prev = "NaN"
				timestamp_orig_prev = "NaN"
				timestamp_prev = 0.0
				panzoom_events.each do |panZoomEvent|
					# Get variables
					timestamp_orig = panZoomEvent['timestamp'].to_f

					timestamp = ((timestamp_orig-join_time)/1000).round(1)
					h_ratio = panZoomEvent.xpath(".//heightRatio")[0].text()
					w_ratio = panZoomEvent.xpath(".//widthRatio")[0].text()
					x = panZoomEvent.xpath(".//xOffset")[0].text()
					y = panZoomEvent.xpath(".//yOffset")[0].text()
					if(timestamp_prev == timestamp)
						# do nothing because playback can't react that fast
					else
						if((!(h_ratio_prev.eql?("NaN"))) && (!(w_ratio_prev.eql?("NaN"))) && (!(x_prev.eql?("NaN"))) && (!(y_prev.eql?("NaN"))))
							xml.event('timestamp' => "#{timestamp_prev}", 'orig' => "#{timestamp_orig_prev}") do
								ss.each do |key,val|
									if key === timestamp
										vbox_width = val[0]
										vbox_height = val[1]
									end
								end
								xml.viewBox "#{(vbox_width-((1-((x_prev.to_f.abs)*magic_mystery_number/100.0))*vbox_width))} #{(vbox_height-((1-((y_prev.to_f.abs)*magic_mystery_number/100.0))*vbox_height)).round(2)} #{((w_ratio_prev.to_f/100.0)*vbox_width).round(1)} #{((h_ratio_prev.to_f/100.0)*vbox_height).round(1)}"
							end
						end
					end
					h_ratio_prev = h_ratio
					w_ratio_prev = w_ratio
					x_prev = x
					y_prev = y
					timestamp_prev = timestamp
					timestamp_orig_prev = timestamp_orig
				end
			end
		end

		# Write slides.xml to file
		File.open("#{package_dir}/slides.xml", 'w') { |f| f.puts slides_doc.to_xml }

		# Write shapes.svg to file
		File.open("#{package_dir}/#{shapes_svg_filename}", 'w') { |f| f.puts shapes_svg.to_xml.gsub(%r"\s*\<g.*/\>", "") } #.gsub(%r"\s*\<g.*\>\s*\</g\>", "") }
		
		# Write panzooms.xml to file
		File.open("#{package_dir}/#{panzooms_xml_filename}", 'w') { |f| f.puts panzooms_xml.to_xml }
		
        BigBlueButton.logger.info("Publishing slides")
		# Now publish this recording files by copying them into the publish folder.
		if not FileTest.directory?(publish_dir)
			FileUtils.mkdir_p publish_dir
		end
		FileUtils.cp_r(package_dir, publish_dir) # Copy all the files.
	end

end

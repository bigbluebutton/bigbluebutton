# Set encoding to utf-8
# encoding: UTF-8

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#

performance_start = Time.now

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

def processPanAndZooms
  #Create panzooms.xml
  BigBlueButton.logger.info("Creating panzooms.xml")
  $panzooms_xml = Nokogiri::XML::Builder.new do |xml|
    $xml = xml
    $xml.recording('id' => 'panzoom_events') do
      h_ratio_prev = nil
      w_ratio_prev = nil
      x_prev = nil
      y_prev = nil
      timestamp_orig_prev = nil
      timestamp_prev = nil
      last_time = nil
      if $panzoom_events.empty?
        BigBlueButton.logger.info("No panzoom events; old recording?")
        BigBlueButton.logger.info("Synthesizing a panzoom event")
        if !$slides_events.empty?
          timestamp_orig = $slides_events.first[:timestamp].to_f
          # make sure this is scheduled *after* the slide is shown. Dunno if needed.
          timestamp_orig += 1000
          timestamp = ( translateTimestamp(timestamp_orig) / 1000 ).round(1)
          $xml.event(:timestamp => timestamp, :orig => timestamp_orig) do
            $xml.viewBox "0 0 #{$vbox_width} #{$vbox_height}"
          end
          timestamp_orig_prev = timestamp_orig
          timestamp_prev = timestamp
          h_ratio_prev = 100
          w_ratio_prev = 100
          x_prev = 0
          y_prev = 0
        else
          BigBlueButton.logger.info("Couldn't find any slides! panzooms will be empty.")
        end
      else
        last_time = $panzoom_events.last[:timestamp].to_f
      end
      $panzoom_events.each do |panZoomEvent|
        # Get variables
        timestamp_orig = panZoomEvent[:timestamp].to_f

        timestamp = ( translateTimestamp(timestamp_orig) / 1000 ).round(1)
        h_ratio = panZoomEvent.xpath(".//heightRatio")[0].text()
        w_ratio = panZoomEvent.xpath(".//widthRatio")[0].text()
        x = panZoomEvent.xpath(".//xOffset")[0].text()
        y = panZoomEvent.xpath(".//yOffset")[0].text()

        if(timestamp_prev == timestamp)
          if(timestamp_orig == last_time)
            if(h_ratio && w_ratio && x && y)
              $xml.event(:timestamp => timestamp, :orig => timestamp_orig) do
                $ss.each do |key,val|
                  $val = val
                  if key === timestamp
                    $vbox_width = $val[0]
                    $vbox_height = $val[1]
                  end
                end
                $xml.viewBox "#{($vbox_width-((1-((x.to_f.abs)*$magic_mystery_number/100.0))*$vbox_width))} #{($vbox_height-((1-((y.to_f.abs)*$magic_mystery_number/100.0))*$vbox_height)).round(2)} #{((w_ratio.to_f/100.0)*$vbox_width).round(1)} #{((h_ratio.to_f/100.0)*$vbox_height).round(1)}"
              end
            end
          end
          # do nothing because playback can't react that fast
        else
          if(h_ratio_prev && w_ratio_prev && x_prev && y_prev)
            $xml.event(:timestamp => timestamp_prev, :orig => timestamp_orig_prev) do
              $ss.each do |key,val|
                $val = val
                if key === timestamp_prev
                  $vbox_width = $val[0]
                  $vbox_height = $val[1]
                end
              end
              $xml.viewBox "#{($vbox_width-((1-((x_prev.to_f.abs)*$magic_mystery_number/100.0))*$vbox_width))} #{($vbox_height-((1-((y_prev.to_f.abs)*$magic_mystery_number/100.0))*$vbox_height)).round(2)} #{((w_ratio_prev.to_f/100.0)*$vbox_width).round(1)} #{((h_ratio_prev.to_f/100.0)*$vbox_height).round(1)}"
            end
          end
        end
        timestamp_prev = timestamp
        timestamp_orig_prev = timestamp_orig
        h_ratio_prev = h_ratio
        w_ratio_prev = w_ratio
        x_prev = x
        y_prev = y
      end
      $xml.event(:timestamp => timestamp_prev, :orig => timestamp_orig_prev) do
        $ss.each do |key,val|
          $val = val
          if key === timestamp_prev
            $vbox_width = $val[0]
            $vbox_height = $val[1]
          end
        end
        $xml.viewBox "#{($vbox_width-((1-((x_prev.to_f.abs)*$magic_mystery_number/100.0))*$vbox_width))} #{($vbox_height-((1-((y_prev.to_f.abs)*$magic_mystery_number/100.0))*$vbox_height)).round(2)} #{((w_ratio_prev.to_f/100.0)*$vbox_width).round(1)} #{((h_ratio_prev.to_f/100.0)*$vbox_height).round(1)}"
      end

    end
  end
  BigBlueButton.logger.info("Finished creating panzooms.xml")
end

def processCursorEvents
  BigBlueButton.logger.info("Processing cursor events")
  $cursor_xml = Nokogiri::XML::Builder.new do |xml|
    $xml = xml
    $xml.recording('id' => 'cursor_events') do
      x_prev = nil
      y_prev = nil
      timestamp_orig_prev = nil
      timestamp_prev = nil
      if(!$cursor_events.empty?)
        last_time = $cursor_events.last[:timestamp].to_f
        $cursor_events.each do |cursorEvent|
          timestamp_orig = cursorEvent[:timestamp].to_f
          timestamp = ( translateTimestamp(timestamp_orig) / 1000 ).round(1)

          x = cursorEvent.xpath(".//xOffset")[0].text()
          y = cursorEvent.xpath(".//yOffset")[0].text()
          if(timestamp_prev == timestamp)

          else
            if(x_prev && y_prev)
              $ss.each do |key,val|
                $val = val
                if key === timestamp_prev
                  $vbox_width = $val[0]/2 # because the image size is twice as big as the viewbox
                  $vbox_height = $val[1]/2 # because the image size is twice as big as the viewbox
                end
              end
              xPoint = ($vbox_width.to_f*x.to_f).round(1)
              yPoint = ($vbox_height.to_f*y.to_f).round(1)
              if xPoint < 800 and yPoint < 600 and xPoint > 0 and yPoint > 0
                $xml.event(:timestamp => timestamp_prev, :orig => timestamp_orig_prev) do
                  $xml.cursor "#{xPoint} #{yPoint}"
                end
              end
            end
          end
          timestamp_prev = timestamp
          timestamp_orig_prev = timestamp_orig
          x_prev = x
          y_prev = y
        end
      end
    end
  end
  BigBlueButton.logger.info("Finished processing cursor events")
end

def processClearEvents
  # process all the cleared pages events.
  $clear_page_events.each do |clearEvent|
    #Retrieve time, page and presentation.
    clearTime = clearEvent[:timestamp].to_f
    #clearTime = ( clearEvent[:timestamp].to_f / 1000 ).round(1)
    $pageCleared = clearEvent.xpath(".//pageNumber")[0].text()
    slideFolder = clearEvent.xpath(".//presentation")[0].text()
    if $version_atleast_0_9_0
      $clearPageTimes[($prev_clear_time..clearTime)] =
        [$pageCleared, $canvas_number, "presentation/#{slideFolder}/slide-#{$pageCleared.to_i + 1}.png", nil]
    else
      $clearPageTimes[($prev_clear_time..clearTime)] =
        [$pageCleared, $canvas_number, "presentation/#{slideFolder}/slide-#{$pageCleared}.png", nil]
    end
    $prev_clear_time = clearTime
    $canvas_number+=1
  end
end

def processUndoEvents
  # Processing the undo events, creating/filling a hashmap called "undos".
  BigBlueButton.logger.info("Process undo events.")
  $undo_events.each do |undo|
    closest_shape = nil # Initialize as nil to prime the loop.
    t = undo[:timestamp].to_f
    $shape_events.each do |shape|
      # The undo cannot be for a shape that hasn't been drawn yet.
      if shape[:timestamp].to_f < t
        # It must be the closest shape drawn that hasn't already been undone.
        if (closest_shape == nil) || (shape[:timestamp].to_f > closest_shape[:timestamp].to_f)
          # It cannot be an undo for another shape already.
          if !($undos.has_key? shape)
            # Must be part of this presentation of course
            if shape.xpath(".//pageNumber")[0].text() == undo.xpath(".//pageNumber")[0].text()
              # Must be a shape in this page too.
              if shape.xpath(".//presentation")[0].text() == undo.xpath(".//presentation")[0].text()
                if ((shape.xpath(".//type")[0].text() == "rectangle") || (shape.xpath(".//type")[0].text() == "ellipse"))
                  shape_already_processed = false
                  if($undos.length == 0)
                    shape_already_processed = false
                  else
                    $undos.each do |u, v|
                      if shape.xpath(".//dataPoints")[0].text().split(",")[0] == u.xpath(".//dataPoints")[0].text().split(",")[0]
                        if shape.xpath(".//dataPoints")[0].text().split(",")[1] == u.xpath(".//dataPoints")[0].text().split(",")[1]
                          shape_already_processed = true
                        end
                      end
                    end
                  end
                  if !(shape_already_processed)
                    closest_shape = shape
                  end
                else
                  closest_shape = shape
                end
              end
            end
          end
        end
      end
    end
    if(closest_shape != nil)
      $undos[closest_shape] = undo[:timestamp]
    end
  end

  $undos_temp = {}
  $undos.each do |un, val|
    $undos_temp[ un[:timestamp] ] = val
  end
  $undos = $undos_temp
  BigBlueButton.logger.info("Undos: #{$undos}")
end

def processClearImages
  BigBlueButton.logger.info("Put image numbers in clearPageTimes")
  $slides_compiled.each do |key, val|
    $clearPageTimes.each do |cpt, pgCanvasUrl|
      # check if the src of the slide matches the url of the clear event
      if key[0] == pgCanvasUrl[2]
        # put the image number into the $clearPageTimes
        pgCanvasUrl[3] = "image#{val[2].to_i}"
      end
    end
  end
end

def storePencilShape
  $pencil_count = $pencil_count + 1 # always update the line count!
  $global_shape_count += 1
  $xml.g(:class => :shape, :id=>"draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape =>"line#{$pencil_count}", :style => "stroke:\##{$colour_hex}; stroke-linejoin: round; stroke-linecap: round; stroke-width:#{$shapeThickness}; fill: none; visibility:hidden; ") do
    points = "#{(($shapeDataPoints[0].to_f)/100)*$vbox_width},#{(($shapeDataPoints[1].to_f)/100)*$vbox_height}"
    for i in (1...($shapeDataPoints.length/2)) do
      points += " #{(($shapeDataPoints[i*2].to_f)/100)*$vbox_width},#{(($shapeDataPoints[(i*2)+1].to_f)/100)*$vbox_height}"
    end
    $xml.polyline(:points => points)
  end
end

def storeLineShape
  if(($originalOriginX == (($shapeDataPoints[0].to_f)/100)*$vbox_width) && ($originalOriginY == (($shapeDataPoints[1].to_f)/100)*$vbox_height))
    # do not update the line count
  else
    $line_count = $line_count + 1
  end
  $global_shape_count += 1
  $xml.g(:class => :shape, :id => "draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape => "line#{$line_count}", :style => "stroke:\##{$colour_hex}; stroke-linecap: round; stroke-width:#{$shapeThickness}; visibility:hidden; fill:none") do

    $originX = (($shapeDataPoints[0].to_f)/100)*$vbox_width
    $originY = (($shapeDataPoints[1].to_f)/100)*$vbox_height
    endPointX = (($shapeDataPoints[2].to_f)/100)*$vbox_width
    endPointY = (($shapeDataPoints[3].to_f)/100)*$vbox_height

    $originalOriginX = $originX
    $originalOriginY = $originY

    $xml.line(:x1 => $originX, :y1 => $originY, :x2 => endPointX, :y2 => endPointY )
    $prev_time = $shapeCreationTime
  end
end

def storeRectShape
  if(($originalOriginX == (($shapeDataPoints[0].to_f)/100)*$vbox_width) && ($originalOriginY == (($shapeDataPoints[1].to_f)/100)*$vbox_height))
    # do not update the rectangle count
  else
    $rectangle_count = $rectangle_count + 1
  end
  $global_shape_count += 1
  $xml.g(:class => :shape, :id => "draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape => "rect#{$rectangle_count}", :style => "stroke:\##{$colour_hex}; stroke-linejoin: round; stroke-width:#{$shapeThickness}; visibility:hidden; fill:none") do
    $originX = x1 = (($shapeDataPoints[0].to_f)/100)*$vbox_width
    $originY = y1 = (($shapeDataPoints[1].to_f)/100)*$vbox_height
    x2 = (($shapeDataPoints[2].to_f)/100)*$vbox_width
    y2 = (($shapeDataPoints[3].to_f)/100)*$vbox_height

    width = (x2 - x1).abs
    height = (y2 - y1).abs

    # Convert to a square, keeping aligned with the start point
    if $is_square == "true"
      # This duplicates a bug in the BigBlueButton client
      if x2 > x1
        y2 = y1 + width
      else
        y2 = y1 - width
      end
    end

    $xml.polygon(:points => "#{x1},#{y1} #{x2},#{y1} #{x2},#{y2} #{x1},#{y2}")
    $originalOriginX = x1
    $originalOriginY = y1
    $prev_time = $shapeCreationTime
  end
end

def storeTriangleShape
  if(($originalOriginX == (($shapeDataPoints[0].to_f)/100)*$vbox_width) && ($originalOriginY == (($shapeDataPoints[1].to_f)/100)*$vbox_height))
    # do not update the triangle count
  else
    $triangle_count = $triangle_count + 1
  end
  $global_shape_count += 1
  $xml.g(:class => :shape, :id => "draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape => "triangle#{$triangle_count}", :style => "stroke:\##{$colour_hex}; stroke-linejoin: round; stroke-width:#{$shapeThickness}; visibility:hidden; fill:none") do

    $originX = (($shapeDataPoints[0].to_f)/100)*$vbox_width
    $originY = (($shapeDataPoints[1].to_f)/100)*$vbox_height

    #3 points (p0, p1 and p2) to draw a triangle

    base = (($shapeDataPoints[2].to_f - $shapeDataPoints[0].to_f)/100)*$vbox_width

    x0 = $originX + (base.to_f / 2.0)
    x1 = $originX
    x2 = $originX + base.to_f

    height = (($shapeDataPoints[3].to_f - $shapeDataPoints[1].to_f)/100)*$vbox_height

    y0 = $originY
    y1 = $originY + height
    y2 = y1

    p0 = "#{x0},#{y0}"
    p1 = "#{x1},#{y1}"
    p2 = "#{x2},#{y2}"

    $originalOriginX = $originX
    $originalOriginY = $originY

    $xml.polygon(:points => "#{p0} #{p1} #{p2}")
    $prev_time = $shapeCreationTime
  end
end

def storeEllipseShape
  if(($originalOriginX == (($shapeDataPoints[0].to_f)/100)*$vbox_width) && ($originalOriginY == (($shapeDataPoints[1].to_f)/100)*$vbox_height))
    # do not update the ellipse count
  else
    $ellipse_count = $ellipse_count + 1
  end # end (($originalOriginX == (($shapeDataPoints[0].to_f)/100)*$vbox_width) && ($originalOriginY == (($shapeDataPoints[1].to_f)/100)*$vbox_height))
  $global_shape_count += 1
  $xml.g(:class => :shape, :id => "draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape => "ellipse#{$ellipse_count}", :style =>"stroke:\##{$colour_hex}; stroke-linejoin: round; stroke-width:#{$shapeThickness}; visibility:hidden; fill:none") do
    $originX = x1 = (($shapeDataPoints[0].to_f)/100)*$vbox_width
    $originY = y1 = (($shapeDataPoints[1].to_f)/100)*$vbox_height
    x2 = (($shapeDataPoints[2].to_f)/100)*$vbox_width
    y2 = (($shapeDataPoints[3].to_f)/100)*$vbox_height

    width_r = (x2 - x1).abs / 2
    height_r = (y2 - y1).abs / 2

    # Convert to a circle, keeping aligned with the start point
    if $is_circle == "true"
      height_r = width_r
      # This duplicates a bug in the BigBlueButton client
      if x2 > x1
        y2 = y1 + width_r + width_r
      else
        y2 = y1 - width_r - width_r
      end
    end

    # SVG's ellipse element doesn't render if r_x or r_y is 0, but
    # we want to display a line segment in that case. But the SVG
    # path element's elliptical arc code renders r_x or r_y
    # degenerate cases as line segments, so we can use that.

    # Normalize the x,y coordinates
    x1, x2 = x2, x1 if x1 > x2
    y1, y2 = y2, y1 if y1 > y2

    path = "M#{x1},#{(y1+y2)/2}"
    path += "A#{width_r},#{height_r} 0 0 1 #{(x1+x2)/2},#{y1}"
    path += "A#{width_r},#{height_r} 0 0 1 #{x2},#{(y1+y2)/2}"
    path += "A#{width_r},#{height_r} 0 0 1 #{(x1+x2)/2},#{y2}"
    path += "A#{width_r},#{height_r} 0 0 1 #{x1},#{(y1+y2)/2}"
    path += "Z"

    $xml.path(:d => path)

    $originalOriginX = $originX
    $originalOriginY = $originY
    $prev_time = $shapeCreationTime
  end # end xml.g
end

def storeTextShape
  $originX = (($shapeDataPoints[0].to_f)/100)*$vbox_width
  $originY = (($shapeDataPoints[1].to_f)/100)*$vbox_height
  if(($originalOriginX == $originX) && ($originalOriginY == $originY))
    # do not update the text count
  else
    $text_count = $text_count + 1
  end
  font_size_factor = 1.7
  width_extra_percent = -0.7
  height_extra_percent = 1
  width = ( ($textBoxWidth.to_f + width_extra_percent) / 100.0) * $vbox_width
  height = ( ($textBoxHeight.to_f + height_extra_percent ) / 100.0) * $vbox_height
  y_gap = -30.0
  x_gap = 5.0
  $textFontSize_pixels = $textFontSize.to_f * font_size_factor
  $global_shape_count += 1
  $xml.g(:class => :shape, :id => "draw#{$global_shape_count}", :timestamp => $shapeCreationTime, :undo => $shapeUndoTime, :shape => "text#{$text_count}", :style => "word-wrap: break-word; visibility:hidden; font-family: #{$textFontType}; font-size: #{$textFontSize_pixels}px;") do
    $xml.switch do
      $xml.foreignObject(  :color => "##{$colour_hex}", :width => width, :height => height, :x => "#{((($shapeDataPoints[0].to_f)/100)*$vbox_width) + x_gap}", :y => "#{((($shapeDataPoints[1].to_f)/100) *$vbox_height )  + y_gap.to_f }") do
        $xml.div( :xmlns => "http://www.w3.org/1999/xhtml" ) do
          $xml.text($textValue)
        end
      end
    end
    $prev_time = $shapeCreationTime
  end # end xml.g
  $originalOriginX = $originX
  $originalOriginY = $originY
end

def storePollResultShape(xml, shape)
  origin_x = $shapeDataPoints[0].to_f / 100 * $vbox_width
  origin_y = $shapeDataPoints[1].to_f / 100 * $vbox_height
  width = $shapeDataPoints[2].to_f / 100 * $vbox_width
  height = $shapeDataPoints[3].to_f / 100 * $vbox_height

  result = JSON.load(shape.at_xpath('result').text)
  num_responders = shape.at_xpath('num_responders').text.to_i
  presentation = shape.at_xpath('presentation').text

  $global_shape_count += 1
  $poll_result_count += 1

  dat_file = "#{$process_dir}/poll_result#{$poll_result_count}.dat"
  gpl_file = "#{$process_dir}/poll_result#{$poll_result_count}.gpl"
  pdf_file = "#{$process_dir}/poll_result#{$poll_result_count}.pdf"
  svg_file = "#{$process_dir}/presentation/#{presentation}/poll_result#{$poll_result_count}.svg"

  # Use gnuplot to generate an SVG image for the graph
  File.open(dat_file, 'w') do |d|
    result.each do |r|
      d.puts("#{r['id']} #{r['num_votes']}")
    end
  end
  File.open(dat_file, 'r') do |d|
    BigBlueButton.logger.debug("gnuplot data:")
    BigBlueButton.logger.debug(d.readlines(nil)[0])
  end
  File.open(gpl_file, 'w') do |g|
    g.puts('reset')
    g.puts("set term pdfcairo size #{height / 72}, #{width / 72} font \"Arial,48\" noenhanced")
    g.puts('unset key')
    g.puts('set style data boxes')
    g.puts('set style fill solid border -1')
    g.puts('set boxwidth 0.9 relative')
    g.puts('set yrange [0:*]')
    g.puts('unset border')
    g.puts('unset ytics')
    xtics = result.map{ |r| "#{r['key'].gsub('%', '%%').inspect} #{r['id']}" }.join(', ')
    g.puts("set xtics rotate by 90 scale 0 right (#{xtics})")
    if num_responders > 0
      x2tics = result.map{ |r| "\"#{(r['num_votes'].to_f / num_responders * 100).to_i}%%\" #{r['id']}" }.join(', ')
      g.puts("set x2tics rotate by 90 scale 0 left (#{x2tics})")
    end
    g.puts('set linetype 1 linewidth 1 linecolor rgb "black"')
    result.each do |r|
      if r['num_votes'] == 0 or r['num_votes'].to_f / num_responders <= 0.5
        g.puts("set label \"#{r['num_votes']}\" at #{r['id']},#{r['num_votes']} left rotate by 90 offset 0,character 0.5 front")
      else
        g.puts("set label \"#{r['num_votes']}\" at #{r['id']},#{r['num_votes']} right rotate by 90 offset 0,character -0.5 textcolor rgb \"white\" front")
      end
    end
    g.puts("set output \"#{pdf_file}\"")
    g.puts("plot \"#{dat_file}\"")
  end
  File.open(gpl_file, 'r') do |d|
    BigBlueButton.logger.debug("gnuplot script:")
    BigBlueButton.logger.debug(d.readlines(nil)[0])
  end
  ret = BigBlueButton.exec_ret('gnuplot', '-d', gpl_file)
  raise "Failed to generate plot pdf" if ret != 0
  ret = BigBlueButton.exec_ret('pdftocairo', '-svg', pdf_file, svg_file)
  raise "Failed to convert poll to svg" if ret != 0

  xml.g(class: 'shape', id: "draw#{$global_shape_count}",
      shape: "poll_result#{$poll_result_count}", style: 'visibility:hidden',
      timestamp: $shapeCreationTime, undo: $shapeUndoTime) do

    # Outer box to act as poll result backdrop
    xml.rect(x: origin_x + 2, y: origin_y + 2, width: width - 4, height: height - 4,
        'fill' => 'white', 'stroke' => 'black', 'stroke-width' => 4)

    # Poll image
    xml.image('xlink:href' => "presentation/#{presentation}/poll_result#{$poll_result_count}.svg",
        height: width, width: height, x: $vbox_width, y: origin_y,
        transform: "rotate(90, #{$vbox_width}, #{origin_y})")

  end
end

#
# Calculate the offsets based on the start and stop recording events, so it's easier
# to translate the timestamps later based on these offsets
#
def calculateRecordEventsOffset
  accumulated_duration = 0
  previous_stop_recording = $meeting_start.to_f
  $rec_events.each do |event|
    event[:offset] = event[:start_timestamp] - accumulated_duration
    event[:duration] = event[:stop_timestamp] - event[:start_timestamp]
    event[:accumulated_duration] = accumulated_duration

    previous_stop_recording = event[:stop_timestamp]
    accumulated_duration += event[:duration]
  end
end

#
# Translated an arbitrary Unix timestamp to the recording timestamp. This is the
# function that others will call
#
def translateTimestamp(timestamp)
  new_timestamp = translateTimestamp_helper(timestamp.to_f).to_f
#	BigBlueButton.logger.info("Translating #{timestamp}, old value=#{timestamp.to_f-$meeting_start.to_f}, new value=#{new_timestamp}")
  new_timestamp
end

#
# Translated an arbitrary Unix timestamp to the recording timestamp
#
def translateTimestamp_helper(timestamp)
  $rec_events.each do |event|
    # if the timestamp comes before the start recording event, then the timestamp is translated to the moment it starts recording
    if timestamp <= event[:start_timestamp]
      return event[:start_timestamp] - event[:offset]
    # if the timestamp is during the recording period, it is just translated to the new one using the offset
    elsif timestamp > event[:start_timestamp] and timestamp <= event[:stop_timestamp]
      return timestamp - event[:offset]
    end
  end
  # if the timestamp comes after the last stop recording event, then the timestamp is translated to the last stop recording event timestamp
  return timestamp - $rec_events.last()[:offset] + $rec_events.last()[:duration]
end
#
# Given an event timestamp, says whether it occurs during a recording period or not.
#
def occursDuringRecording(timestamp)
  $rec_events.each do |event|
    if timestamp >= event[:start_timestamp] and timestamp <= event[:stop_timestamp]
      return true
    end
  end
  return false
end

def preprocessSlideEvents
  new_slides_events = []
  $slides_events.each do |slide_event|
    new_slide_event = slide_event.clone
    $rec_events.each do |rec_event|
      if new_slide_event[:timestamp] <= rec_event[:start_timestamp]
        new_slide_event[:timestamp] = rec_event[:start_timestamp]
        if not new_slides_events.empty? and new_slides_events.last()[:timestamp] == rec_event[:start_timestamp]
          new_slides_events.pop()
        end
        new_slides_events << new_slide_event
        break
      elsif new_slide_event[:timestamp] > rec_event[:start_timestamp] and new_slide_event[:timestamp] <= rec_event[:stop_timestamp]
        new_slides_events << new_slide_event
      end
    end
  end
  return new_slides_events
end

def processSlideEvents
  BigBlueButton.logger.info("Slide events processing")
  # For each slide (there is only one image per slide)
  $slides_events.each do |node|
    # Ignore slide events that happened after the last recording period.
    if(node[:timestamp].to_f > $rec_events.last[:stop_timestamp].to_f)
      next
    end
    eventname = node['eventname']
    if eventname == "SharePresentationEvent"
      $presentation_name = node.xpath(".//presentationName")[0].text()
    else
      slide_timestamp =  node[:timestamp]
      slide_start = ( translateTimestamp(slide_timestamp) / 1000 ).round(1)
      orig_slide_start = ( slide_timestamp.to_f / 1000 ).round(1)
      slide_number = node.xpath(".//slide")[0].text().to_i
      slide_number = slide_number < 0 ? 0 : slide_number
      slide_src = "presentation/#{$presentation_name}/slide-#{slide_number + 1}.png"
      txt_file_path = "presentation/#{$presentation_name}/textfiles/slide-#{slide_number + 1}.txt"
      slide_text = File.exist?("#{$process_dir}/#{txt_file_path}") ? txt_file_path : nil
      image_url = "#{$process_dir}/#{slide_src}"

      if !File.exist?(image_url)
        BigBlueButton.logger.warn("Missing image file #{slide_src}!")
        # Emergency last-ditch blank image creation
        FileUtils.mkdir_p("#{$process_dir}/presentation/#{$presentation_name}")
        command = "convert -size 1600x1200 xc:white -quality 90 +dither -depth 8 -colors 256 #{image_url}"
        BigBlueButton.execute(command)
      end

      slide_size = FastImage.size(image_url)
      current_index = $slides_events.index(node)
      if(current_index + 1 < $slides_events.length)
        slide_end = ( translateTimestamp($slides_events[current_index + 1][:timestamp]) / 1000 ).round(1)
        orig_slide_end = ( $slides_events[current_index + 1][:timestamp].to_f / 1000 ).round(1)
      else
        slide_end = ( translateTimestamp($meeting_end) / 1000 ).round(1)
        orig_slide_end = ( $meeting_end.to_f / 1000 ).round(1)
      end

      if slide_start == slide_end
        BigBlueButton.logger.info("#{slide_src} is never displayed (slide_start = slide_end), so it won't be included in the svg")
        next
      end

      BigBlueButton.logger.info("Processing slide image")
      # Is this a new image or one previously viewed?
      if($slides_compiled[[slide_src, slide_size[1], slide_size[0]]] == nil)
        # If it is, add it to the list with all the data.
        $slides_compiled[[slide_src, slide_size[1], slide_size[0]]] = [[slide_start], [slide_end], $global_slide_count, slide_text, [orig_slide_start], [orig_slide_end]]
        $global_slide_count = $global_slide_count + 1
      else
        # If not, append new in and out times to the old entry
        # But if the previous slide_end is equal to the current slide_start, we just pop the previous slide_end and push the current one
        # It will avoid the duplication of the thumbnails on the playback
        if($slides_compiled[[slide_src, slide_size[1], slide_size[0]]][1].last == slide_start)
          $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][1].pop
          $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][1] << slide_end
        else
          $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][0] << slide_start
          $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][1] << slide_end
        end
        $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][4] << orig_slide_start
        $slides_compiled[[slide_src, slide_size[1], slide_size[0]]][5] << orig_slide_end
      end

      $ss[(slide_start..slide_end)] = slide_size # store the size of the slide at that range of time
      puts "#{slide_src} : #{slide_start} -> #{slide_end}"
    end
  end
end

def processShapesAndClears
  # Create shapes.svg file from the events.xml
  BigBlueButton.logger.info("Creating shapes.svg")
  $shapes_svg = Nokogiri::XML::Builder.new do |xml|
    $xml = xml

    processClearEvents()
    processUndoEvents()

    # Put in the last clear events numbers (previous clear to the end of the slideshow)
    #endPresentationTime = ( $end_time.to_f / 1000 ).round(1)
    endPresentationTime = $end_time.to_f
    $clearPageTimes[($prev_clear_time..endPresentationTime)] = [$pageCleared, $canvas_number, nil, nil]

    # Put the headers on the svg xml file.
    $xml.doc.create_internal_subset('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd")
    $xml.svg(:id => :svgfile, :style => 'position:absolute; height:600px; width:800px;', :xmlns => 'http://www.w3.org/2000/svg', 'xmlns:xlink' => 'http://www.w3.org/1999/xlink', :version => '1.1', :viewBox => :'0 0 800 600') do

      # This is for the first image. It is a placeholder for an image that doesn't exist.
      $xml.image(:id => :image0, :class => 'slide', :in => 0, :out => $first_slide_start, :src => "logo.png", :width => 800)
      $xml.g(:class => :canvas, :id => :canvas0, :image => :image0, :display => :none)
      $presentation_name = ""

      processSlideEvents()
      processClearImages()

      BigBlueButton.logger.info("Printing out the gathered images")
      # Print out the gathered/detected images.
      $slides_compiled.each do |key, val|
        $val = val
        $xml.image(:id => "image#{$val[2].to_i}", :class => 'slide', :in => $val[0].join(' '), :out => $val[1].join(' '), 'xlink:href' => key[0], :height => key[1], :width => key[2], :visibility => :hidden, :text => $val[3], :x => 0)
        $canvas_number+=1
        $xml.g(:class => :canvas, :id => "canvas#{$val[2].to_i}", :image => "image#{$val[2].to_i}", :display => :none) do

          BigBlueButton.logger.info("Processing shapes within the image #{$val[2].to_i}")
          # Select and print the shapes within the current image
          $shape_events.each do |shape|
            $shapeTimestamp = shape[:timestamp].to_f
            $shapeCreationTime = ( translateTimestamp($shapeTimestamp) / 1000 ).round(1)
            orig_shapeCreationTime = ( $shapeTimestamp.to_f / 1000 ).round(1)
            in_this_image = false
            index = 0
            numOfTimes = $val[0].length

            # Check if the current shape is to be drawn in this particular image
            while((in_this_image == false) && (index < numOfTimes)) do
              if((($val[4][index].to_f)..($val[5][index].to_f)) === orig_shapeCreationTime) # is the shape within the certain time of the image
                in_this_image = true
              end
              index+=1
            end

            if(in_this_image)
              # Get variables
              BigBlueButton.logger.info shape.to_xml(:indent => 2)
              $shapeType = shape.xpath(".//type")[0].text()
              $pageNumber = shape.xpath(".//pageNumber")[0].text()
              $shapeDataPoints = shape.xpath(".//dataPoints")[0].text().split(",")

              case $shapeType
                when 'pencil', 'rectangle', 'ellipse', 'triangle', 'line'
                  $shapeThickness = shape.xpath(".//thickness")[0].text()
                  colour = shape.xpath(".//color")[0].text()
                when 'text'
                  $textValue = shape.xpath(".//text")[0].text()
                  $textFontType = "Arial"
                  $textFontSize = shape.xpath(".//fontSize")[0].text()
                  colour = shape.xpath(".//fontColor")[0].text()
                when 'poll_result'
                  # Just hand the 'shape' xml object to the poll rendering code.
              end

              # figure out undo time
              BigBlueButton.logger.info("Figuring out undo time")
              if($undos.has_key? ( shape[:timestamp] ))
                $shapeUndoTime = ( translateTimestamp( $undos[ shape[:timestamp] ] ) / 1000).round(1)
              else
                $shapeUndoTime = -1
              end

              clear_time = -1
              $clearPageTimes.each do |clearTimeInstance, pageAndCanvasNumbers|
                $clearTimeInstance = clearTimeInstance
                $pageAndCanvasNumbers = pageAndCanvasNumbers
                if(($clearTimeInstance.last > $shapeTimestamp) && ($pageAndCanvasNumbers[3] == "image#{$val[2].to_i}"))
                  if((clear_time > ( translateTimestamp($clearTimeInstance.last) / 1000 ).round(1)) || (clear_time == -1))
                    clear_time = ( translateTimestamp($clearTimeInstance.last) / 1000 ).round(1)
                  end
                end
              end

              if($shapeUndoTime == -1)
                if(clear_time == -1)
                  $shapeUndoTime = -1 # nothing changes
                elsif(clear_time != -1)
                  $shapeUndoTime = clear_time
                end
              elsif($shapeUndoTime != -1)
                if(clear_time == -1)
                  $shapeUndoTime = $shapeUndoTime #nothing changes
                elsif (clear_time != -1)
                  if(clear_time < $shapeUndoTime)
                    $shapeUndoTime = clear_time
                  else
                    $shapeUndoTime = $shapeUndoTime # nothing changes
                  end
                end
              end

              # Process colours
              $colour_hex = colour.to_i.to_s(16) # convert from base 10 to base 16 (hex)
              $colour_hex='0'*(6-$colour_hex.length) + $colour_hex # pad the number with 0's to give it a length of 6

              # resolve the current image height and width
              $ss.each do |t,size|
                if t === $shapeCreationTime
                  $vbox_width = size[0]
                  $vbox_height = size[1]
                end
              end

              case $shapeType
                when 'pencil'
                  storePencilShape()
                when 'line'
                  storeLineShape()
                when 'rectangle'
                  square = shape.xpath(".//square")
                  if square.length > 0
                    $is_square = square[0].text()
                  else
                    $is_square = 'false'
                  end
                  storeRectShape()
                when 'triangle'
                  storeTriangleShape()
                when 'ellipse'
                  circle = shape.xpath(".//circle")
                  if circle.length > 0
                    $is_circle = circle[0].text()
                  else
                    $is_circle = 'false'
                  end
                  storeEllipseShape()
                when 'text'
                  $textBoxWidth = shape.xpath(".//textBoxWidth")[0].text()
                  $textBoxHeight = shape.xpath(".//textBoxHeight")[0].text()
                  storeTextShape()
                when 'poll_result'
                  storePollResultShape($xml, shape)
              end
            end # end if(in_this_image)
          end # end shape_events.each do |shape|
        end
      end
    end
  end
end

def processChatMessages
  BigBlueButton.logger.info("Processing chat events")
  # Create slides.xml and chat.
  $slides_doc = Nokogiri::XML::Builder.new do |xml|
    $xml = xml
    $xml.popcorn {
      # Process chat events.
      current_time = 0
      $rec_events.each do |re|
        $chat_events.each do |node|
          if (node[:timestamp].to_i >= re[:start_timestamp] and node[:timestamp].to_i <= re[:stop_timestamp])
            chat_timestamp =  node[:timestamp]
            chat_sender = node.xpath(".//sender")[0].text()
            chat_message =  BigBlueButton::Events.linkify(node.xpath(".//message")[0].text())
            chat_start = ( translateTimestamp(chat_timestamp) / 1000).to_i
            $xml.chattimeline(:in => chat_start, :direction => :down,  :name => chat_sender, :message => chat_message, :target => :chat )
          end
        end
        current_time += re[:stop_timestamp] - re[:start_timestamp]
      end
    }
  end
end

$vbox_width = 1600
$vbox_height = 1200
$magic_mystery_number = 2
$shapesold_svg_filename = 'shapes_old.svg'
$shapes_svg_filename = 'shapes.svg'
$panzooms_xml_filename = 'panzooms.xml'
$cursor_xml_filename = 'cursor.xml'

$originX = "NaN"
$originY = "NaN"
$originalOriginX = "NaN"
$originalOriginY = "NaN"

$rectangle_count = 0
$triangle_count = 0
$pencil_count = 0
$line_count = 0
$ellipse_count = 0
$text_count = 0
$poll_result_count = 0
$global_shape_count = -1
$global_slide_count = 1
$global_page_count = 0
$canvas_number = 0
$prev_clear_time = 0
$pageCleared = "0"
$page_number = 0
$prev_canvas_time_start = 0 # initial start is 0 seconds. (beginning of video)

$prev_time = "NaN"

$ss = {}
$clearPageTimes = {}
$slides_compiled = {}
$slides_raw = {}
$undos = {}

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :default => '58f4a6b3-cd07-444d-8564-59116cb53974', :type => String
end

$meeting_id = opts[:meeting_id]
puts $meeting_id
match = /(.*)-(.*)/.match $meeting_id
$meeting_id = match[1]
$playback = match[2]

puts $meeting_id
puts $playback

begin

  if ($playback == "presentation")

    # This script lives in scripts/archive/steps while properties.yaml lives in scripts/
    bbb_props = YAML::load(File.open('../../core/scripts/bigbluebutton.yml'))
    simple_props = YAML::load(File.open('presentation.yml'))

    log_dir = bbb_props['log_dir']

    logger = Logger.new("#{log_dir}/presentation/publish-#{$meeting_id}.log", 'daily' )
    BigBlueButton.logger = logger

    BigBlueButton.logger.info("Setting recording dir")
    recording_dir = bbb_props['recording_dir']
    BigBlueButton.logger.info("Setting process dir")
    $process_dir = "#{recording_dir}/process/presentation/#{$meeting_id}"
    BigBlueButton.logger.info("setting publish dir")
    publish_dir = simple_props['publish_dir']
    BigBlueButton.logger.info("setting playback url info")
    playback_protocol = bbb_props['playback_protocol']
    playback_host = bbb_props['playback_host']
    BigBlueButton.logger.info("setting target dir")
    target_dir = "#{recording_dir}/publish/presentation/#{$meeting_id}"
    if not FileTest.directory?(target_dir)
      BigBlueButton.logger.info("Making dir target_dir")
      FileUtils.mkdir_p target_dir

      package_dir = "#{target_dir}/#{$meeting_id}"
      BigBlueButton.logger.info("Making dir package_dir")
      FileUtils.mkdir_p package_dir

      begin

        if File.exist?("#{$process_dir}/webcams.webm")
          BigBlueButton.logger.info("Making video dir")
          video_dir = "#{package_dir}/video"
          FileUtils.mkdir_p video_dir
          BigBlueButton.logger.info("Made video dir - copying: #{$process_dir}/webcams.webm to -> #{video_dir}")
          FileUtils.cp("#{$process_dir}/webcams.webm", video_dir)
          BigBlueButton.logger.info("Copied .webm file")
        else
          audio_dir = "#{package_dir}/audio"
          BigBlueButton.logger.info("Making audio dir")
          FileUtils.mkdir_p audio_dir
          BigBlueButton.logger.info("Made audio dir - copying: #{$process_dir}/audio.webm to -> #{audio_dir}")
          FileUtils.cp("#{$process_dir}/audio.webm", audio_dir)
          BigBlueButton.logger.info("Copied audio.webm file - copying: #{$process_dir}/audio.ogg to -> #{audio_dir}")
          FileUtils.cp("#{$process_dir}/audio.ogg", audio_dir)
          BigBlueButton.logger.info("Copied audio.ogg file")
        end

        if File.exist?("#{$process_dir}/captions.json")
          BigBlueButton.logger.info("Copying caption files")
          FileUtils.cp("#{$process_dir}/captions.json", package_dir)
          Dir.glob("#{$process_dir}/caption_*.vtt").each do |caption|
            BigBlueButton.logger.debug(caption)
            FileUtils.cp(caption, package_dir)
          end
        end


        processing_time = File.read("#{$process_dir}/processing_time")

        # Retrieve record events and calculate total recording duration.
        $rec_events = BigBlueButton::Events.match_start_and_stop_rec_events(
          BigBlueButton::Events.get_start_and_stop_rec_events("#{$process_dir}/events.xml"))

        recording_time = BigBlueButton::Events.get_recording_length("#{$process_dir}/events.xml")

        # presentation_url = "/slides/" + $meeting_id + "/presentation"
        @doc = Nokogiri::XML(File.open("#{$process_dir}/events.xml"))

        $meeting_start = @doc.xpath("//event")[0][:timestamp]
        $meeting_end = @doc.xpath("//event").last()[:timestamp]

        ## These $version variables are not used anywere in this code ##
        $version = BigBlueButton::Events.bbb_version("#{$process_dir}/events.xml")
        $version_atleast_0_9_0 = BigBlueButton::Events.bbb_version_compare("#{$process_dir}/events.xml", 0, 9, 0)
        BigBlueButton.logger.info("Creating metadata.xml")

        # Get the real-time start and end timestamp
        match = /.*-(\d+)$/.match($meeting_id)
        real_start_time = match[1]
        real_end_time = (real_start_time.to_i + ($meeting_end.to_i - $meeting_start.to_i)).to_s

        #### INSTEAD OF CREATING THE WHOLE metadata.xml FILE AGAIN, ONLY ADD <playback>
        # Copy metadata.xml from process_dir
        FileUtils.cp("#{$process_dir}/metadata.xml", package_dir)
        BigBlueButton.logger.info("Copied metadata.xml file")

        # Update state and add playback to metadata.xml
        ## Load metadata.xml
        metadata = Nokogiri::XML(File.open("#{package_dir}/metadata.xml"))
        ## Update state
        recording = metadata.root
        state = recording.at_xpath("state")
        state.content = "published"
        published = recording.at_xpath("published")
        published.content = "true"
        ## Remove empty playback
        metadata.search('//recording/playback').each do |playback|
          playback.remove
        end
        ## Add the actual playback
        presentation = BigBlueButton::Presentation.get_presentation_for_preview("#{$process_dir}")
        metadata_with_playback = Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
            xml.playback {
              xml.format("presentation")
              xml.link("#{playback_protocol}://#{playback_host}/playback/presentation/0.9.0/playback.html?meetingId=#{$meeting_id}")
              xml.processing_time("#{processing_time}")
              xml.duration("#{recording_time}")
              unless presentation.empty?
                xml.extensions {
                  xml.preview {
                    xml.images {
                      presentation[:slides].each do |key,val|
                        attributes = {:width => "176", :height => "136", :alt => (val[:alt] != nil)? "#{val[:alt]}": ""}
                        xml.image(attributes){ xml.text("#{playback_protocol}://#{playback_host}/presentation/#{$meeting_id}/presentation/#{presentation[:id]}/thumbnails/thumb-#{key}.png") }
                      end
                    }
                  }
                }
              end
            }
        end
        ## Write the new metadata.xml
        metadata_file = File.new("#{package_dir}/metadata.xml","w")
        metadata = Nokogiri::XML(metadata.to_xml) { |x| x.noblanks }
        metadata_file.write(metadata.root)
        metadata_file.close
        BigBlueButton.logger.info("Added playback to metadata.xml")

        #Create slides.xml
        BigBlueButton.logger.info("Generating xml for slides and chat")

        # Gathering all the events from the events.xml
        $slides_events = @doc.xpath("//event[@eventname='GotoSlideEvent' or @eventname='SharePresentationEvent']")
        $chat_events = @doc.xpath("//event[@eventname='PublicChatEvent']")
        $shape_events = @doc.xpath("//event[@eventname='AddShapeEvent' or @eventname='ModifyTextEvent']") # for the creation of shapes
        $panzoom_events = @doc.xpath("//event[@eventname='ResizeAndMoveSlideEvent']") # for the action of panning and/or zooming
        $cursor_events = @doc.xpath("//event[@eventname='CursorMoveEvent']")
        $clear_page_events = @doc.xpath("//event[@eventname='ClearPageEvent']") # for clearing the svg image
        $undo_events = @doc.xpath("//event[@eventname='UndoShapeEvent']") # for undoing shapes.
        $join_time = $meeting_start.to_f
        $end_time = $meeting_end.to_f

        calculateRecordEventsOffset()

        first_presentation_start_node = @doc.xpath("//event[@eventname='SharePresentationEvent']")
        first_presentation_start = $meeting_end
        if not first_presentation_start_node.empty?
          first_presentation_start = first_presentation_start_node[0][:timestamp]
        end
        $first_slide_start = ( translateTimestamp(first_presentation_start) / 1000 ).round(1)

        processChatMessages()

        processShapesAndClears()

        processPanAndZooms()

        processCursorEvents()

        # Write slides.xml to file
        File.open("#{package_dir}/slides_new.xml", 'w') { |f| f.puts $slides_doc.to_xml }
        # Write shapes.svg to file
        File.open("#{package_dir}/#{$shapes_svg_filename}", 'w') { |f| f.puts $shapes_svg.to_xml.gsub(%r"\s*\<g.*/\>", "") } #.gsub(%r"\s*\<g.*\>\s*\</g\>", "") }

        # Write panzooms.xml to file
        File.open("#{package_dir}/#{$panzooms_xml_filename}", 'w') { |f| f.puts $panzooms_xml.to_xml }

        # Write panzooms.xml to file
        File.open("#{package_dir}/#{$cursor_xml_filename}", 'w') { |f| f.puts $cursor_xml.to_xml }

        BigBlueButton.logger.info("Copying files to package dir")
        FileUtils.cp_r("#{$process_dir}/presentation", package_dir)
        BigBlueButton.logger.info("Copied files to package dir")

        BigBlueButton.logger.info("Publishing slides")
        # Now publish this recording files by copying them into the publish folder.
        if not FileTest.directory?(publish_dir)
          FileUtils.mkdir_p publish_dir
        end
        FileUtils.cp_r(package_dir, publish_dir) # Copy all the files.
        BigBlueButton.logger.info("Finished publishing script presentation.rb successfully.")

        BigBlueButton.logger.info("Removing processed files.")
        FileUtils.rm_r(Dir.glob("#{$process_dir}/*"))

        BigBlueButton.logger.info("Removing published files.")
        FileUtils.rm_r(Dir.glob("#{target_dir}/*"))
        rescue  Exception => e
          BigBlueButton.logger.error(e.message)
          e.backtrace.each do |traceline|
          BigBlueButton.logger.error(traceline)
        end
        exit 1
      end
      publish_done = File.new("#{recording_dir}/status/published/#{$meeting_id}-presentation.done", "w")
      publish_done.write("Published #{$meeting_id}")
      publish_done.close

    else
      BigBlueButton.logger.info("#{target_dir} is already there")
    end
  end


rescue Exception => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
  publish_done = File.new("#{recording_dir}/status/published/#{$meeting_id}-presentation.fail", "w")
  publish_done.write("Failed Publishing #{$meeting_id}")
  publish_done.close

  exit 1
end


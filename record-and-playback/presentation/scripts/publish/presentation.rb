# Set encoding to utf-8
# frozen_string_literal: false

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

_performance_start = Time.now

# For DEVELOPMENT
# Allows us to run the script manually
require File.expand_path('../../../core/lib/recordandplayback', __dir__)

# For PRODUCTION
# require File.expand_path('../../../lib/recordandplayback', __FILE__)

require 'rubygems'
require 'optimist'
require 'yaml'
require 'builder'
require 'fastimage' # require fastimage to get the image size of the slides (gem install fastimage)
require 'json'

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
bbb_props = BigBlueButton.read_props
@presentation_props = YAML.safe_load(File.read('presentation.yml'))

# There's a couple of places where stuff is mysteriously divided or multiplied
# by 2. This is just here to call out how spooky that is.
@magic_mystery_number = 2

def scale_to_deskshare_video(width, height)
  deskshare_video_height = @presentation_props['deskshare_output_height'].to_f
  deskshare_video_width = @presentation_props['deskshare_output_height'].to_f

  scale = [deskshare_video_width / width, deskshare_video_height / height]
  video_width = width * scale.min
  video_height = height * scale.min

  [video_width.floor, video_height.floor]
end

def get_deskshare_video_dimension(deskshare_stream_name)
  video_width = @presentation_props['deskshare_output_height'].to_f
  video_height = @presentation_props['deskshare_output_height'].to_f
  deskshare_video_filename = "#{@deskshare_dir}/#{deskshare_stream_name}"

  if File.exist?(deskshare_video_filename)
    video_info = BigBlueButton::EDL::Video.video_info(deskshare_video_filename)
    video_width, video_height = scale_to_deskshare_video(video_info[:width], video_info[:height])
  else
    BigBlueButton.logger.error("Could not find deskshare video: #{deskshare_video_filename}")
  end

  [video_width, video_height]
end

#
# Calculate the offsets based on the start and stop recording events, so it's easier
# to translate the timestamps later based on these offsets
#
def calculate_record_events_offset
  accumulated_duration = 0
  previous_stop_recording = @meeting_start.to_f
  @rec_events.each do |event|
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
def translate_timestamp(timestamp)
  new_timestamp = translate_timestamp_helper(timestamp.to_f).to_f
  BigBlueButton.logger.info("Translating #{timestamp}, old value=#{timestamp.to_f - @meeting_start.to_f}, new value=#{new_timestamp}")
  new_timestamp
end

#
# Translated an arbitrary Unix timestamp to the recording timestamp
#
def translate_timestamp_helper(timestamp)
  @rec_events.each do |event|
    # if the timestamp comes before the start recording event, then the timestamp is translated to the moment it starts recording
    return event[:start_timestamp] - event[:offset] if timestamp <= event[:start_timestamp]

    # if the timestamp is during the recording period, it is just translated to the new one using the offset
    return timestamp - event[:offset] if (timestamp > event[:start_timestamp]) && (timestamp <= event[:stop_timestamp])
  end

  # if the timestamp comes after the last stop recording event, then the timestamp is translated to the last stop recording event timestamp
  timestamp - @rec_events.last[:offset] + @rec_events.last[:duration]
end

def color_to_hex(color)
  color = color.to_i.to_s(16)
  '0' * (6 - color.length) + color
end

def shape_scale_width(slide, x)
  (x / 100.0 * slide[:width]).round(5)
end

def shape_scale_height(slide, y)
  (y / 100.0 * slide[:height]).round(5)
end

def shape_thickness(slide, shape)
  if !shape[:thickness_percent].nil?
    shape_scale_width(slide, shape[:thickness_percent])
  else
    shape[:thickness]
  end
end

def svg_render_shape_pencil(g, slide, shape)
  g['shape'] = "pencil#{shape[:shape_unique_id]}"

  doc = g.document

  if shape[:data_points].length < 2
    BigBlueButton.logger.warn("Pencil #{shape[:shape_unique_id]} doesn't have enough points")
    return
  end

  if shape[:data_points].length == 2
    # BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing single point")
    g['style'] = "stroke:none;fill:##{shape[:color]};visibility:hidden"
    circle = doc.create_element('circle',
                                cx: shape_scale_width(slide, shape[:data_points][0]),
                                cy: shape_scale_height(slide, shape[:data_points][1]),
                                r: (shape_thickness(slide, shape) / 2.0).round(5))
    g << circle
  else
    path = []
    data_points = shape[:data_points].each

    if !shape[:commands].nil?
      # BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing from command string (#{shape[:commands].length} commands)")
      shape[:commands].each do |command|
        case command
        when 1 # MOVE_TO
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path.push("M#{x} #{y}")
        when 2 # LINE_TO
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path.push("L#{x} #{y}")
        when 3 # Q_CURVE_TO
          cx1 = shape_scale_width(slide, data_points.next)
          cy1 = shape_scale_height(slide, data_points.next)
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path.push("Q#{cx1} #{cy1},#{x} #{y}")
        when 4 # C_CURVE_TO
          cx1 = shape_scale_width(slide, data_points.next)
          cy1 = shape_scale_height(slide, data_points.next)
          cx2 = shape_scale_width(slide, data_points.next)
          cy2 = shape_scale_height(slide, data_points.next)
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path.push("C#{cx1} #{cy1},#{cx2} #{cy2},#{x} #{y}")
        else
          raise "Unknown pencil command: #{command}"
        end
      end
    else
      # BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing simple line (#{shape[:data_points].length / 2} points)")
      x = shape_scale_width(slide, data_points.next)
      y = shape_scale_height(slide, data_points.next)
      path << "M#{x} #{y}"
      begin
        loop do
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path << "L#{x} #{y}"
        end
      rescue StopIteration
      end
    end

    path = path.join('')
    g['style'] =
      "stroke:##{shape[:color]};stroke-linecap:round;stroke-linejoin:round;stroke-width:#{shape_thickness(slide,
                                                                                                          shape)};visibility:hidden;fill:none"
    svg_path = doc.create_element('path', d: path)
    g << svg_path
  end
end

def svg_render_shape_line(g, slide, shape)
  g['shape'] = "line#{shape[:shape_unique_id]}"
  g['style'] =
    "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,
                                                             shape)};visibility:hidden;fill:none#{@version_atleast_2_0_0 ? ';stroke-linecap:butt' : ';stroke-linecap:round'}"

  doc = g.document
  data_points = shape[:data_points]
  line = doc.create_element('line',
                            x1: shape_scale_width(slide, data_points[0]),
                            y1: shape_scale_height(slide, data_points[1]),
                            x2: shape_scale_width(slide, data_points[2]),
                            y2: shape_scale_height(slide, data_points[3]))
  g << line
end

def stroke_attributes(slide, shape)
  "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,
                                                           shape)};visibility:hidden;fill:#{shape[:fill] ? "##{shape[:color]}" : 'none'}"
end

def svg_render_shape_rect(g, slide, shape)
  g['shape'] = "rect#{shape[:shape_unique_id]}"
  g['style'] =
    "#{stroke_attributes(slide, shape)}#{@version_atleast_2_0_0 ? ';stroke-linejoin:miter' : ';stroke-linejoin:round'}"

  doc = g.document
  data_points = shape[:data_points]
  x1 = shape_scale_width(slide, data_points[0])
  y1 = shape_scale_height(slide, data_points[1])
  x2 = shape_scale_width(slide, data_points[2])
  y2 = shape_scale_height(slide, data_points[3])

  width = (x2 - x1).abs
  # height = (y2 - y1).abs

  if shape[:square]
    # Convert to a square, keeping aligned with the start point.
    if x2 > x1
      y2 = y1 + width
    else
      # This replicates a bug in the BigBlueButton flash client
      BigBlueButton.logger.info("Rect #{shape[:shape_unique_id]} reversed square bug")
      y2 = y1 - width
    end
  end

  path = doc.create_element('path',
                            d: "M#{x1} #{y1}L#{x2} #{y1}L#{x2} #{y2}L#{x1} #{y2}Z")
  g << path
end

def svg_render_shape_triangle(g, slide, shape)
  g['shape'] = "triangle#{shape[:shape_unique_id]}"
  g['style'] =
    "#{stroke_attributes(slide,
                         shape)}#{@version_atleast_2_0_0 ? ';stroke-linejoin:miter;stroke-miterlimit:8' : ';stroke-linejoin:round'}"

  doc = g.document
  data_points = shape[:data_points]
  x1 = shape_scale_width(slide, data_points[0])
  y1 = shape_scale_height(slide, data_points[1])
  x2 = shape_scale_width(slide, data_points[2])
  y2 = shape_scale_height(slide, data_points[3])

  px = ((x1 + x2) / 2.0).round(5)

  path = doc.create_element('path',
                            d: "M#{px} #{y1}L#{x2} #{y2}L#{x1} #{y2}Z")
  g << path
end

def svg_render_shape_ellipse(g, slide, shape)
  g['shape'] = "ellipse#{shape[:shape_unique_id]}"
  g['style'] = stroke_attributes(slide, shape)

  doc = g.document
  data_points = shape[:data_points]
  x1 = shape_scale_width(slide, data_points[0])
  y1 = shape_scale_height(slide, data_points[1])
  x2 = shape_scale_width(slide, data_points[2])
  y2 = shape_scale_height(slide, data_points[3])

  width_r = ((x2 - x1).abs / 2.0).round(5)
  height_r = ((y2 - y1).abs / 2.0).round(5)
  hx = ((x1 + x2) / 2.0).round(5)
  hy = ((y1 + y2) / 2.0).round(5)

  if shape[:circle]
    # Convert to a circle, keeping aligned with the start point
    height_r = width_r
    if x2 > x1
      y2 = y1 + height_r + height_r
    else
      # This replicates a bug in the BigBlueButton flash client
      BigBlueButton.logger.info("Ellipse #{shape[:shape_unique_id]} reversed circle bug")
      y2 = y1 - height_r - height_r
    end
  end

  # Normalize the x,y coordinates
  x1, x2 = x2, x1 if x1 > x2
  y1, y2 = y2, y1 if y1 > y2

  # SVG's ellipse element doesn't render if r_x or r_y is 0, but
  # we want to display a line segment in that case. But the SVG
  # path element's elliptical arc code renders r_x or r_y
  # degenerate cases as line segments, so we can use that.
  path = "M#{x1} #{hy}" \
          "A#{width_r} #{height_r} 0 0 1 #{hx} #{y1}" \
          "A#{width_r} #{height_r} 0 0 1 #{x2} #{hy}" \
          "A#{width_r} #{height_r} 0 0 1 #{hx} #{y2}" \
          "A#{width_r} #{height_r} 0 0 1 #{x1} #{hy}" \
          'Z'

  svg_path = doc.create_element('path', d: path)
  g << svg_path
end

def svg_render_shape_text(g, slide, shape)
  g['shape'] = "text#{shape[:shape_unique_id]}"

  doc = g.document
  data_points = shape[:data_points]
  x = shape_scale_width(slide, data_points[0])
  y = shape_scale_height(slide, data_points[1])
  width = shape_scale_width(slide, shape[:text_box_width])
  height = shape_scale_height(slide, shape[:text_box_height])
  font_size = shape_scale_height(slide, shape[:calced_font_size])

  # BigBlueButton.logger.info("Text #{shape[:shape_unique_id]} width #{width} height #{height} font size #{font_size}")
  g['style'] = "color:##{shape[:font_color]};word-wrap:break-word;visibility:hidden;font-family:Arial;font-size:#{font_size}px"

  switch = doc.create_element('switch')
  fo = doc.create_element('foreignObject',
                          width: width, height: height, x: x, y: y)
  p = doc.create_element('p',
                         xmlns: 'http://www.w3.org/1999/xhtml', style: 'margin:0;padding:0')
  shape[:text].each_line.with_index do |line, index|
    p << doc.create_element('br') if index.positive?
    p << doc.create_text_node(line.chomp)
  end
  fo << p
  switch << fo
  g << switch
end

def svg_render_shape_poll(g, slide, shape)
  poll_id = shape[:shape_unique_id]
  g['shape'] = "poll#{poll_id}"
  g['style'] = 'visibility:hidden'

  doc = g.document
  data_points = shape[:data_points]
  x = shape_scale_width(slide, data_points[0])
  y = shape_scale_height(slide, data_points[1])
  width = shape_scale_width(slide, data_points[2])
  height = shape_scale_height(slide, data_points[3])

  result = shape[:result]
  num_responders = shape[:num_responders]
  presentation = slide[:presentation]

  json_file = "#{@process_dir}/poll_result#{poll_id}.json"
  svg_file = "#{@process_dir}/presentation/#{presentation}/poll_result#{poll_id}.svg"

  # Save the poll json to a temp file
  IO.write(json_file, result)
  # Render the poll svg
  ret = BigBlueButton.exec_ret('utils/gen_poll_svg', '-i', json_file, '-w', width.round.to_s, '-h', height.round.to_s, '-n',
                               num_responders.to_s, '-o', svg_file)
  raise 'Failed to generate poll svg' if ret != 0

  # Poll image
  g << doc.create_element('image',
                          'xlink:href' => "presentation/#{presentation}/poll_result#{poll_id}.svg",
                          width: width, height: height, x: x, y: y)
end

def svg_render_shape(canvas, slide, shape, image_id)
  if shape[:in] == shape[:out]
    BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} is never shown (duration rounds to 0)")
    return
  end

  if (shape[:in] >= slide[:out]) ||
     (!shape[:out].nil? && (shape[:out] <= slide[:in]))
    BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} is not visible during image time span")
    return
  end

  # BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} Type #{shape[:type]} from #{shape[:in]} to #{shape[:out]} undo #{shape[:undo]}")

  doc = canvas.document
  g = doc.create_element('g',
                         id: "image#{image_id}-draw#{shape[:shape_id]}", class: 'shape',
                         timestamp: shape[:in], undo: (shape[:undo].nil? ? -1 : shape[:undo]))

  case shape[:type]
  when 'pencil'
    svg_render_shape_pencil(g, slide, shape)
  when 'line'
    svg_render_shape_line(g, slide, shape)
  when 'rectangle'
    svg_render_shape_rect(g, slide, shape)
  when 'triangle'
    svg_render_shape_triangle(g, slide, shape)
  when 'ellipse'
    svg_render_shape_ellipse(g, slide, shape)
  when 'text'
    svg_render_shape_text(g, slide, shape)
  when 'poll_result'
    svg_render_shape_poll(g, slide, shape)
  else
    BigBlueButton.logger.warn("Ignoring unhandled shape type #{shape[:type]}")
  end

  g[:shape] = "image#{image_id}-#{g[:shape]}"

  canvas << g unless g.element_children.empty?
end

@svg_image_id = 1
def svg_render_image(svg, slide, shapes)
  if slide[:in] == slide[:out]
    BigBlueButton.logger.info("Presentation #{slide[:presentation]} Slide #{slide[:slide]} is never shown (duration rounds to 0)")
    return
  end

  image_id = @svg_image_id
  @svg_image_id += 1

  BigBlueButton.logger.info("Image #{image_id}: Presentation #{slide[:presentation]} Slide #{slide[:slide]} Deskshare #{slide[:deskshare]} from #{slide[:in]} to #{slide[:out]}")

  doc = svg.document
  image = doc.create_element('image',
                             id: "image#{image_id}", class: 'slide',
                             in: slide[:in], out: slide[:out],
                             'xlink:href' => slide[:src],
                             width: slide[:width], height: slide[:height], x: 0, y: 0,
                             style: 'visibility:hidden')
  image['text'] = slide[:text] unless slide[:text].nil?
  svg << image

  if slide[:deskshare] ||
     shapes[slide[:presentation]].nil? ||
     shapes[slide[:presentation]][slide[:slide]].nil?
    return
  end

  shapes = shapes[slide[:presentation]][slide[:slide]]

  canvas = doc.create_element('g',
                              class: 'canvas', id: "canvas#{image_id}",
                              image: "image#{image_id}", display: 'none')

  shapes.each do |shape|
    svg_render_shape(canvas, slide, shape, image_id)
  end

  svg << canvas unless canvas.element_children.empty?
end

def panzoom_viewbox(panzoom)
  if panzoom[:deskshare]
    panzoom[:x_offset] = 0.0
    panzoom[:y_offset] = 0.0
    panzoom[:width_ratio] = 100.0
    panzoom[:height_ratio] = 100.0
  end

  x = (-panzoom[:x_offset] * @magic_mystery_number / 100.0 * panzoom[:width]).round(5)
  y = (-panzoom[:y_offset] * @magic_mystery_number / 100.0 * panzoom[:height]).round(5)
  w = shape_scale_width(panzoom, panzoom[:width_ratio])
  h = shape_scale_height(panzoom, panzoom[:height_ratio])

  [x, y, w, h]
end

def panzooms_emit_event(rec, panzoom)
  if panzoom[:in] == panzoom[:out]
    BigBlueButton.logger.info('Panzoom: not emitting, duration rounds to 0')
    return
  end

  rec.event(timestamp: panzoom[:in]) do
    x, y, w, h = panzoom_viewbox(panzoom)
    rec.viewBox("#{x} #{y} #{w} #{h}")
    # BigBlueButton.logger.info("Panzoom viewbox #{x} #{y} #{w} #{h}" at #{panzoom[:in]}")
  end
end

def cursors_emit_event(rec, cursor)
  if cursor[:in] == cursor[:out]
    # BigBlueButton.logger.info('Cursor: not emitting, duration rounds to 0')
    return
  end

  rec.event(timestamp: cursor[:in]) do
    panzoom = cursor[:panzoom]
    if cursor[:visible]
      if @version_atleast_2_0_0
        # In BBB 2.0, the cursor now uses the same coordinate system as annotations
        # Use the panzoom information to convert it to be relative to viewbox
        x = (((cursor[:x] / 100.0) + (panzoom[:x_offset] * @magic_mystery_number / 100.0)) /
             (panzoom[:width_ratio] / 100.0)).round(5)
        y = (((cursor[:y] / 100.0) + (panzoom[:y_offset] * @magic_mystery_number / 100.0)) /
             (panzoom[:height_ratio] / 100.0)).round(5)
        if x.negative? || (x > 1) || y.negative? || (y > 1)
          x = -1.0
          y = -1.0
        end
      else
        # Cursor position is relative to the visible area
        x = cursor[:x].round(5)
        y = cursor[:y].round(5)
      end
    else
      x = -1.0
      y = -1.0
    end

    rec.cursor("#{x} #{y}")
  end

  # BigBlueButton.logger.info("Cursor #{cursor_e.content} at #{cursor[:in]}")
end

@svg_shape_id = 1
@svg_shape_unique_id = 1

def determine_presentation(presentation, current_presentation)
  return current_presentation if presentation.nil?

  presentation.text
end

def determine_slide_number(slide, current_slide)
  return current_slide if slide.nil?

  slide = slide.text.to_i
  slide -= 1 unless @version_atleast_0_9_0
  slide
end

def events_parse_shape(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this shape is for, with fallbacks
  # for old BBB where this info isn't in the shape messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')

  presentation = determine_presentation(presentation, current_presentation)
  slide = determine_slide_number(slide, current_slide)

  # Set up the shapes data structures if needed
  shapes[presentation] = {} if shapes[presentation].nil?
  shapes[presentation][slide] = [] if shapes[presentation][slide].nil?

  # We only need to deal with shapes for this slide
  shapes = shapes[presentation][slide]

  # Set up the structure for this shape
  shape = {}
  # Common properties
  shape[:in] = timestamp
  shape[:type] = event.at_xpath('type').text
  shape[:data_points] = event.at_xpath('dataPoints').text.split(',').map(&:to_f)

  # These can be missing in old BBB versions, there are fallbacks
  user_id = event.at_xpath('userId')
  shape[:user_id] = user_id.text unless user_id.nil?
  shape_id = event.at_xpath('id')
  shape[:id] = shape_id.text unless shape_id.nil?
  status = event.at_xpath('status')
  shape[:status] = status.text unless status.nil?
  shape[:shape_id] = @svg_shape_id
  @svg_shape_id += 1

  # Some shape-specific properties
  if %w[ellipse line pencil rectangle triangle].include?(shape[:type])
    shape[:color] = color_to_hex(event.at_xpath('color').text)
    thickness = event.at_xpath('thickness')
    unless thickness
      BigBlueButton.logger.warn("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} ID #{shape[:id]} is missing thickness")
      return
    end
    if @version_atleast_2_0_0
      shape[:thickness_percent] = thickness.text.to_f
    else
      shape[:thickness] = thickness.text.to_i
    end
  end
  if %w[ellipse rectangle triangle].include?(shape[:type])
    fill = event.at_xpath('fill')
    fill = fill.nil? ? 'false' : fill.text
    shape[:fill] = fill =~ /true/ ? true : false
  end

  case shape[:type]
  when 'rectangle'
    square = event.at_xpath('square')
    shape[:square] = (square.text == 'true') unless square.nil?
  when 'ellipse'
    circle = event.at_xpath('circle')
    shape[:circle] = (circle.text == 'true') unless circle.nil?
  when 'pencil'
    commands = event.at_xpath('commands')
    shape[:commands] = commands.text.split(',').map(&:to_i) unless commands.nil?
  when 'poll_result'
    shape[:num_responders] = event.at_xpath('num_responders').text.to_i
    shape[:num_respondents] = event.at_xpath('num_respondents').text.to_i
    shape[:result] = event.at_xpath('result').text
  when 'text'
    shape[:text_box_width] = event.at_xpath('textBoxWidth').text.to_f
    shape[:text_box_height] = event.at_xpath('textBoxHeight').text.to_f

    calced_font_size = event.at_xpath('calcedFontSize')
    unless calced_font_size
      BigBlueButton.logger.warn("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} ID #{shape[:id]} is missing calcedFontSize")
      return
    end

    shape[:calced_font_size] = calced_font_size.text.to_f

    shape[:font_color] = color_to_hex(event.at_xpath('fontColor').text)
    text = event.at_xpath('text')
    shape[:text] = !text.nil? ? text.text : ''
  end

  # Find the previous shape, for updates
  prev_shape = nil
  if !shape[:id].nil?
    # If we have a shape ID, look up the previous shape by ID
    # Don't look for updates if the drawing has ended
    unless shape[:status] == 'DRAW_END'
      prev_shape_pos = shapes.rindex { |s| s[:id] == shape[:id] }
      prev_shape = prev_shape_pos.nil? ? nil : shapes[prev_shape_pos]
    end
  else
    # No shape ID, so do heuristic matching. If the previous shape had the
    # same type and same first two data points, update it.
    last_shape = shapes.last
    if (last_shape[:type] == shape[:type]) &&
       (last_shape[:data_points][0] == shape[:data_points][0]) &&
       (last_shape[:data_points][1] == shape[:data_points][1])
      prev_shape = last_shape
    end
  end
  if !prev_shape.nil?
    prev_shape[:out] = timestamp
    shape[:shape_unique_id] = prev_shape[:shape_unique_id]

    if (shape[:type] == 'pencil') && (shape[:status] == 'DRAW_UPDATE')
      # BigBlueButton 2.0 quirk - 'DRAW_UPDATE' events on pencil tool only
      # include newly added points, rather than the full list.
      shape[:data_points] = prev_shape[:data_points] + shape[:data_points]
    end
  else
    shape[:shape_unique_id] = @svg_shape_unique_id
    @svg_shape_unique_id += 1
  end

  # BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} ID #{shape[:id]} Type #{shape[:type]}")
  shapes << shape
end

def events_parse_undo(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this undo is for, with fallbacks
  # for old BBB where this info isn't in the undo messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')

  presentation = determine_presentation(presentation, current_presentation)
  slide = determine_slide_number(slide, current_slide)

  # Newer undo messages have the shape id, making this a lot easier
  shape_id = event.at_xpath('shapeId')
  shape_id = shape_id.text unless shape_id.nil?

  # Set up the shapes data structures if needed
  shapes[presentation] = {} if shapes[presentation].nil?
  shapes[presentation][slide] = [] if shapes[presentation][slide].nil?

  # We only need to deal with shapes for this slide
  shapes = shapes[presentation][slide]

  if !shape_id.nil?
    # If we have the shape id, we simply have to update the undo time on
    # all the shapes with that id.
    BigBlueButton.logger.info("Undo: removing shape with ID #{shape_id} at #{timestamp}")
    shapes.each do |shape|
      next unless shape[:id] == shape_id

      shape[:undo] = timestamp if shape[:undo].nil? || (shape[:undo] > timestamp)
    end
  else
    # The undo command removes the most recently added shape that has not
    # already been removed by another undo or clear. Find that shape.
    undo_pos = shapes.rindex { |s| s[:undo].nil? }
    undo_shape = undo_pos.nil? ? nil : shapes[undo_pos]
    if !undo_shape.nil?
      BigBlueButton.logger.info("Undo: removing Shape #{undo_shape[:shape_unique_id]} at #{timestamp}")
      # We have an id number assigned to associate all the updated versions
      # of the same shape. Use that to determine which shapes to apply undo
      # times to.
      shapes.each do |shape|
        next unless shape[:shape_unique_id] == undo_shape[:shape_unique_id]

        shape[:undo] = timestamp if shape[:undo].nil? || (shape[:undo] > timestamp)
      end
    else
      BigBlueButton.logger.info('Undo: no applicable shapes found')
    end
  end
end

def events_parse_clear(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this clear is for, with fallbacks
  # for old BBB where this info isn't in the clear messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')

  presentation = determine_presentation(presentation, current_presentation)
  slide = determine_slide_number(slide, current_slide)

  # BigBlueButton 2.0 per-user clear features; default to full clear on older versions
  full_clear = event.at_xpath('fullClear')
  full_clear = !full_clear.nil? ? (full_clear.text == 'true') : true
  user_id = event.at_xpath('userId')
  user_id = user_id.text unless user_id.nil?

  # Set up the shapes data structures if needed
  shapes[presentation] = {} if shapes[presentation].nil?
  shapes[presentation][slide] = [] if shapes[presentation][slide].nil?

  # We only need to deal with shapes for this slide
  shapes = shapes[presentation][slide]

  full_clear ? BigBlueButton.logger.info('Clear: removing all shapes') : BigBlueButton.logger.info("Clear: removing shapes for User #{user_id}")

  shapes.each do |shape|
    if (full_clear || (user_id == shape[:user_id])) && (shape[:undo].nil? || (shape[:undo] > timestamp))
      shape[:undo] = timestamp
    end
  end
end

def events_get_image_info(slide)
  if slide[:deskshare]
    slide[:src] = 'presentation/deskshare.png'
  elsif slide[:presentation] == ''
    slide[:src] = 'presentation/logo.png'
  else
    slide[:src] = "presentation/#{slide[:presentation]}/slide-#{slide[:slide] + 1}.png"
    slide[:text] = "presentation/#{slide[:presentation]}/textfiles/slide-#{slide[:slide] + 1}.txt"
  end
  image_path = "#{@process_dir}/#{slide[:src]}"

  unless File.exist?(image_path)
    BigBlueButton.logger.warn("Missing image file #{image_path}!")
    # Emergency last-ditch blank image creation
    FileUtils.mkdir_p(File.dirname(image_path))
    command = \
      if slide[:deskshare]
        ['convert', '-size',
         "#{@presentation_props['deskshare_output_width']}x#{@presentation_props['deskshare_output_height']}", 'xc:transparent', '-background', 'transparent', image_path,]
      else
        ['convert', '-size', '1600x1200', 'xc:transparent', '-background', 'transparent', '-quality', '90', '+dither',
         '-depth', '8', '-colors', '256', image_path,]
      end
    BigBlueButton.exec_ret(*command) || raise("Unable to generate blank image for #{image_path}")
  end

  slide[:width], slide[:height] = FastImage.size(image_path)
  BigBlueButton.logger.info("Image size is #{slide[:width]}x#{slide[:height]}")
end

# Create the shapes.svg, cursors.xml, and panzooms.xml files used for
# rendering the presentation area
def process_presentation(package_dir)
  shapes_doc = Nokogiri::XML::Document.new
  shapes_doc.create_internal_subset('svg', '-//W3C//DTD SVG 1.1//EN',
                                    'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')
  svg = shapes_doc.root = shapes_doc.create_element('svg',
                                                    id: 'svgfile',
                                                    style: 'position:absolute;height:600px;width:800px',
                                                    xmlns: 'http://www.w3.org/2000/svg',
                                                    'xmlns:xlink' => 'http://www.w3.org/1999/xlink',
                                                    version: '1.1',
                                                    viewBox: '0 0 800 600')

  panzooms_rec = Builder::XmlMarkup.new(indent: 2, margin: 1)
  cursors_rec = Builder::XmlMarkup.new(indent: 2, margin: 1)

  # Current presentation/slide state
  current_presentation_slide = {}
  current_presentation = ''
  current_slide = 0
  # Current pan/zoom state
  current_x_offset = 0.0
  current_y_offset = 0.0
  current_width_ratio = 100.0
  current_height_ratio = 100.0
  # Current cursor status
  cursor_x = -1.0
  cursor_y = -1.0
  cursor_visible = false
  presenter = nil
  # Current deskshare state (affects presentation and pan/zoom)
  deskshare = false

  slides = []
  panzooms = []
  cursors = []
  shapes = {}

  # Iterate through the events.xml and store the events, building the
  # xml files as we go
  last_timestamp = 0.0
  events_xml = Nokogiri::XML(File.read("#{@process_dir}/events.xml"))
  events_xml.xpath('/recording/event').each do |event|
    eventname = event['eventname']
    last_timestamp = timestamp =
      (translate_timestamp(event['timestamp']) / 1000.0).round(1)

    # Make sure to add initial entries to the slide & panzoom lists
    slide_changed = slides.empty?
    panzoom_changed = panzooms.empty?
    cursor_changed = cursors.empty?

    # Do event specific processing
    case eventname
    when 'SharePresentationEvent'
      current_presentation = event.at_xpath('presentationName').text
      current_slide = current_presentation_slide[current_presentation].to_i
      slide_changed = true
      panzoom_changed = true

    when 'GotoSlideEvent'
      current_slide = event.at_xpath('slide').text.to_i
      current_presentation_slide[current_presentation] = current_slide
      slide_changed = true
      panzoom_changed = true

    when 'ResizeAndMoveSlideEvent'
      current_x_offset = event.at_xpath('xOffset').text.to_f
      current_y_offset = event.at_xpath('yOffset').text.to_f
      current_width_ratio = event.at_xpath('widthRatio').text.to_f
      current_height_ratio = event.at_xpath('heightRatio').text.to_f
      panzoom_changed = true

    when 'DeskshareStartedEvent', 'StartWebRTCDesktopShareEvent'
      if @presentation_props['include_deskshare']
        deskshare = true
        slide_changed = true
      end

    when 'DeskshareStoppedEvent', 'StopWebRTCDesktopShareEvent'
      if @presentation_props['include_deskshare']
        deskshare = false
        slide_changed = true
      end

    when 'AddShapeEvent', 'ModifyTextEvent'
      events_parse_shape(shapes, event, current_presentation, current_slide, timestamp)

    when 'UndoShapeEvent', 'UndoAnnotationEvent'
      events_parse_undo(shapes, event, current_presentation, current_slide, timestamp)

    when 'ClearPageEvent', 'ClearWhiteboardEvent'
      events_parse_clear(shapes, event, current_presentation, current_slide, timestamp)

    when 'AssignPresenterEvent'
      # Move cursor offscreen on presenter switch, it'll reappear if the new
      # presenter moves it
      presenter = event.at_xpath('userid').text
      cursor_visible = false
      cursor_changed = true

    when 'CursorMoveEvent'
      cursor_x = event.at_xpath('xOffset').text.to_f
      cursor_y = event.at_xpath('yOffset').text.to_f
      cursor_visible = true
      cursor_changed = true

    when 'WhiteboardCursorMoveEvent'
      user_id = event.at_xpath('userId')
      # Only draw cursor for current presentor. TODO multi-cursor support
      if user_id.nil? || (user_id.text == presenter)
        cursor_x = event.at_xpath('xOffset').text.to_f
        cursor_y = event.at_xpath('yOffset').text.to_f
        cursor_visible = true
        cursor_changed = true
      end
    end
    # Perform slide finalization
    if slide_changed
      slide = slides.last
      if !slide.nil? &&
         (slide[:presentation] == current_presentation) &&
         (slide[:slide] == current_slide) &&
         (slide[:deskshare] == deskshare)
        BigBlueButton.logger.info('Presentation/Slide: skipping, no changes')
        # slide_changed = false
      else
        unless slide.nil?
          slide[:out] = timestamp
          svg_render_image(svg, slide, shapes)
        end

        BigBlueButton.logger.info("Presentation #{current_presentation} Slide #{current_slide} Deskshare #{deskshare}")
        slide = {
          presentation: current_presentation,
          slide: current_slide,
          in: timestamp,
          deskshare: deskshare,
        }
        events_get_image_info(slide)
        slides << slide
      end
    end

    # Perform panzoom finalization
    if panzoom_changed
      slide = slides.last
      panzoom = panzooms.last
      if !panzoom.nil? &&
         (panzoom[:x_offset] == current_x_offset) &&
         (panzoom[:y_offset] == current_y_offset) &&
         (panzoom[:width_ratio] == current_width_ratio) &&
         (panzoom[:height_ratio] == current_height_ratio) &&
         (panzoom[:width] == slide[:width]) &&
         (panzoom[:height] == slide[:height]) &&
         (panzoom[:deskshare] == deskshare)
        BigBlueButton.logger.info('Panzoom: skipping, no changes')
        panzoom_changed = false
      else
        unless panzoom.nil?
          panzoom[:out] = timestamp
          panzooms_emit_event(panzooms_rec, panzoom)
        end
        BigBlueButton.logger.info("Panzoom: #{current_x_offset} #{current_y_offset} #{current_width_ratio} #{current_height_ratio} (#{slide[:width]}x#{slide[:height]})")
        panzoom = {
          x_offset: current_x_offset,
          y_offset: current_y_offset,
          width_ratio: current_width_ratio,
          height_ratio: current_height_ratio,
          width: slide[:width],
          height: slide[:height],
          in: timestamp,
          deskshare: deskshare,
        }
        panzooms << panzoom
      end
    end

    # Perform cursor finalization
    next unless cursor_changed || panzoom_changed

    unless (cursor_x >= 0) && (cursor_x <= 100) &&
           cursor_y >= 0 && (cursor_y <= 100)
      cursor_visible = false
    end

    panzoom = panzooms.last
    cursor = cursors.last
    if !cursor.nil? &&
       ((!cursor[:visible] && !cursor_visible) ||
        ((cursor[:x] == cursor_x) && (cursor[:y] == cursor_y))) &&
       !panzoom_changed
      BigBlueButton.logger.info('Cursor: skipping, no changes')
    else
      unless cursor.nil?
        cursor[:out] = timestamp
        cursors_emit_event(cursors_rec, cursor)
      end
      # BigBlueButton.logger.info("Cursor: visible #{cursor_visible}, #{cursor_x} #{cursor_y} (#{panzoom[:width]}x#{panzoom[:height]})")
      cursor = {
        visible: cursor_visible,
        x: cursor_x,
        y: cursor_y,
        panzoom: panzoom,
        in: timestamp,
      }
      cursors << cursor
    end
  end

  # Add the last slide, panzoom, and cursor
  slide = slides.last
  slide[:out] = last_timestamp
  svg_render_image(svg, slide, shapes)
  panzoom = panzooms.last
  panzoom[:out] = last_timestamp
  panzooms_emit_event(panzooms_rec, panzoom)
  cursor = cursors.last
  cursor[:out] = last_timestamp
  cursors_emit_event(cursors_rec, cursor)

  cursors_doc = Builder::XmlMarkup.new(indent: 2)
  cursors_doc.instruct!
  cursors_doc.recording(id: 'cursor_events') { |xml| xml << cursors_rec.target! }

  panzooms_doc = Builder::XmlMarkup.new(indent: 2)
  panzooms_doc.instruct!
  panzooms_doc.recording(id: 'panzoom_events') { |xml| xml << panzooms_rec.target! }

  # And save the result
  File.write("#{package_dir}/#{@shapes_svg_filename}", shapes_doc.to_xml)
  File.write("#{package_dir}/#{@panzooms_xml_filename}", panzooms_doc.target!)
  File.write("#{package_dir}/#{@cursor_xml_filename}", cursors_doc.target!)
end

def process_chat_messages(events, bbb_props)
  BigBlueButton.logger.info('Processing chat events')
  # Create slides.xml and chat.
  xml = Builder::XmlMarkup.new(indent: 2)
  xml.instruct!
  xml.popcorn do
    BigBlueButton::Events.get_chat_events(events, @meeting_start.to_i, @meeting_end.to_i, bbb_props).each do |chat|
      chattimeline = {
        in: (chat[:in] / 1000.0).round(1),
        direction: 'down',
        name: chat[:sender],
        message: chat[:message],
        target: 'chat',
      }
      chattimeline[:out] = (chat[:out] / 1000.0).round(1) unless chat[:out].nil?
      xml.chattimeline(**chattimeline)
    end
  end

  xml
end

def process_deskshare_events(events)
  BigBlueButton.logger.info('Processing deskshare events')
  deskshare_matched_events = BigBlueButton::Events.get_matched_start_and_stop_deskshare_events(events)

  @deskshare_xml = Builder::XmlMarkup.new(indent: 2)
  @deskshare_xml.instruct!

  @deskshare_xml.recording('id' => 'deskshare_events') do
    deskshare_matched_events.each do |event|
      start_timestamp = (translate_timestamp(event[:start_timestamp].to_f) / 1000).round(1)
      stop_timestamp = (translate_timestamp(event[:stop_timestamp].to_f) / 1000).round(1)
      next unless start_timestamp != stop_timestamp

      video_info = BigBlueButton::EDL::Video.video_info("#{@deskshare_dir}/#{event[:stream]}")
      unless video_info[:video]
        BigBlueButton.logger.warn("#{event[:stream]} is not a valid video file, skipping...")
        next
      end
      video_width, video_height = get_deskshare_video_dimension(event[:stream])
      @deskshare_xml.event(start_timestamp: start_timestamp,
                           stop_timestamp: stop_timestamp,
                           video_width: video_width,
                           video_height: video_height)
    end
  end
end

def get_poll_question(event)
  question = ''
  question = event.at_xpath('question').text unless event.at_xpath('question').nil?

  question
end

def get_poll_answers(event)
  answers = []
  answers = JSON.parse(event.at_xpath('answers').content) unless event.at_xpath('answers').nil?

  answers
end

def get_poll_respondents(event)
  respondents = 0
  respondents = event.at_xpath('numRespondents').text.to_i unless event.at_xpath('numRespondents').nil?

  respondents
end

def get_poll_responders(event)
  responders = 0
  responders = event.at_xpath('numResponders').text.to_i unless event.at_xpath('numResponders').nil?

  responders
end

def get_poll_id(event)
  id = ''
  id = event.at_xpath('pollId').text unless event.at_xpath('pollId').nil?

  id
end

def get_poll_type(events, published_poll_event)
  published_poll_id = get_poll_id(published_poll_event)

  type = ''
  events.xpath("recording/event[@eventname='PollStartedRecordEvent']").each do |event|
    poll_id = get_poll_id(event)

    if poll_id.eql?(published_poll_id)
      type = event.at_xpath('type').text
      break
    end
  end

  type
end

def process_poll_events(events, package_dir)
  BigBlueButton.logger.info('Processing poll events')

  published_polls = []
  @rec_events.each do |re|
    events.xpath("recording/event[@eventname='PollPublishedRecordEvent']").each do |event|
      next unless (event[:timestamp].to_i >= re[:start_timestamp]) && (event[:timestamp].to_i <= re[:stop_timestamp])

      published_polls << {
        timestamp: (translate_timestamp(event[:timestamp]) / 1000).to_i,
        type: get_poll_type(events, event),
        question: get_poll_question(event),
        answers: get_poll_answers(event),
        respondents: get_poll_respondents(event),
        responders: get_poll_responders(event),
      }
    end
  end

  File.open("#{package_dir}/polls.json", 'w') { |f| f.puts(published_polls.to_json) } unless published_polls.empty?
end

def process_external_video_events(_events, package_dir)
  BigBlueButton.logger.info('Processing external video events')

  # Retrieve external video events
  external_video_events = BigBlueButton::Events.match_start_and_stop_external_video_events(
    BigBlueButton::Events.get_start_and_stop_external_video_events(@doc)
  )

  external_videos = []
  @rec_events.each do |re|
    external_video_events.each do |event|
      # BigBlueButton.logger.info("Processing rec event #{re} and external video event #{event}")
      timestamp = (translate_timestamp(event[:start_timestamp]) / 1000).to_i
      # do not add same external_video twice
      next unless external_videos.find { |ev| ev[:timestamp] == timestamp }.nil?

      next unless ((event[:start_timestamp] >= re[:start_timestamp]) && (event[:start_timestamp] <= re[:stop_timestamp])) ||
                  ((event[:start_timestamp] < re[:start_timestamp]) && (event[:stop_timestamp] >= re[:start_timestamp]))

      external_videos << {
        timestamp: timestamp,
        external_video_url: event[:external_video_url],
      }
    end
  end

  File.open("#{package_dir}/external_videos.json", 'w') { |f| f.puts(external_videos.to_json) } unless external_videos.empty?
end

@shapes_svg_filename = 'shapes.svg'
@panzooms_xml_filename = 'panzooms.xml'
@cursor_xml_filename = 'cursor.xml'
@deskshare_xml_filename = 'deskshare.xml'

opts = Optimist.options do
  opt :meeting_id, 'Meeting id to archive', default: '58f4a6b3-cd07-444d-8564-59116cb53974', type: String
end

@meeting_id = opts[:meeting_id]
puts @meeting_id
match = /(.*)-(.*)/.match @meeting_id
@meeting_id = match[1]
@playback = match[2]

puts @meeting_id
puts @playback

begin
  if @playback == 'presentation'
    log_dir = bbb_props['log_dir']
    logger = Logger.new("#{log_dir}/presentation/publish-#{@meeting_id}.log", 'daily')
    BigBlueButton.logger = logger

    BigBlueButton.logger.info('Setting recording dir')
    recording_dir = bbb_props['recording_dir']
    BigBlueButton.logger.info('Setting process dir')
    @process_dir = "#{recording_dir}/process/presentation/#{@meeting_id}"
    BigBlueButton.logger.info('Setting publish dir')
    publish_dir = @presentation_props['publish_dir']
    BigBlueButton.logger.info('Setting playback url info')
    playback_protocol = bbb_props['playback_protocol']
    playback_host = bbb_props['playback_host']
    BigBlueButton.logger.info('Setting target dir')
    target_dir = "#{recording_dir}/publish/presentation/#{@meeting_id}"
    @deskshare_dir = "#{recording_dir}/raw/#{@meeting_id}/deskshare"

    if !FileTest.directory?(target_dir)
      BigBlueButton.logger.info('Making dir target_dir')
      FileUtils.mkdir_p target_dir

      package_dir = "#{target_dir}/#{@meeting_id}"
      BigBlueButton.logger.info('Making dir package_dir')
      FileUtils.mkdir_p package_dir

      begin
        video_formats = @presentation_props['video_formats']

        video_files = Dir.glob("#{@process_dir}/webcams.{#{video_formats.join(',')}}")
        if !video_files.empty?
          BigBlueButton.logger.info('Making video dir')
          video_dir = "#{package_dir}/video"
          FileUtils.mkdir_p video_dir
          video_files.each do |video_file|
            BigBlueButton.logger.info("Made video dir - copying: #{video_file} to -> #{video_dir}")
            FileUtils.cp(video_file, video_dir)
            BigBlueButton.logger.info("Copied #{File.extname(video_file)} file")
          end
        else
          audio_dir = "#{package_dir}/audio"
          BigBlueButton.logger.info('Making audio dir')
          FileUtils.mkdir_p audio_dir
          BigBlueButton.logger.info("Made audio dir - copying: #{@process_dir}/audio.webm to -> #{audio_dir}")
          FileUtils.cp("#{@process_dir}/audio.webm", audio_dir)
          BigBlueButton.logger.info("Copied audio.webm file - copying: #{@process_dir}/audio.ogg to -> #{audio_dir}")
          FileUtils.cp("#{@process_dir}/audio.ogg", audio_dir)
          BigBlueButton.logger.info('Copied audio.ogg file')
        end

        if File.exist?("#{@process_dir}/captions.json")
          BigBlueButton.logger.info('Copying caption files')
          FileUtils.cp("#{@process_dir}/captions.json", package_dir)
          Dir.glob("#{@process_dir}/caption_*.vtt").each do |caption|
            BigBlueButton.logger.debug(caption)
            FileUtils.cp(caption, package_dir)
          end
        end

        video_files = Dir.glob("#{@process_dir}/deskshare.{#{video_formats.join(',')}}")
        if !video_files.empty?
          BigBlueButton.logger.info('Making deskshare dir')
          deskshare_dir = "#{package_dir}/deskshare"
          FileUtils.mkdir_p deskshare_dir
          video_files.each do |video_file|
            BigBlueButton.logger.info("Made deskshare dir - copying: #{video_file} to -> #{deskshare_dir}")
            FileUtils.cp(video_file, deskshare_dir)
            BigBlueButton.logger.info("Copied #{File.extname(video_file)} file")
          end
        else
          BigBlueButton.logger.info("Could not copy deskshares.webm: file doesn't exist")
        end

        if File.exist?("#{@process_dir}/presentation_text.json")
          FileUtils.cp("#{@process_dir}/presentation_text.json", package_dir)
        end

        FileUtils.cp("#{@process_dir}/notes/notes.html", package_dir) if File.exist?("#{@process_dir}/notes/notes.html")

        processing_time = File.read("#{@process_dir}/processing_time")

        @doc = Nokogiri::XML(File.read("#{@process_dir}/events.xml"))

        # Retrieve record events and calculate total recording duration.
        @rec_events = BigBlueButton::Events.match_start_and_stop_rec_events(
          BigBlueButton::Events.get_start_and_stop_rec_events(@doc)
        )

        recording_time = BigBlueButton::Events.get_recording_length(@doc)

        # presentation_url = "/slides/" + @meeting_id + "/presentation"

        @meeting_start = BigBlueButton::Events.first_event_timestamp(@doc)
        @meeting_end = BigBlueButton::Events.last_event_timestamp(@doc)

        @version_atleast_0_9_0 = BigBlueButton::Events.bbb_version_compare(
          @doc, 0, 9, 0
        )
        @version_atleast_2_0_0 = BigBlueButton::Events.bbb_version_compare(
          @doc, 2, 0, 0
        )
        BigBlueButton.logger.info('Creating metadata.xml')

        # Get the real-time start and end timestamp
        # match = /.*-(\d+)@/.match(@meeting_id)
        # real_start_time = match[1]
        # real_end_time = (real_start_time.to_i + (@meeting_end.to_i - @meeting_start.to_i)).to_s

        #### INSTEAD OF CREATING THE WHOLE metadata.xml FILE AGAIN, ONLY ADD <playback>
        # Copy metadata.xml from process_dir
        FileUtils.cp("#{@process_dir}/metadata.xml", package_dir)
        BigBlueButton.logger.info('Copied metadata.xml file')

        # Update state and add playback to metadata.xml
        ## Load metadata.xml
        metadata = Nokogiri::XML(File.read("#{package_dir}/metadata.xml"))
        ## Update state
        recording = metadata.root
        state = recording.at_xpath('state')
        state.content = 'published'
        published = recording.at_xpath('published')
        published.content = 'true'
        ## Remove empty playback
        metadata.search('recording/playback').each(&:remove)
        ## Add the actual playback
        presentation = BigBlueButton::Presentation.get_presentation_for_preview(@process_dir.to_s)
        Nokogiri::XML::Builder.with(metadata.at('recording')) do |xml|
          xml.playback do
            xml.format('presentation')
            xml.link("#{playback_protocol}://#{playback_host}/playback/presentation/2.3/#{@meeting_id}")
            xml.processing_time(processing_time.to_s)
            xml.duration(recording_time.to_s)
            unless presentation.empty?
              xml.extensions do
                xml.preview do
                  xml.images do
                    presentation[:slides].each do |key, val|
                      attributes = { width: '176', height: '136', alt: !val[:alt].nil? ? (val[:alt]).to_s : '' }
                      xml.image(attributes) do
                        xml.text("#{playback_protocol}://#{playback_host}/presentation/#{@meeting_id}/presentation/#{presentation[:id]}/thumbnails/thumb-#{key}.png")
                      end
                    end
                  end
                end
              end
            end
          end
        end
        ## Write the new metadata.xml
        File.open("#{package_dir}/metadata.xml", 'w') { |file| file.write(Nokogiri::XML(metadata.to_xml, &:noblanks).root) }
        BigBlueButton.logger.info('Added playback to metadata.xml')

        # Create slides.xml
        BigBlueButton.logger.info('Generating xml for slides and chat')

        calculate_record_events_offset

        # Write slides.xml to file
        slides_doc = process_chat_messages(@doc, bbb_props)
        File.open("#{package_dir}/slides_new.xml", 'w') { |f| f.puts slides_doc.target! }

        process_presentation(package_dir)

        process_deskshare_events(@doc)

        process_poll_events(@doc, package_dir)

        process_external_video_events(@doc, package_dir)

        # Write deskshare.xml to file
        File.open("#{package_dir}/#{@deskshare_xml_filename}", 'w') { |f| f.puts @deskshare_xml.target! }

        BigBlueButton.logger.info('Copying files to package dir')
        FileUtils.cp_r("#{@process_dir}/presentation", package_dir)
        BigBlueButton.logger.info('Copied files to package dir')

        BigBlueButton.logger.info('Publishing slides')
        # Now publish this recording files by copying them into the publish folder.
        FileUtils.mkdir_p publish_dir unless FileTest.directory?(publish_dir)

        # Get raw size of presentation files
        raw_dir = "#{recording_dir}/raw/#{@meeting_id}"
        # After all the processing we'll add the published format and raw sizes to the metadata file
        BigBlueButton.add_raw_size_to_metadata(package_dir, raw_dir)
        BigBlueButton.add_playback_size_to_metadata(package_dir)

        FileUtils.cp_r(package_dir, publish_dir) # Copy all the files.
        BigBlueButton.logger.info('Finished publishing script presentation.rb successfully.')

        BigBlueButton.logger.info('Removing processed files.')
        FileUtils.rm_r(Dir.glob("#{@process_dir}/*"))

        BigBlueButton.logger.info('Removing published files.')
        FileUtils.rm_r(Dir.glob("#{target_dir}/*"))
      rescue StandardError => e
        BigBlueButton.logger.error(e.message)
        e.backtrace.each do |traceline|
          BigBlueButton.logger.error(traceline)
        end
        exit 1
      end
      File.open("#{recording_dir}/status/published/#{@meeting_id}-presentation.done", 'w') do |file|
        file.write("Published #{@meeting_id}")
      end

    else
      BigBlueButton.logger.info("#{target_dir} is already there")
    end
  end
rescue StandardError => e
  BigBlueButton.logger.error(e.message)
  e.backtrace.each do |traceline|
    BigBlueButton.logger.error(traceline)
  end
  File.open("#{recording_dir}/status/published/#{@meeting_id}-presentation.fail", 'w') do |file|
    file.write("Failed Publishing #{@meeting_id}")
  end

  exit 1
end

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

# For PRODUCTION
require File.expand_path('../../../lib/recordandplayback', __FILE__)

# For DEVELOPMENT
# require File.expand_path('../../../../core/lib/recordandplayback', __FILE__)

require 'rubygems'
require 'trollop'
require 'yaml'
require 'builder'
require 'fastimage' # require fastimage to get the image size of the slides (gem install fastimage)
require 'json'

# This script lives in scripts/archive/steps while properties.yaml lives in scripts/
bbb_props = BigBlueButton.read_props


# There's a couple of places where stuff is mysteriously divided or multiplied
# by 2. This is just here to call out how spooky that is.
$magic_mystery_number = 2
$presentation_props = YAML::load(File.read('breakout_pdf.yml'))

def color_to_hex(color)
  color = color.to_i.to_s(16)
  return '0'*(6-color.length) + color
end

def shape_scale_width(slide, x)
  return (x / 100.0 * slide[:width]).round(5)
end

def shape_scale_height(slide, y)
  return (y / 100.0 * slide[:height]).round(5)
end

def shape_thickness(slide, shape)
  if !shape[:thickness_percent].nil?
    return shape_scale_width(slide, shape[:thickness_percent])
  else
    return shape[:thickness]
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
    BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing single point")
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
      BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing from command string (#{shape[:commands].length} commands)")
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
          path.push("Q#{cx1} #{cy2},#{x} #{y}")
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
      BigBlueButton.logger.info("Pencil #{shape[:shape_unique_id]}: Drawing simple line (#{shape[:data_points].length / 2} points)")
      x = shape_scale_width(slide, data_points.next)
      y = shape_scale_height(slide, data_points.next)
      path << "M#{x} #{y}"
      begin
        while true
          x = shape_scale_width(slide, data_points.next)
          y = shape_scale_height(slide, data_points.next)
          path << "L#{x} #{y}"
        end
      rescue StopIteration
      end
    end

    path = path.join('')
    g['style'] = "stroke:##{shape[:color]};stroke-linecap:round;stroke-linejoin:round;stroke-width:#{shape_thickness(slide,shape)};visibility:hidden;fill:none"
    svg_path = doc.create_element('path', d: path)
    g << svg_path
  end
end

def svg_render_shape_line(g, slide, shape)
  g['shape'] = "line#{shape[:shape_unique_id]}"
  g['style'] = "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,shape)};visibility:hidden;fill:none"
  if $version_atleast_2_0_0
    g['style'] += ";stroke-linecap:butt"
  else
    g['style'] += ";stroke-linecap:round"
  end

  doc = g.document
  data_points = shape[:data_points]
  line = doc.create_element('line',
          x1: shape_scale_width(slide, data_points[0]),
          y1: shape_scale_height(slide, data_points[1]),
          x2: shape_scale_width(slide, data_points[2]),
          y2: shape_scale_height(slide, data_points[3]))
  g << line
end

def svg_render_shape_rect(g, slide, shape)
  g['shape'] = "rect#{shape[:shape_unique_id]}"
  g['style'] = "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,shape)};visibility:hidden;fill:#{shape[:fill] ? '#'+shape[:color] : 'none'}"
  if $version_atleast_2_0_0
    g['style'] += ";stroke-linejoin:miter"
  else
    g['style'] += ";stroke-linejoin:round"
  end

  doc = g.document
  data_points = shape[:data_points]
  x1 = shape_scale_width(slide, data_points[0])
  y1 = shape_scale_height(slide, data_points[1])
  x2 = shape_scale_width(slide, data_points[2])
  y2 = shape_scale_height(slide, data_points[3])

  width = (x2 - x1).abs
  height = (y2 - y1).abs

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
  g['style'] = "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,shape)};visibility:hidden;fill:#{shape[:fill] ? '#'+shape[:color] : 'none'}"
  if $version_atleast_2_0_0
    g['style'] += ";stroke-linejoin:miter;stroke-miterlimit:8"
  else
    g['style'] += ";stroke-linejoin:round"
  end

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
  g['style'] = "stroke:##{shape[:color]};stroke-width:#{shape_thickness(slide,shape)};visibility:hidden;fill:#{shape[:fill] ? '#'+shape[:color] : 'none'}"

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
  path = "M#{x1} #{hy}"
  path += "A#{width_r} #{height_r} 0 0 1 #{hx} #{y1}"
  path += "A#{width_r} #{height_r} 0 0 1 #{x2} #{hy}"
  path += "A#{width_r} #{height_r} 0 0 1 #{hx} #{y2}"
  path += "A#{width_r} #{height_r} 0 0 1 #{x1} #{hy}"
  path += "Z"

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

  BigBlueButton.logger.info("Text #{shape[:shape_unique_id]} width #{width} height #{height} font size #{font_size}")
  g['style'] = "color:##{shape[:font_color]};word-wrap:break-word;visibility:hidden;font-family:Arial;font-size:#{font_size}px"

  switch = doc.create_element('switch')
  fo = doc.create_element('foreignObject',
          width: width, height: height, x: x, y: y)
  p = doc.create_element('p',
          xmlns: 'http://www.w3.org/1999/xhtml', style: 'margin:0;padding:0')
  shape[:text].each_line.with_index do |line, index|
    if index > 0
      p << doc.create_element('br')
    end
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

  json_file = "#{$process_dir}/poll_result#{poll_id}.json"
  svg_file = "#{$process_dir}/presentation/#{presentation}/poll_result#{poll_id}.svg"

  # Save the poll json to a temp file
  IO.write(json_file, result)
  # Render the poll svg
  ret = BigBlueButton.exec_ret('utils/gen_poll_svg', '-i', json_file, '-w', "#{width.round}", '-h', "#{height.round}", '-n', "#{num_responders}", '-o', svg_file)
  raise "Failed to generate poll svg" if ret != 0

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

  if shape[:in] >= slide[:out] or
      (!shape[:out].nil? and shape[:out] <= slide[:in])
    BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} is not visible during image time span")
    return
  end

  BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} Type #{shape[:type]} from #{shape[:in]} to #{shape[:out]} undo #{shape[:undo]}")

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

  if g.element_children.length > 0
    canvas << g
  end
end

$svg_image_id = 1
def svg_render_image(svg, slide, shapes)
  if slide[:in] == slide[:out]
    BigBlueButton.logger.info("Presentation #{slide[:presentation]} Slide #{slide[:slide]} is never shown (duration rounds to 0)")
    return
  end

  image_id = $svg_image_id
  $svg_image_id += 1

  BigBlueButton.logger.info("Image #{image_id}: Presentation #{slide[:presentation]} Slide #{slide[:slide]} Deskshare #{slide[:deskshare]} from #{slide[:in]} to #{slide[:out]}")


  doc = svg.document
  image = doc.create_element('image',
          id: "image#{image_id}", class: 'slide',
          in: slide[:in], out: slide[:out],
          'xlink:href' => slide[:src],
          width: slide[:width], height: slide[:height], x: 0, y: 0,
          style: 'visibility:hidden')
  image['text'] = slide[:text] if !slide[:text].nil?
  svg << image

  if slide[:deskshare] or
      shapes[slide[:presentation]].nil? or
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

  if canvas.element_children.length > 0
    svg << canvas
  end
end

$svg_shape_id = 1
$svg_shape_unique_id = 1
def events_parse_shape(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this shape is for, with fallbacks
  # for old BBB where this info isn't in the shape messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')
  if presentation.nil?
    presentation = current_presentation
  else
    presentation = presentation.text
  end
  if slide.nil?
    slide = current_slide
  else
    slide = slide.text.to_i
    slide -=1 unless $version_atleast_0_9_0
  end

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
  shape[:data_points] = event.at_xpath('dataPoints').text.split(',').map { |p| p.to_f }
  # These can be missing in old BBB versions, there are fallbacks
  user_id = event.at_xpath('userId')
  shape[:user_id] = user_id.text if !user_id.nil?
  shape_id = event.at_xpath('id')
  shape[:id] = shape_id.text if !shape_id.nil?
  status = event.at_xpath('status')
  shape[:status] = status.text if !status.nil?
  shape[:shape_id] = $svg_shape_id
  $svg_shape_id += 1

  # Some shape-specific properties
  if shape[:type] == 'pencil' or shape[:type] == 'rectangle' or
      shape[:type] == 'ellipse' or shape[:type] == 'triangle' or
      shape[:type] == 'line'
    shape[:color] = color_to_hex(event.at_xpath('color').text)
    thickness = event.at_xpath('thickness')
    unless thickness
      BigBlueButton.logger.warn("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} ID #{shape[:id]} is missing thickness")
      return
    end
    if $version_atleast_2_0_0
      shape[:thickness_percent] = thickness.text.to_f
    else
      shape[:thickness] = thickness.text.to_i
    end
  end
  if  shape[:type] == 'rectangle' or
      shape[:type] == 'ellipse' or shape[:type] == 'triangle'
    fill = event.at_xpath('fill').text
    fill = ""
    shape[:fill] = fill =~ /true/ ? true : false
  end
  if shape[:type] == 'rectangle'
    square = event.at_xpath('square')
    if !square.nil?
      shape[:square] = (square.text == 'true')
    end
  end
  if shape[:type] == 'ellipse'
    circle = event.at_xpath('circle')
    if !circle.nil?
      shape[:circle] = (circle.text == 'true')
    end
  end
  if shape[:type] == 'pencil'
    commands = event.at_xpath('commands')
    if !commands.nil?
      shape[:commands] = commands.text.split(',').map { |c| c.to_i }
    end
  end
  if shape[:type] == 'poll_result'
    shape[:num_responders] = event.at_xpath('num_responders').text.to_i
    shape[:num_respondents] = event.at_xpath('num_respondents').text.to_i
    shape[:result] = event.at_xpath('result').text
  end
  if shape[:type] == 'text'
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
    if !text.nil?
      shape[:text] = text.text
    else
      shape[:text] = ''
    end
  end

  # Find the previous shape, for updates
  prev_shape = nil
  if !shape[:id].nil?
    # If we have a shape ID, look up the previous shape by ID
    prev_shape = shapes.find_all {|s| s[:id] == shape[:id] }.last
  else
    # No shape ID, so do heuristic matching. If the previous shape had the
    # same type and same first two data points, update it.
    last_shape = shapes.last
    if last_shape[:type] == shape[:type] and
        last_shape[:data_points][0] == shape[:data_points][0] and
        last_shape[:data_points][1] == shape[:data_points][1]
      prev_shape = last_shape
    end
  end
  if !prev_shape.nil?
    prev_shape[:out] = timestamp
    shape[:shape_unique_id] = prev_shape[:shape_unique_id]

    if shape[:type] == 'pencil' and shape[:status] == 'DRAW_UPDATE'
      # BigBlueButton 2.0 quirk - 'DRAW_UPDATE' events on pencil tool only
      # include newly added points, rather than the full list.
      shape[:data_points] = prev_shape[:data_points] + shape[:data_points]
    end
  else
    shape[:shape_unique_id] = $svg_shape_unique_id
    $svg_shape_unique_id += 1
  end

  BigBlueButton.logger.info("Draw #{shape[:shape_id]} Shape #{shape[:shape_unique_id]} ID #{shape[:id]} Type #{shape[:type]}")
  shapes << shape
end

def events_parse_undo(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this undo is for, with fallbacks
  # for old BBB where this info isn't in the undo messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')
  if presentation.nil?
    presentation = current_presentation
  else
    presentation = presentation.text
  end
  if slide.nil?
    slide = current_slide
  else
    slide = slide.text.to_i
    slide -=1 unless $version_atleast_0_9_0
  end
  # Newer undo messages have the shape id, making this a lot easier
  shape_id = event.at_xpath('shapeId')
  if !shape_id.nil?
    shape_id = shape_id.text
  end

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
      if shape[:id] == shape_id
        if shape[:undo].nil? or shape[:undo] > timestamp
          shape[:undo] = timestamp
        end
      end
    end
  else
    # The undo command removes the most recently added shape that has not
    # already been removed by another undo or clear. Find that shape.
    undo_shape = shapes.select { |s| s[:undo].nil? }.last
    if !undo_shape.nil?
      BigBlueButton.logger.info("Undo: removing Shape #{undo_shape[:shape_unique_id]} at #{timestamp}")
      # We have an id number assigned to associate all the updated versions
      # of the same shape. Use that to determine which shapes to apply undo
      # times to.
      shapes.each do |shape|
        if shape[:shape_unique_id] == undo_shape[:shape_unique_id]
          if shape[:undo].nil? or shape[:undo] > timestamp
            shape[:undo] = timestamp
          end
        end
      end
    else
      BigBlueButton.logger.info("Undo: no applicable shapes found")
    end
  end
end

def events_parse_clear(shapes, event, current_presentation, current_slide, timestamp)
  # Figure out what presentation+slide this clear is for, with fallbacks
  # for old BBB where this info isn't in the clear messages
  presentation = event.at_xpath('presentation')
  slide = event.at_xpath('pageNumber')
  if presentation.nil?
    presentation = current_presentation
  else
    presentation = presentation.text
  end
  if slide.nil?
    slide = current_slide
  else
    slide = slide.text.to_i
    slide -=1 unless $version_atleast_0_9_0
  end

  # BigBlueButton 2.0 per-user clear features
  full_clear = event.at_xpath('fullClear')
  if !full_clear.nil?
    full_clear = (full_clear.text == 'true')
  else
    # Default to full clear on older versions
    full_clear = true
  end
  user_id = event.at_xpath('userId')
  if !user_id.nil?
    user_id = user_id.text
  end

  # Set up the shapes data structures if needed
  shapes[presentation] = {} if shapes[presentation].nil?
  shapes[presentation][slide] = [] if shapes[presentation][slide].nil?

  # We only need to deal with shapes for this slide
  shapes = shapes[presentation][slide]

  if full_clear
    BigBlueButton.logger.info("Clear: removing all shapes")
  else
    BigBlueButton.logger.info("Clear: removing shapes for User #{user_id}")
  end

  shapes.each do |shape|
    if full_clear or user_id == shape[:user_id]
      if shape[:undo].nil? or shape[:undo] > timestamp
        shape[:undo] = timestamp
      end
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
  image_path = "#{$process_dir}/#{slide[:src]}"

  unless File.exist?(image_path)
    BigBlueButton.logger.warn("Missing image file #{image_path}!")
    # Emergency last-ditch blank image creation
    FileUtils.mkdir_p(File.dirname(image_path))
    command = \
      if slide[:deskshare]
        ['convert', '-size', "#{$presentation_props['deskshare_output_width']}x#{$presentation_props['deskshare_output_height']}", 'xc:transparent', '-background', 'transparent', image_path]
      else
        ['convert', '-size', '1600x1200', 'xc:transparent', '-background', 'transparent', '-quality', '90', '+dither', '-depth', '8', '-colors', '256', image_path]
      end
    BigBlueButton.exec_ret(*command) || raise("Unable to generate blank image for #{image_path}")
  end

  slide[:width], slide[:height] = FastImage.size(image_path)
  BigBlueButton.logger.info("Image size is #{slide[:width]}x#{slide[:height]}")
end

# Create the shapes.svg, cursors.xml, and panzooms.xml files used for
# rendering the presentation area
def processPresentation(package_dir)
  shapes_doc = Nokogiri::XML::Document.new()
  shapes_doc.create_internal_subset('svg', '-//W3C//DTD SVG 1.1//EN',
                             'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')
  svg = shapes_doc.root = shapes_doc.create_element('svg',
          id: 'svgfile',
          style: 'position:absolute;height:600px;width:800px',
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink' => 'http://www.w3.org/1999/xlink',
          version: '1.1',
          viewBox: '0 0 800 600')

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
  events_xml = Nokogiri::XML(File.read("#{$process_dir}/events.xml"))
  events_xml.xpath('/recording/event').each do |event|

    eventname = event['eventname']
    last_timestamp = timestamp = (event['timestamp'].to_i / 1000.0).round(1)

    # Make sure to add initial entries to the slide & panzoom lists
    slide_changed = slides.empty?
    panzoom_changed = panzooms.empty?
    cursor_changed = cursors.empty?

    # Do event specific processing
    if eventname == 'SharePresentationEvent'
      current_presentation = event.at_xpath('presentationName').text
      current_slide = current_presentation_slide[current_presentation].to_i
      slide_changed = true
      panzoom_changed = true

    elsif eventname == 'GotoSlideEvent'
      current_slide = event.at_xpath('slide').text.to_i
      current_presentation_slide[current_presentation] = current_slide
      slide_changed = true
      panzoom_changed = true

    elsif eventname == 'ResizeAndMoveSlideEvent'
      current_x_offset = event.at_xpath('xOffset').text.to_f
      current_y_offset = event.at_xpath('yOffset').text.to_f
      current_width_ratio = event.at_xpath('widthRatio').text.to_f
      current_height_ratio = event.at_xpath('heightRatio').text.to_f
      panzoom_changed = true

    elsif  (eventname == 'DeskshareStartedEvent' or eventname == 'StartWebRTCDesktopShareEvent')
      deskshare = true
      slide_changed = true

    elsif (eventname == 'DeskshareStoppedEvent' or eventname == 'StopWebRTCDesktopShareEvent')
      deskshare = false
      slide_changed = true

    elsif eventname == 'AddShapeEvent' or eventname == 'ModifyTextEvent'
      events_parse_shape(shapes, event, current_presentation, current_slide, timestamp)

    elsif eventname == 'UndoShapeEvent' or eventname == 'UndoAnnotationEvent'
      events_parse_undo(shapes, event, current_presentation, current_slide, timestamp)

    elsif eventname == 'ClearPageEvent' or eventname == 'ClearWhiteboardEvent'
      events_parse_clear(shapes, event, current_presentation, current_slide, timestamp)

    elsif eventname == 'AssignPresenterEvent'
      # Move cursor offscreen on presenter switch, it'll reappear if the new
      # presenter moves it
      presenter = event.at_xpath('userid').text
      cursor_visible = false
      cursor_changed = true

    elsif eventname == 'CursorMoveEvent'
      cursor_x = event.at_xpath('xOffset').text.to_f
      cursor_y = event.at_xpath('yOffset').text.to_f
      cursor_visible = true
      cursor_changed = true

    elsif eventname == 'WhiteboardCursorMoveEvent'
      user_id = event.at_xpath('userId')
      # Only draw cursor for current presentor. TODO multi-cursor support
      if user_id.nil? or user_id.text == presenter
        cursor_x = event.at_xpath('xOffset').text.to_f
        cursor_y = event.at_xpath('yOffset').text.to_f
        cursor_visible = true
        cursor_changed = true
      end
    end

    # Perform slide finalization
    if slide_changed
      slide = slides.last
      if !slide.nil? and
          slide[:presentation] == current_presentation and
          slide[:slide] == current_slide and
          slide[:deskshare] == deskshare
        BigBlueButton.logger.info('Presentation/Slide: skipping, no changes')
        slide_changed = false
      else
        if !slide.nil?
          slide[:out] = timestamp
          svg_render_image(svg, slide, shapes)
        end

        BigBlueButton.logger.info("Presentation #{current_presentation} Slide #{current_slide} Deskshare #{deskshare}")
        slide = {
          presentation: current_presentation,
          slide: current_slide,
          in: timestamp,
          deskshare: deskshare
        }
        events_get_image_info(slide)
        slides << slide
      end
    end
  end

  # Add the last slide, panzoom, and cursor
  slide = slides.last
  slide[:out] = last_timestamp
  svg_render_image(svg, slide, shapes)

  # And save the result
  File.write("#{package_dir}/#{$shapes_svg_filename}", shapes_doc.to_xml)
end

def getPollQuestion(event)
  question = ""
  if not event.at_xpath("question").nil?
    question = event.at_xpath("question").text
  end

  question
end

def getPollAnswers(event)
  answers = []
  if not event.at_xpath("answers").nil?
    answers = JSON.load(event.at_xpath("answers").content)
  end

  answers
end

def getPollRespondents(event)
  respondents = 0
  if not event.at_xpath("numRespondents").nil?
    respondents = event.at_xpath("numRespondents").text.to_i
  end

  respondents
end

def getPollResponders(event)
  responders = 0
  if not event.at_xpath("numResponders").nil?
    responders = event.at_xpath("numResponders").text.to_i
  end

  responders
end

def getPollId(event)
  id = ""
  if not event.at_xpath("pollId").nil?
    id = event.at_xpath("pollId").text
  end

  id
end

def getPollType(events, published_poll_event)
  published_poll_id = getPollId(published_poll_event)

  type = ""
  events.xpath("//event[@eventname='PollStartedRecordEvent']").each do |event|
    poll_id = getPollId(event)

    if poll_id.eql?(published_poll_id)
      type = event.at_xpath("type").text
      break
    end
  end

  type
end

$shapes_svg_filename = 'shapes.svg'

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
  if ($playback == "breakout_pdf")
    log_dir = bbb_props['log_dir']
    logger = Logger.new("#{log_dir}/breakout_pdf/publish-#{$meeting_id}.log", 'daily' )
    BigBlueButton.logger = logger

    BigBlueButton.logger.info("Setting recording dir")
    recording_dir = bbb_props['recording_dir']

    BigBlueButton.logger.info("Setting process dir")
    $process_dir = "#{recording_dir}/process/breakout_pdf/#{$meeting_id}"

    BigBlueButton.logger.info("setting publish dir")
    publish_dir = $presentation_props['publish_dir']

    BigBlueButton.logger.info("setting target dir")
    target_dir = "#{recording_dir}/publish/breakout_pdf/#{$meeting_id}"

    if not FileTest.directory?(target_dir)
      BigBlueButton.logger.info("Making dir target_dir")
      FileUtils.mkdir_p target_dir

      package_dir = "#{target_dir}/#{$meeting_id}"
      BigBlueButton.logger.info("Making dir package_dir")
      FileUtils.mkdir_p package_dir

      begin
        @doc = Nokogiri::XML(File.read("#{$process_dir}/events.xml"))

        $meeting_start = BigBlueButton::Events.first_event_timestamp(@doc)
        $meeting_end = BigBlueButton::Events.last_event_timestamp(@doc)

        # Export entire meeting
        $rec_events = {:start_timestamp=>$meeting_start, :stop_timestamp=>$meeting_end}
        $version_atleast_0_9_0 = BigBlueButton::Events.bbb_version_compare(
                        @doc, 0, 9, 0)
        $version_atleast_2_0_0 = BigBlueButton::Events.bbb_version_compare(
                        @doc, 2, 0, 0)
        BigBlueButton.logger.info("Creating metadata.xml")
        # Get the real-time start and end timestamp
        match = /.*-(\d+)$/.match($meeting_id)
        real_start_time = match[1]
        real_end_time = (real_start_time.to_i + ($meeting_end.to_i - $meeting_start.to_i)).to_s

        metadata = Nokogiri::XML(File.read("#{$process_dir}/metadata.xml"))

        processPresentation(package_dir)

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

        export_pdf = system("ruby /usr/local/bigbluebutton/core/scripts/post_publish/export_slides.rb -m #{$meeting_id}")
        upload = system("ruby /usr/local/bigbluebutton/core/scripts/post_publish/upload_breakout_pdf_main_room.rb -m #{$meeting_id}")
        
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

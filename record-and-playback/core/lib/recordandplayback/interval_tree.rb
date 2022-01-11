#!/usr/bin/env ruby
# frozen_string_literal: true

# Copyright (c) 2011-2021 MISHIMA, Hiroyuki; Simeon Simeonov; Carlos Alonso; Sam Davies; amarzot-yesware; Daniel Petri Rocha

# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:

# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module IntervalTree
  class Tree
    def initialize(ranges, &range_factory)
      range_factory = ->(l, r) { (l...r + 1) } unless block_given?
      ranges_excl = ensure_exclusive_end([ranges].flatten, range_factory)
      ranges_excl.sort_by! { |x| [x.begin, x.end] }
      @top_node = divide_intervals(ranges_excl)
    end
    attr_reader :top_node

    def divide_intervals(intervals)
      return nil if intervals.empty?

      x_center = center(intervals)
      s_center = []
      s_left = []
      s_right = []

      intervals.each do |k|
        if k.end < x_center
          s_left << k
        elsif k.begin > x_center
          s_right << k
        else
          s_center << k
        end
      end

      s_center.sort_by! { |x| [x.begin, x.end] }

      Node.new(x_center, s_center,
               divide_intervals(s_left), divide_intervals(s_right))
    end

    # Search by range or point
    DEFAULT_OPTIONS = { unique: true, sort: true }.freeze
    def search(query, options = {})
      options = DEFAULT_OPTIONS.merge(options)

      return nil unless @top_node

      if query.respond_to?(:begin)
        result = top_node.search(query)
        options[:unique] ? result.uniq! : result
      else
        result = point_search(top_node, query, [], options[:unique])
      end
      options[:sort] ? result.sort_by { |x| [x.begin, x.end] } : result
    end

    def ==(other)
      top_node == other.top_node
    end

    private

    def ensure_exclusive_end(ranges, range_factory)
      ranges.map do |range|
        if !range.respond_to?(:exclude_end?)
          range
        elsif range.exclude_end?
          range
        else
          range_factory.call(range.begin, range.end)
        end
      end
    end

    def center(intervals)
      (
        intervals.map(&:begin).min +
        intervals.map(&:end).max
      ) / 2
    end

    def point_search(node, point, result, unique)
      stack = [node]

      until stack.empty?
        node = stack.pop
        node_left_node = node.left_node
        node_right_node = node.right_node
        node_x_center = node.x_center
        node_s_center_end = node.s_center_end
        traverse_left = (point < node_x_center)

        if node_s_center_end && point < node_s_center_end
          node.s_center.each do |k|
            break if k.begin > point

            result << k if point < k.end
          end
        end

        if node_left_node && traverse_left
          stack << node_left_node

        elsif node_right_node && !traverse_left
          stack << node_right_node
        end

      end
      if unique
        result.uniq
      else
        result
      end
    end
  end

  class Node
    def initialize(x_center, s_center, left_node, right_node)
      @x_center = x_center
      @s_center = s_center
      @s_center_end = s_center.map(&:end).max
      @left_node = left_node
      @right_node = right_node
    end
    attr_reader :x_center, :s_center, :s_center_end, :left_node, :right_node

    def ==(other)
      x_center == other.x_center &&
        s_center == other.s_center &&
        left_node == other.left_node &&
        right_node == other.right_node
    end

    # Search by range only
    def search(query)
      search_s_center(query) +
        (left_node && query.begin < x_center && left_node.search(query) || []) +
        (right_node && query.end > x_center && right_node.search(query) || [])
    end

    private

    def search_s_center(query)
      result = []

      s_center.each do |k|
        k_begin = k.begin
        query_end = query.end

        break if k_begin > query_end

        k_end = k.end
        query_begin = query.begin

        k_begin_gte_q_begin = k_begin >= query_begin
        k_end_lte_q_end = k_end <= query_end
        next unless
        (
          # k is entirely contained within the query
          k_begin_gte_q_begin &&
          k_end_lte_q_end
        ) || (
          # k's start overlaps with the query
          k_begin_gte_q_begin &&
          (k_begin < query_end)
        ) || (
          # k's end overlaps with the query
          (k_end > query_begin) &&
          k_end_lte_q_end
        ) || (
          # k is bigger than the query
          (k_begin < query_begin) &&
          (k_end > query_end)
        )

        result << k
      end

      result
    end
  end
end

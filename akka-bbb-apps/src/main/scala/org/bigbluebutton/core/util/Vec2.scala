package org.bigbluebutton.core.util

import scala.math.{ acos, sqrt }

final case class Vec2(val x: Float, val y: Float) {

  def -(v: Vec2): Vec2 = {
    Vec2(x - v.x, y - v.y)
  }

  def -(f: Float): Vec2 = {
    Vec2(x - f, y - f)
  }

  def +(v: Vec2): Vec2 = {
    Vec2(x + v.x, y + v.y)
  }

  def +(f: Float): Vec2 = {
    Vec2(x + f, y + f)
  }

  def *(v: Vec2): Vec2 = {
    Vec2(x * v.x, y * v.y)
  }

  def *(f: Float): Vec2 = {
    Vec2(x * f, y * f)
  }

  def dot(v: Vec2): Float = {
    x * v.x + y * v.y
  }

  def unary_- = Vec2(-x, -y)

  def length: Float = sqrt(x * x + y * y).toFloat

  def norm: Vec2 = Vec2(x / length, y / length)

  def angle(v: Vec2): Float = acos(dot(v) / (length * v.length)).toFloat

  def getSurfaceNormal(): Vec2 = Vec2(y / length, -x / length)

  override def toString(): String = {
    "Vec2(" + x + ", " + y + ")"
  }

  override def equals(other: Any): Boolean = other match {
    case v: Vec2 => x == v.x && y == v.y
    case _       => false
  }

  def toArray(): Array[Float] = {
    Array(x, y)
  }
}
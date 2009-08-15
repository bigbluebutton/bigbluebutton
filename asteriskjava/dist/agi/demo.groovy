// countdown
(10..0).each { digit -> channel.sayNumber(digit.toString()) }

channel.streamFile('beep');

// read a few dtmf digits
while ((digit = channel.waitForDigit(10000)) != 0)
{
  if (digit == '#' || digit == '*')
  {
    break;
  }
  channel.sayDigits(digit.toString());
}

// beep to say good bye ;)
channel.streamFile('beep');


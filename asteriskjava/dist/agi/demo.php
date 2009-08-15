<?php

// countdown
for ($i = 10; $i >= 0; $i--)
{
    $channel->sayNumber($i);
}

$channel->streamFile('beep');

// read a few dtmf digits
while (($digit = $channel->waitForDigit(10000)) != 0)
{
  if ($digit == '#' || $digit == '*')
  {
    break;
  }
  $channel->sayDigits($digit);
}

// beep to say good bye ;)
$channel->streamFile('beep');

?>

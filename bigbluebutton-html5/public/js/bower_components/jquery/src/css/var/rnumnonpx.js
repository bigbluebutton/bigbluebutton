define([
  '../../var/pnum',
], pnum => new RegExp(`^(${pnum})(?!px)[a-z%]+$`, 'i'));

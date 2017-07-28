import stringHash from 'string-hash';
import { check } from 'meteor/check';

import addUser from '../modifiers/addUser';

const COLOR_LIST = [
  '#d32f2f', '#c62828', '#b71c1c', '#d81b60', '#c2185b', '#ad1457', '#880e4f',
  '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0',
  '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0',
  '#0d47a1', '#0277bd', '#01579b', '#00838f', '#006064', '#00796b', '#00695c',
  '#004d40', '#2e7d32', '#1b5e20', '#33691e', '#827717', '#bf360c', '#6d4c41',
  '#5d4037', '#4e342e', '#3e2723', '#757575', '#616161', '#424242', '#212121',
  '#546e7a', '#455a64', '#37474f', '#263238',
];

export default function handleUserJoined({ body }, meetingId) {
  const user = body;
  check(user, Object);

  /* While the akka-apps dont generate a color we just pick one
    from a list based on the userId */
  const color = COLOR_LIST[stringHash(user.intId) % COLOR_LIST.length];

  return addUser(meetingId, Object.assign(user, { color }));
}

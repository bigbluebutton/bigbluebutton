import { check } from 'meteor/check';
import modify3dScene from '../modifiers/modify3dScene';

export default function handleModify3dScene({ body }) {
  const { scene } = body;
  check(scene, Object);

  return modify3dScene(scene);
}

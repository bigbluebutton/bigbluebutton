import ReactiveStorage from './reactive';

const _singleton = new ReactiveStorage(window.localStorage, 'BBB_');

export default _singleton;

import ReactiveStorage from './reactive';

const _singleton = new ReactiveStorage(window.sessionStorage, 'BBB_');

export default _singleton;

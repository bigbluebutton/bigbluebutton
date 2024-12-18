import ObservableStorage from './observable';

const singleton = new ObservableStorage(window.localStorage, 'BBB');

export default singleton;

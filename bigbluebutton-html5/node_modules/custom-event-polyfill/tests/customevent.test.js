describe('custom-event-polyfill', function () {
  it('should be defined', function() {
    expect(CustomEvent).toBeDefined();
  });

  it('should be defined as a function', function() {
    expect(function() { new CustomEvent('test'); }).not.toThrow();
  });

  it('should work as expected', function() {
    var ev = new CustomEvent('test', { detail: 'blammy' });
    expect(ev.detail).toEqual('blammy');
  });

  it('should be possible to call .preventDefault', function() {
    var ev = new CustomEvent('test', { cancelable: true });
    ev.preventDefault();
    expect(ev.defaultPrevented).toEqual(true);
  });
});

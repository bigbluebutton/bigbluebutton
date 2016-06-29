describe('Global getters', function () {
  it('should correctly return current config information required by the footer', function () {
    var returnedInfo = getBuildInformation();
    expect(returnedInfo.copyrightYear).toEqual('2014');
    expect(returnedInfo.bbbServerVersion).toEqual('0.9.0');
    expect(returnedInfo.dateOfBuild).toEqual('Sept 25, 2014');
    expect(returnedInfo.link).toEqual(
      "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"
    );
  });
});

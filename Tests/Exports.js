describe('SharedScope: Initial Export', function() {
  it('should be defined in the global scope.', function() {
    expect(window['@PackageFactory.Libraries:SharedScope']).toBeDefined();
  });
});

describe('SharedScope: Integration', function() {

  var SharedScope;

  beforeEach(function() {
    SharedScope = window['@PackageFactory.Libraries:SharedScope'];
  });

  it('should resolve expectations when resource is already present', function(done) {
    SharedScope.set('someIdentifier', { some: 'resource' });
    SharedScope.expect('someIdentifier').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource.some).toBeDefined();
      expect(resource.some).toBe('resource');
    }).then(done, done);


  });

  it('should resolve expectation as soon as the expected resource is present', function(done) {
    SharedScope.expect('someIdentifier').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource.some).toBeDefined();
      expect(resource.some).toBe('resource');
    }).then(done, done);

    SharedScope.set('someIdentifier', { some: 'resource' });
  });

  it('should accept multiple resources at once', function(done) {
    SharedScope.expose('a', {
      a: 'resource_a',
      b: 'resource_b'
    });

    SharedScope.expect('aa').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource).toBe('resource_a');
    }).then(done, done);

    SharedScope.expect('ab').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource).toBe('resource_b');
    }).then(done, done);

    SharedScope.expect('bc').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource).toBe('resource_c');
    }).then(done, done);

    SharedScope.expect('bd').then(function(resource) {
      expect(resource).toBeDefined();
      expect(resource).toBe('resource_d');
    }).then(done, done);

    SharedScope.expose('b', {
      c: 'resource_c',
      d: 'resource_d'
    });
  });

  it('should resolve multiple expectations at once', function(done) {
    SharedScope.set('a', 'resource_a');
    SharedScope.set('b', 'resource_b');

    SharedScope.expect(['a', 'b']).then(function(values) {
      expect(values[0]).toBeDefined();
      expect(values[1]).toBeDefined();
      expect(values[0]).toBe('resource_a');
      expect(values[1]).toBe('resource_b');
    }).then(done, done);

    SharedScope.expect(['c', 'd']).then(function(values) {
      expect(values[0]).toBeDefined();
      expect(values[1]).toBeDefined();
      expect(values[0]).toBe('resource_c');
      expect(values[1]).toBe('resource_d');
    }).then(done, done);

    SharedScope.set('c', 'resource_c');
    SharedScope.set('d', 'resource_d');
  });

  it('should fail after a timeout, when no resource can be found', function(done) {
    SharedScope.expect('something-that-is-not-there', 500).then(undefined, function(reason) {
      expect(reason.message).toBe('Expectation timed out after 500 milliseconds.');
    }).then(done, done);
  });

  it('should return a serial version uuid', function() {
    expect(SharedScope.serialVersionUUID()).toBeDefined();
    expect(SharedScope.serialVersionUUID()).toBe('1d8868ac-2911-4521-90c0-fac61e4cef19');
  });
});

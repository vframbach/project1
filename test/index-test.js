var request = require('request'),
    expect = require('chai').expect,
    baseUrl = 'http://localhost:3000';

describe('Take a Hike', function() {

  it('should show index page', function (done) {
    request(baseUrl + '/', function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

});
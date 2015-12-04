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

describe('/takeahike', function() {

  it('should show map and list of hikes', function (done) {
    request(baseUrl + '/takeahike', function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

});

describe('/profile', function() {


  it('it should redirect to log in page', function (done) {
    request({
    	url: baseUrl + '/profile',
    	followRedirect: false
    }, function (error, response, body) {
      expect(response.statusCode).to.equal(302);
      done();
    });
  });

});


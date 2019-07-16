const chaiHttp = require('chai-http');
const chai = require('chai');
const { expect } = require('chai');
const app = require('../server');

chai.use(chaiHttp);
it('should have all required property for trip', function setTime(done) {
  this.timeout(10000);
  chai.request(app)
    .post('/api/v1/auth/trip')
    .send({
      bus_id: 419,
      origin: 'yahooo',
      destination: ' prison',
      trip_date: '2019/12/09',
      fare: 50,
      status: 'active',
      user_id: 419,
      is_admin: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzExIiwiZmlyc3RfbmFtZSI6ImVsaWphaCIsImxhc3RfbmFtZSI6ImJvYnpvbSIsImVtYWlsIjoiZWJvYnpvbUBnbWFpbC5jb20iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNTYzMTE4MjQzfQ.LOcrN3CSkWrxAhjF00CPtcsBoAFf8UzlsuxnaZGsWYI',

    })
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.be.json;
      expect(res.body.data).to.have.property('trip_id');
      expect(res.body.data).to.have.property('bus_id');
      expect(res.body.data).to.have.property('origin');
      expect(res.body.data).to.have.property('destination');
      expect(res.body.data).to.have.property('trip_date');
      expect(res.body.data).to.have.property('fare');
      expect(res.body.data).to.have.property('status');
      expect(res.body.data).to.have.property('user_id');
      expect(res).to.have.status(201);
      done();
    });
});

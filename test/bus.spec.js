const chaiHttp = require('chai-http');
const chai = require('chai');
const { expect } = require('chai');
const app = require('../server');

chai.use(chaiHttp);

describe('POST /api/v1/auth/bus', () => {
  it('should have all property required for adding buses', function setTime(done) {
    this.timeout(10000);
    chai.request(app)
      .post('/api/v1/auth/bus')
      .send({
        year: 2020,
        capacity: 30,
        model: 'benz 419',
        manufacturer: 'China',
        is_admin: true,
        number_plate: 'AZ123',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzExIiwiZmlyc3RfbmFtZSI6ImVsaWphaCIsImxhc3RfbmFtZSI6ImJvYnpvbSIsImVtYWlsIjoiZWJvYnpvbUBnbWFpbC5jb20iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNTYzMTE4MjQzfQ.LOcrN3CSkWrxAhjF00CPtcsBoAFf8UzlsuxnaZGsWYI',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.json;
        expect(res.body).to.have.property('bus_id');
        expect(res.body).to.have.property('number_plate');
        expect(res.body).to.have.property('model');
        expect(res.body).to.have.property('year');
        expect(res.body).to.have.property('manufacturer');
        expect(res.body).to.have.property('capacity');
        expect(res).to.have.status(201);
        done();
      });
  });

  it('should have required properties for wrong email', (done) => {
    chai.request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'ebobzom@gmail.com*',
        password: '1',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.json;
        expect(res).to.have.property('status');
        expect(res).to.have.property('error');
        expect(res).to.have.status(401);
        done();
      });
  });
});

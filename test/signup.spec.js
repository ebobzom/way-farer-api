const chaiHttp = require('chai-http');
const chai = require('chai');
const { expect } = require('chai');
const app = require('../server');

chai.use(chaiHttp);

describe('POST /api/v1/auth/signup', () => {
  it('should have all required property', (done) => {
    chai.request(app)
      .post('/api/v1/auth/signup')
      .send({
        first_name: 'elijah',
        last_name: 'bobzom',
        email: 'ebobzom@gmail.com',
        password: '123',
        is_admin: true,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.json;
        expect(res.body.data).to.have.property('user_id');
        expect(res.body.data).to.have.property('first_name');
        expect(res.body.data).to.have.property('last_name');
        expect(res.body.data).to.have.property('email');
        expect(res.body.data).to.have.property('is_admin');
        expect(res.body.data).to.have.property('token');
        expect(res).to.have.status(201);
        expect(res).to.have.cookie('key');
        done();
      });
  });

  it('should have required properties for duplicate email', (done) => {
    chai.request(app)
      .post('/api/v1/auth/signup')
      .send({
        first_name: 'elijah',
        last_name: 'bobzom',
        email: 'ebobzom@gmail.com',
        password: '1',
        is_admin: true,
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

const chai = require('chai');
const sinon = require('sinon');
const requestSupertest = require('supertest');
const app = require('../app.js');
const UserService = require('../service/userService');

const expect = chai.expect;


describe('User Controller', () => {
  let serviceRegisterStub, serviceloginStub;

  beforeEach(() => {
    serviceRegisterStub = sinon.stub(UserService, 'register');
    serviceloginStub = sinon.stub(UserService, 'login');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deve registrar usuário com sucesso', async () => {
    serviceRegisterStub.returns({ login: 'user1', senha: '123' });
    const res = await requestSupertest(app)
      .post('/register')
      .send({ login: 'user1', senha: '123' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message');
    expect(res.body.user.login).to.equal('user1');
  });

  it('deve retornar erro ao registrar usuário duplicado', async () => {
    serviceRegisterStub.throws(new Error('Usuário já existe'));
    const res = await requestSupertest(app)
      .post('/register')
      .send({ login: 'user1', senha: '123' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Usuário já existe');
  });

  it('deve realizar login com sucesso', async () => {
    serviceloginStub.returns({ login: 'user1', senha: '123' });
    const res = await requestSupertest(app)
      .post('/login')
      .send({ login: 'user1', senha: '123' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
    expect(res.body.user.login).to.equal('user1');
  });

  it('deve retornar erro ao tentar login inválido', async () => {
    serviceloginStub.throws(new Error('Login ou senha inválidos'));
    const res = await requestSupertest(app)
      .post('/login')
      .send({ login: 'user1', senha: 'errada' });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('error', 'Login ou senha inválidos');
  });

  it('deve chamar o service correto para registro e login', async () => {
    serviceRegisterStub.returns({ login: 'user2', senha: 'abc' });
    serviceloginStub.returns({ login: 'user2', senha: 'abc' });
    await requestSupertest(app).post('/register').send({ login: 'user2', senha: 'abc' });
    await requestSupertest(app).post('/login').send({ login: 'user2', senha: 'abc' });
    sinon.assert.calledOnce(serviceRegisterStub);
    sinon.assert.calledOnce(serviceloginStub);
  });
   //teste extra para estudos
  it('deve registrar um novo usuário na API real,Falha se Api nao estiver startada', async () => {
    sinon.restore();
    const apiReal = requestSupertest('http://localhost:3000');    
    const login = 'usuario_real_' + Date.now();
    const senha = 'senhaReal';
    const res = await apiReal
      .post('/register')
      .send({ login, senha });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message');
    expect(res.body.user.login).to.equal(login);
  });

});

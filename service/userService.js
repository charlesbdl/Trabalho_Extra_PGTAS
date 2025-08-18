const { users } = require('../model/userModel');

class UserService {
  static register(login, senha) {
    if (users.find(u => u.login === login)) {
      throw new Error('Usuário já existe');
    }
    const user = { login, senha };
    users.push(user);
    return user;
  }

  static login(login, senha) {
    const user = users.find(u => u.login === login && u.senha === senha);
    if (!user) {
      throw new Error('Login ou senha inválidos');
    }
    return user;
  }
}

module.exports = UserService;

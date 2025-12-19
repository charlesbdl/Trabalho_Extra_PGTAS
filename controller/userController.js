/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Usuário já existe
 *
 * /login:
 *   post:
 *     summary: Realiza login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Login ou senha inválidos
 */
const express = require('express');
const router = express.Router();
const UserService = require('../service/userService');

router.post('/register', (req, res) => {
  const { login, senha } = req.body;
  try {
    const user = UserService.register(login, senha);
    // Gera um token simples para os testes
    const token = `token_${login}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso', 
      user: { login: user.login },
      token: token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { login, senha } = req.body;
  try {
    const user = UserService.login(login, senha);
    // Gera um token simples para os testes
    const token = `token_${login}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.json({ 
      message: 'Login realizado com sucesso', 
      user: { login: user.login },
      token: token
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Endpoint protegido para testes
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }
  
  const token = authHeader.substring(7);
  
  // Validação simples do token (para testes)
  if (!token.startsWith('token_')) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  // Extrai o login do token
  const loginFromToken = token.split('_')[1];
  
  res.json({
    message: 'Perfil acessado com sucesso',
    user: { login: loginFromToken },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

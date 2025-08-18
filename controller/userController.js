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
    res.status(201).json({ message: 'Usuário registrado com sucesso', user: { login: user.login } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { login, senha } = req.body;
  try {
    const user = UserService.login(login, senha);
    res.json({ message: 'Login realizado com sucesso', user: { login: user.login } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;

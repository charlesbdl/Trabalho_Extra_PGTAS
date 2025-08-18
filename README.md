# Sobre este projeto

Esta API foi construída a partir do seguinte prompt:

> "Construir uma API simples de login com separação entre Controller, Service e Model . 1) login e senha devem ser informados para logar, 2) não deve ser possível registrar usuários duplicados . O banco de dados será em memória, armazenando dados em variáveis. O diretório da aplicação deve ser divido em controller, service e model. Adote o uso de Swagger para documentar a API Rest e disponibilize um endpoint para renderização do Swagger. Construa um arquivo README.md para documentar como configurar e operar a API."

O desenvolvimento desta API foi realizado utilizando a inteligência artificial GPT-4.1.
## Testes Automatizados


### Como rodar os testes automatizados

1. Certifique-se de que as dependências estão instaladas:
   ```bash
   npm install
   ```

2. Os testes foram escritos em TypeScript para ter uma melhor navegação no editor e autocompletar, e utilizam Mocha, Chai (versão 4), Sinon e SuperTest.

3. Para rodar os testes, execute:
   ```bash
   npm test
   ```
   ou, se preferir, diretamente:
   ```bash
   npx mocha --require ts-node/register --extension ts "test/**/*.ts"
   ```

> **Importante:**
> - Os testes devem ser escritos usando `require` para os imports (CommonJS), mesmo em arquivos `.ts`.
> - O projeto utiliza Chai v4 para evitar conflitos com TypeScript.
> - Não é necessário arquivo de configuração extra para rodar os testes.
# API de Login Simples

Esta API permite o registro e login de usuários, com separação entre Controller, Service e Model. O banco de dados é em memória (variáveis). Documentação via Swagger.

## Estrutura de Pastas

- `controller/` — Lógica dos endpoints
- `service/` — Regras de negócio
- `model/` — Modelos de dados

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie a API:
   ```bash
   npm start
   ```

## Endpoints

- `POST /register` — Registra um novo usuário (`login`, `senha`)
- `POST /login` — Realiza login (`login`, `senha`)
- `GET /docs` — Documentação Swagger

## Observações
- Não é possível registrar usuários duplicados.
- O banco de dados é volátil (em memória).

## Documentação Swagger
Acesse `/docs` após iniciar a API para visualizar e testar os endpoints.

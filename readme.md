# OficinaSync API

Projeto desenvolvido para a disciplina de Desenvolvimento de Servicos e APIs do curso de Analise e Desenvolvimento de Sistemas (ADS) do UniSenac Campus Pelotas.

Esta API REST gerencia uma oficina mecanica, com cadastro de mecanicos, pecas, consertos e itens utilizados nos servicos. No Trabalho 2, o projeto recebeu recursos de seguranca como usuarios, login com token, recuperacao de senha, logs, niveis de acesso e ultimo login.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- MySQL/MariaDB
- Zod
- BcryptJS
- JSON Web Token
- Nodemailer
- Mailtrap

## Modelos Principais

- `Mecanico`: profissional responsavel pelos consertos.
- `Peca`: item de estoque usado nos consertos.
- `Conserto`: servico feito em um veiculo.
- `ItemConserto`: peca usada em um conserto, com quantidade e preco unitario.
- `Usuario`: usuario do sistema, com e-mail, senha criptografada, nivel de acesso e ultimo login.
- `Log`: registro de acoes e tentativas feitas no sistema.

## Recursos de Seguranca Implementados

### Usuario e Senha

- Cadastro de usuarios.
- Listagem de usuarios sem exibir senha.
- Senha criptografada com `bcryptjs`.
- Validacao de senha forte:
  - minimo 8 caracteres;
  - letra minuscula;
  - letra maiuscula;
  - numero;
  - simbolo.
- Bloqueio de cadastro com e-mail duplicado.

### Login e Token

- Rota de login com validacao de e-mail e senha.
- Geracao de token JWT.
- Middleware de autenticacao por header:

```http
Authorization: Bearer SEU_TOKEN
```

### Niveis de Acesso

O campo `nivel` do usuario define permissoes:

- Nivel 1: acesso basico.
- Nivel 2: pode cadastrar e alterar recursos protegidos.
- Nivel 3: pode excluir recursos protegidos.

Rotas protegidas por nivel:

- `POST /pecas`: nivel 2.
- `PUT /pecas/:id`: nivel 2.
- `DELETE /pecas/:id`: nivel 3.
- `POST /consertos`: nivel 2.
- `POST /consertos/:id/itens`: nivel 2.
- `DELETE /consertos/:id`: nivel 3.
- `DELETE /consertos/:consertoId/itens/:itemId`: nivel 3.

### Recuperacao de Senha

- Rota para solicitar recuperacao de senha.
- Geracao de codigo numerico de 6 digitos.
- Codigo salvo no usuario com validade de 15 minutos.
- Envio do codigo por e-mail usando Nodemailer e Mailtrap.
- Rota para alterar a senha usando o codigo.
- Nova senha tambem passa pelas regras de senha forte.

### Logs

O sistema registra acoes em uma tabela de logs relacionada ao usuario.

Acoes registradas:

- Cadastro de usuario.
- Login realizado com sucesso.
- Login invalido.
- Solicitacao de recuperacao de senha.
- Alteracao de senha por codigo.
- Cadastro de peca.
- Cadastro de conserto.
- Inclusao de item em conserto.

### Ultimo Login

No login, a API:

- verifica o valor anterior de `ultimoLogin`;
- informa se e o primeiro acesso ou mostra a data do ultimo acesso;
- atualiza `ultimoLogin` para a data/hora atual.

## Regras de Negocio

### Estoque em Consertos

Ao adicionar uma peca a um conserto:

1. O sistema verifica se a peca existe.
2. O sistema verifica se existe estoque suficiente.
3. O item e registrado no conserto.
4. O estoque da peca e reduzido.
5. Se houver erro, a transacao e revertida.

Ao remover um item de um conserto:

1. O item e excluido.
2. A quantidade usada volta para o estoque.

### Relatorio por E-mail

O sistema envia um relatorio HTML do conserto para o e-mail do mecanico responsavel, contendo:

- dados do conserto;
- mecanico responsavel;
- pecas utilizadas;
- quantidades;
- valores unitarios;
- total geral.

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/oficinasync"

MAILTRAP_USER=seu_usuario
MAILTRAP_PASS=sua_senha

JWT_SECRET=um_segredo_para_assinar_tokens

PORT=3000
```

Observacao: o projeto usa a porta `3000` no servidor.

## Como Executar

Instale as dependencias:

```bash
npm install
```

Execute as migrations:

```bash
npx prisma migrate deploy
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Inicie o servidor:

```bash
npm run dev
```

A API ficara disponivel em:

```txt
http://localhost:3000
```

## Rotas Principais

### Usuarios

#### Criar usuario

```http
POST /usuarios
```

```json
{
  "nome": "Admin Oficina",
  "email": "admin@oficina.com",
  "senha": "Admin@123",
  "nivel": 3
}
```

#### Listar usuarios

```http
GET /usuarios
```

#### Recuperar senha

```http
POST /usuarios/recuperar-senha
```

```json
{
  "email": "admin@oficina.com"
}
```

#### Alterar senha por codigo

```http
POST /usuarios/alterar-senha-recuperacao
```

```json
{
  "email": "admin@oficina.com",
  "codigo": "123456",
  "novaSenha": "NovaSenha@123"
}
```

### Login

```http
POST /login
```

```json
{
  "email": "admin@oficina.com",
  "senha": "Admin@123"
}
```

Resposta esperada:

```json
{
  "mensagem": "Login realizado com sucesso",
  "ultimoLogin": "Bem-vindo. Este e o seu primeiro acesso ao sistema",
  "token": "TOKEN_JWT",
  "usuario": {
    "id": 1,
    "nome": "Admin Oficina",
    "email": "admin@oficina.com",
    "nivel": 3
  }
}
```

### Mecanicos

```http
GET /mecanicos
GET /mecanicos/:id
POST /mecanicos
PUT /mecanicos/:id
DELETE /mecanicos/:id
```

Exemplo de cadastro:

```json
{
  "nome": "Carlos Silva",
  "especialidade": "Motor",
  "email": "carlos@oficina.com"
}
```

### Pecas

```http
GET /pecas
GET /pecas/:id
POST /pecas
PUT /pecas/:id
DELETE /pecas/:id
```

Exemplo de cadastro:

```json
{
  "nome_peca": "Filtro de oleo",
  "qtd_estoque": 10,
  "preco_venda": 45.9
}
```

### Consertos

```http
GET /consertos
GET /consertos/:id
POST /consertos
DELETE /consertos/:id
GET /consertos/:id/itens
POST /consertos/:id/itens
DELETE /consertos/:consertoId/itens/:itemId
GET /consertos/email/:id
```

Exemplo de cadastro de conserto:

```json
{
  "carro_modelo": "Gol 1.6",
  "mecanicoId": 1
}
```

Exemplo de item de conserto:

```json
{
  "pecaId": 1,
  "quant_usada": 2,
  "preco_unit": 45.9
}
```

## Testes Sugeridos

1. Criar usuario nivel 3.
2. Criar usuario nivel 2.
3. Tentar criar usuario com senha fraca.
4. Tentar criar usuario com e-mail duplicado.
5. Fazer login e copiar o token.
6. Acessar rota protegida sem token.
7. Acessar rota protegida com token.
8. Testar exclusao com usuario nivel 2 e confirmar erro de permissao.
9. Testar exclusao com usuario nivel 3.
10. Solicitar recuperacao de senha e verificar codigo no Mailtrap.
11. Alterar senha usando codigo de recuperacao.
12. Fazer login novamente e verificar mensagem de ultimo acesso.

## Conceitos Aplicados

- API REST.
- CRUD.
- Validacao de dados com Zod.
- Relacionamentos no banco.
- Transacoes com Prisma.
- Criptografia de senha.
- Autenticacao com JWT.
- Middleware de autenticacao.
- Middleware de autorizacao por nivel.
- Recuperacao de senha por e-mail.
- Logs de auditoria.
- Controle de estoque.
- Envio de relatorio por e-mail.

## Autor

Leonardo Rosler

Projeto academico desenvolvido para a disciplina de Desenvolvimento de Servicos e APIs do curso de Analise e Desenvolvimento de Sistemas - UniSenac Pelotas.

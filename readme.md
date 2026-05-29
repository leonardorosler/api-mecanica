# OficinaSync API 🛠️

Projeto desenvolvido para a disciplina de **Desenvolvimento de Serviços e APIs** do curso de **Análise e Desenvolvimento de Sistemas (ADS)** do **UniSenac Campus Pelotas**.

A aplicação consiste em uma API REST para gerenciamento de oficinas mecânicas, permitindo o controle de mecânicos, peças, consertos e itens utilizados nos serviços, com foco em integridade dos dados através de transações e automação de relatórios por e-mail.

---

## 🚀 Tecnologias Utilizadas

* **Node.js** — Ambiente de execução JavaScript.
* **TypeScript** — Tipagem estática para maior segurança e produtividade.
* **Express.js** — Framework para construção da API REST.
* **Prisma ORM** — Mapeamento objeto-relacional e gerenciamento do banco de dados.
* **MySQL** — Banco de dados relacional.
* **Zod** — Validação de dados de entrada.
* **Nodemailer** — Envio de e-mails transacionais.
* **Mailtrap** — Ambiente de testes para envio de e-mails.

---

## 📊 Modelagem do Sistema

O sistema é composto por quatro entidades principais:

### Mecânico

Responsável pelo cadastro dos profissionais da oficina.

### Peça

Controle de estoque das peças disponíveis, incluindo quantidade e preço.

### Conserto

Registro dos serviços realizados em veículos.

### ItemConserto

Tabela relacional responsável por vincular peças aos consertos realizados, armazenando informações como quantidade utilizada e valor praticado no momento do serviço.

---

## 🔗 Relacionamentos

* Um conserto pode possuir vários itens.
* Um item pertence a um único conserto.
* Uma peça pode ser utilizada em vários itens de conserto.
* Um mecânico pode ser responsável por vários consertos.

---

## ⚙️ Regras de Negócio

### Inclusão de Itens em Consertos

Ao adicionar uma peça a um conserto:

1. O sistema verifica a disponibilidade em estoque.
2. Caso exista quantidade suficiente:

   * O item é registrado.
   * O estoque é atualizado automaticamente.
3. Caso não exista quantidade suficiente:

   * A operação é cancelada.
   * Nenhuma alteração é persistida no banco de dados.

### Exclusão de Itens

Ao remover um item de um conserto:

1. O item é excluído.
2. A quantidade utilizada é devolvida ao estoque automaticamente.

### Relatório por E-mail

O sistema permite gerar e enviar um relatório detalhado do conserto para o mecânico responsável.

O relatório contém:

* Dados do conserto;
* Peças utilizadas;
* Quantidades consumidas;
* Valores unitários;
* Valor total do serviço.

O e-mail é enviado em formato HTML utilizando Nodemailer e Mailtrap.

---

## 🔒 Integridade dos Dados

Para garantir consistência das informações, as operações críticas utilizam **transações do Prisma**.

As transações garantem que:

* Todas as etapas da operação sejam concluídas com sucesso;
* Em caso de erro, todas as alterações sejam revertidas automaticamente (rollback).

---

## 🛠️ Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/oficinasync"

MAILTRAP_USER=seu_usuario
MAILTRAP_PASS=sua_senha

PORT=3000
```

### 4. Executar as migrations

```bash
npx prisma migrate dev
```

### 5. Gerar o Prisma Client

```bash
npx prisma generate
```

### 6. Iniciar o servidor

```bash
npm run dev
```

---

## 📚 Conceitos Aplicados

Durante o desenvolvimento foram utilizados conceitos importantes de desenvolvimento backend:

* APIs REST
* CRUD completo
* Validação de dados
* Relacionamentos em banco de dados
* Transações
* Tratamento de erros
* Envio de e-mails
* TypeScript
* Prisma ORM
* Arquitetura em camadas

---

## 👨‍💻 Autor

**Leonardo Rosler**

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento de Serviços e APIs** do curso de **Análise e Desenvolvimento de Sistemas – UniSenac Pelotas**.

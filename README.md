# API China Box

Projeto desenvolvido com fins acadêmico durante a aula de Desenvolvimento de Backend para aplicativos móveis, afim de prover serviços para um aplicativo do China Box.

By: Samuel Mesquita

## Instruções

Para rodar o projeto, será necessário ter instalado em sua máquina o [Node.js](https://nodejs.org/en/), [Git](https://git-scm.com/) e um editor de texto de sua preferência.

### Banco de Dados:

Para o funcionamento da aplicação utilizamos um banco em nuvem da Mongo Atlas.

### Instalação

```bash
## Clonar ou baixar o projeto. Acesse a pasta do projeto.
cd api-china-box

## Instale as dependências
npm install

## Será necessário a criação de um arquivo chamado .ENV na raiz
## do projeto com as seguintes variáveis de ambiene:
PORT=<Porta de sua preferencia. Para projetos node a default é 3000>
BD_USER=<usuario-banco>
BD_PASSWORD=<senha-banco>
BD_NAME=<nome-banco>


## Rodar o projeto no ambiente de produção
npm start

## Rodar o projeto no ambiente de desenvolvimento com nodemon
npm run dev

## O projeto será iniciado na porta escolhida: 
## Exemplo: http://localhost:3000

```

## Tecnologias Usadas

* NodeJS
* MongoDB
* mongoose
* nodemon
* express

## Funcionalidade

Esta API provê os seguintes endpoints:

### Produtos

#### POST - ``/produtos ``
* Gera uma nova instancia de produtos no banco de dados.

#### GET - ``/produtos``
* Busca a lista de produtos;

#### GET - ``/produtos/{id}``
* Busca os dados de um produto, a partir do ID informado.

#### PATCH - ``/produtos/{id}``
* Atualiza um produto no banco de dados, a partir do ID informado.

#### DELETE - ``/produtos/{id}``
* Exclui um produto do banco de dados, a partir do ID informado.


### Pedidos
#### POST - ``/pedidos``
* Gera uma nova instancia de pedidos no banco de dados.

#### GET - ``/pedidos``
* Busca a lista de pedidos;

#### GET - ``/pedidos/{id}``
* Busca os dados de um pedido, a partir do ID informado.

#### DELETE ``/pedidos/{id}``
* Exclui um pedido do banco de dados, a partir do ID informado.

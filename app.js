//importamos o framework web para Node.js express
const express = require("express");
//módulo que fornece funcionalidades de criptografia.
const crypto = require("crypto");
//Criando a instância do aplicativo Express. App é essencialp para a aplicação
const app = express();
//Define o local dos arquivos estáticos como HTML, CSS, imagens e JavaScript
app.use(express.static("./public"));
//Define o motor de renderizacao das paginas dinamicas
app.set("view engine", "pug");
//Define o local onde estão as minhas páginas dinâmicas
app.set("views", "./views");
//middleware é usado para interpretar dados de formulários enviados via POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Lista de usuários
const users = [
    {
        uid: 1,
        name: "Emanuel Freitas",
        email: "emanuel@example.com",
        password: "senha123",
    },
    {
        uid: 2,
        name: "Ariana Grande",
        email: "grande@example.com",
        password: "senha456",
    },
];

let session = {};

// Função de autenticação
function autenticador(email, password) {
    let count;
    let token;

    for (count = 0; count < users.length; count++) {
        if (
            users[count].email === email &&
            users[count].password === password
        ) {
            //Chama a função  para criar um token de autenticação para o usuario autenticado.
            token = gerarToken(users[count]);
            return { user: users[count], authToken: token };
        }
    }
    return null;
}

// Função para gerar um token baseado nas informações do usuário
function gerarToken(user) {
    //String basica é criada juntando o id o email e a data em millisegundos
    const tokenBase = `${user.uid}-${user.email}-${Date.now()}`;
    //Converte o resultado do hash para uma representação hexadecimal,
    return crypto.createHash("sha256").update(tokenBase).digest("hex");
}
// Middleware de autenticação
function authMiddleware(req, res, next) {
    const { authToken } = req.query;

    if (session.authToken === authToken) {
        req.user = session.user;
        console.log(session.user);
        next();
    } else {
        console.log(session.user);
        res.status(401).redirect("/");
    }
}

//Rota principal
app.get("/", (_, res) => {
    res.render("login");
});

// Rota de autenticação
app.post("/authenticated", (req, res) => {
    const { email, password } = req.body;
    const authResult = autenticador(email, password);
    session = autenticador(email, password);

    if (authResult) {
        res.status(200).json({
            message: "Login realizado com sucesso!",
            authToken: authResult.authToken,
        });
        //res.redirect(`/home?token=${authResult.token}`);
    } else {
        res.status(401).json({ message: "Usuário ou senha inválidos" });
    }
});

// Rota protegida - Home
app.get("/home", authMiddleware, (req, res) => {
    res.render("home", {
        produtos,
        user: session.user,
        authToken: session.authToken,
    });
});

// Produtos para exibição

const produtos = [
    {
        id: 1,
        nome: "Notebook",
        descricao:
            "Notebook Dell Inspiron 15, com processador Intel i7, 16GB de RAM, 512GB SSD, tela Full HD de 15.6 polegadas.",
        preco: 2999.99,
    },
    {
        id: 2,
        nome: "Mouse",
        descricao:
            "Mouse sem fio Logitech MX Master 3, ergonômico, com sensor de alta precisão e bateria recarregável.",
        preco: 99.99,
    },
    {
        id: 3,
        nome: "Teclado",
        descricao:
            "Teclado mecânico sem fio Keychron K2, com switches Red, retroiluminação RGB, compatível com Windows e macOS.",
        preco: 199.99,
    },
    {
        id: 4,
        nome: "Monitor",
        descricao:
            "Monitor LG UltraWide 34'', resolução 2560x1080, tecnologia IPS, ideal para multitarefa e edição de vídeo.",
        preco: 1499.99,
    },
];

// Rota protegida - Produtos
app.get("/produtos", authMiddleware, (req, res) => {
    res.render("produtos", { authToken: session.authToken, produtos });
});

// Rota protegida - Cadastro
app.get("/cadastro", authMiddleware, (req, res) => {
    res.render("cadastro", { authToken: session.authToken });
});
//Define uma rota que aceita requisições POST no caminho /cadastro. Antes de executar a lógica do callback, a função authMiddleware é chamada para verificar se o usuário está autenticado.
app.post("/cadastro", authMiddleware, (req, res) => {
    //Extrai os campos nome, descricao e preco do corpo da requisição
    const { nome, descricao, preco } = req.body;
    //Cria um novo objeto novoProduto
    const newProduto = {
        id: produtos.length + 1,
        nome,
        descricao,
        preco: parseFloat(preco),
    };
    //Adicionando o novo Produto
    produtos.push(newProduto);
    //pós adicionar o produto, a resposta redireciona o usuário para a rota /produtos, incluindo o authToken
    res.redirect(`/produtos?authToken=${session.authToken}`);
});
// Rota para Logout
app.get("/logout", (req, res) => {
    // Limpa a sessão do usuário
    session = {};
    res.redirect("/"); // Redireciona para a página de login
});
// Iniciar o servidor
const server = app.listen(3000, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(
        `Aplicação  está rodando no endereço IP ${host} e na porta ${port}`,
    );
});

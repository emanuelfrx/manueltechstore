const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simulação de um armazenamento de sessões em memória (um objeto simples)
const sessoes = {}; // Exemplo: { 'sessionID': { nome: 'Wellington' }}

// Middleware para analisar cookies de requisição
function parseCookies(req, _, next) {
    const rawCookies = req.headers.cookie ? req.headers.cookie.split("; ") : [];
    const parsedCookies = {};
    rawCookies.forEach((cookie) => {
        const [key, value] = cookie.split("=");
        parsedCookies[key] = value;
    });
    req.cookies = parsedCookies;
    next();
}

app.use(parseCookies);

//Rota Princial
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Rota de login - Cria uma nova sessão
app.post("/login", (req, res) => {
    const { nome } = req.body;

    // Gera um ID de sessão único
    const sessionID = crypto.randomBytes(16).toString("hex");

    // Armazena o nome do usuário na "variável de sessão"
    sessoes[sessionID] = { nome };

    // Envia o sessionID ao cliente como um cookie
    res.cookie("sessionID", sessionID, { httpOnly: true });
    res.send(`Sessão criada para ${nome}`);
});

// Rota protegida - Acessa a variável de sessão
app.get("/meus-dados", (req, res) => {
    const sessionID = req.cookies.sessionID; // Obtém o sessionID do cookie
    const userSession = sessoes[sessionID]; // Busca a sessão na memória

    if (userSession) {
        res.send(`Bem-vindo de volta, ${userSession.nome}`);
    } else {
        res.status(401).send("Você precisa fazer login primeiro.");
    }
});

// Rota de logout - Destroi a sessão
app.get("/logout", (req, res) => {
    const sessionID = req.cookies.sessionID;
    delete sessoes[sessionID]; // Remove a sessão da memória
    res.send("Sessão encerrada. Você foi desconectado.");
});

app.get("/lista-sessoes", (req, res) => {
    res.send(Object.keys(sessoes));
});

// Iniciar o servidor
app.listen(4000, () => {
    console.log("Servidor rodando na porta 4000");
});

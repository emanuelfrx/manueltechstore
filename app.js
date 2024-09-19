const express = require("express");
const session = require("express-session");
const path = require("path");
const admin = require("./firebase-config"); // Firebase Admin SDK
const {
    getFirestore,
    collection,
    getDocs,
} = require("firebase-admin/firestore");

const app = express();
const db = getFirestore();

app.use(
    session({
        secret: "seu-segredo-de-sessao",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Mudar para true se estiver usando HTTPS
    }),
);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Rota de login (GET)
app.get("/", (req, res) => {
    res.redirect("login");
});

// Rota de login (GET)
app.get("/login", (req, res) => {
    res.render("login");
});

// Rota de login (POST) - para criar a sessão
app.post("/login", (req, res) => {
    const { email } = req.body;

    // Armazena o email na sessão
    req.session.user = { email };
    // res.status(200).send("Usuário autenticado"); // Resposta ao cliente
    res.redirect("/produtos");
});

// Middleware para verificar se o usuário está autenticado
function verificarAutenticacao(req, res, next) {
    if (req.session.user) {
        next(); // Usuário autenticado, prossegue
    } else {
        res.redirect("/login"); // Redireciona para login se não autenticado
    }
}

// Rota de produtos protegida
app.get("/produtos", verificarAutenticacao, async (req, res) => {
    try {
        const produtosCollection = db.collection("produtos"); // Mudança aqui
        const produtosSnapshot = await produtosCollection.get(); // Mudança aqui
        const produtos = produtosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.render("produtos", { user: req.session.user, produtos });
    } catch (error) {
        console.error("Erro ao obter produtos:", error);
        res.status(500).send("Erro ao obter produtos");
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

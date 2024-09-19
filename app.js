const express = require("express");
const session = require("express-session");
const path = require("path");
const { admin, db } = require("./firebase-config");
const {
    getFirestore,
    collection,
    getDocs,
} = require("firebase-admin/firestore");

const app = express();

// Importa admin e db
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

// Rota de login (POST)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Autenticar o usuário com Firebase Admin SDK
    admin
        .auth()
        .getUserByEmail(email)
        .then((userRecord) => {
            // Usuário autenticado, salvar na sessão
            req.session.user = { email: userRecord.email, uid: userRecord.uid };
            res.redirect("/produtos");
        })
        .catch((error) => {
            res.render("login", {
                error: "Falha ao fazer login: " + error.message,
            });
        });
});

// Middleware para verificar se o usuário está autenticado
function verificarAutenticacao(req, res, next) {
    if (req.session.user) {
        return res.redirect("/produtos"); // Redireciona para produtos se já autenticado
    } else {
        next(); // Redireciona para login se não autenticado
    }
}

app.get("/produtos", verificarAutenticacao, async (req, res) => {
    try {
        const produtosCollection = db.collection("produtos"); // Acesse a coleção a partir da instância db
        const produtosSnapshot = await produtosCollection.get(); // Obtenha os documentos

        if (produtosSnapshot.empty) {
            console.log("Nenhum produto encontrado.");
            return res.render("produtos", {
                user: req.session.user,
                produtos: [],
            });
        }

        const produtos = produtosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log("Produtos obtidos:", produtos);
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
    console.log("Emanuel TECH STORE rodando na porta 3000");
});

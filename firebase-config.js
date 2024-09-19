const admin = require("firebase-admin");

// Baixe a chave privada JSON do Firebase Console em Configurações -> Contas de serviço
const serviceAccount = require("./minhaChave2.json"); // O caminho do arquivo JSON
//meu Deus nao acredito que deu certo
// Inicializando o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://auth-7f0a8.firebaseio.com",
});
const db = admin.firestore();
module.exports = { admin, db };

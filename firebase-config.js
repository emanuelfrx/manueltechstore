const admin = require("firebase-admin");

// Baixe a chave privada JSON do Firebase Console em Configurações -> Contas de serviço
const serviceAccount = require("./minhaChave.json"); // O caminho do arquivo JSON
//meu Deus nao acredito que deu certo
// Inicializando o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://auth-7f0a8.firebaseio.com",
});
// Your web app's Firebase configuration


// Initialize Firebase
const banco = admin.firestore();
module.exports = { admin, banco };

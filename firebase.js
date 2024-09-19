// Configuração do Firebase (pegue essas informações do Firebase Console)
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseConfig = {
  apiKey: "AIzaSyBrajs_b3rqdh9KnnCr3D5ESltjRxZ122o",
  authDomain: "auth-7f0a8.firebaseapp.com",
  projectId: "auth-7f0a8",
  storageBucket: "auth-7f0a8.appspot.com",
  messagingSenderId: "950113743344",
  appId: "1:950113743344:web:75b59f2d4e72f2bfa72d35",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
// Função para obter produtos
async function obterProdutos() {
  const produtosCollection = collection(db, "produtos");
  const produtosSnapshot = await getDocs(produtosCollection);
  const produtosList = produtosSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return produtosList;
}
module.exports = { firebase, obterProdutos, getFirestore, collection, getDocs };

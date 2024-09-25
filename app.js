
/*aqui eu estou chamando o express que basicamente é um framework responsavel por fazer requisições 
e integrar meus dados com o front end. "Quero pegar um dado do banco de dados" graças ao express*/
const express = require("express");

//Middelware para gerenciar sessões no express, afinal só posso mexer nessa bagaça se estiver autenticado
const session = require("express-session");
//modulo do node que permite manipular caminhos de diretórios
const path = require("path");

/*chamando um arquivo que contem as configurações basicas do firebaser para realizar autenticação, como por exemplo 
link para chave de acesso
*/
const admin = require("./firebase-config"); 


//importando metodos do firestore que serão responsáveis por coletar, cadastrar, editar e excluir dados do firebase veyr
const {
    getFirestore,
    getClientFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    deleteDoc,
    banco,
    auth,
    updateDoc,
    getDoc,
} = require("./firebase");
const app = express();
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require('firebase/auth');


/*Iniciando minha aplicação no firebase. criando o cerebro da aplicação, pelo app eu consigo definir o fluxo de rotas, requisições
por isso que tu usa direto app.get app.post. Get eu estou pegando uma requisição do meu sistema e post eu estou enviando um requisição!
*/

//pegando meu banco de dados, não preciso dizer mais nada 

//confirmando que eu criei um banco e ele funciona, gostou?
console.log("meu banco é esse: ", banco);

/**
 * Um middleware de sessão é uma função intermediária em um servidor web que permite armazenar 
 * e gerenciar informações relacionadas ao estado de uma sessão de usuário entre diferentes 
 * requisições HTTP.(chat gpt)
 */
app.use(
    session({
        secret: "esse segredo eu nao conto pra ninguem",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Mudar para true se estiver usando HTTPS
    }),
);
//configura um motor para usar o pug, que é uma linguagem de template que NA TEORIA facilita
app.set("view engine", "pug");

//depois de chamar o pug eu vou mostrar onde estão esses arquivos que é na pasta views
app.set("views", path.join(__dirname, "views"));

//chamando o express para servir arquivos estaticos, ou seja fotos, css e demais coisas
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json()); // Para JSON

//esse aqui é pra interpretar os dados via post, ou seja quando eu estiver enviando dados
app.use(express.urlencoded({ extended: true }));

/**depois de terminar a configuração do servido vamos usar app para poder encaminhar o comportamento do usuario */


//Essa é a rota rais que é no caso login
app.get("/", (req, res) => {
    res.redirect("login");
});
// rederizando a pagina login
// Rota de login
app.get('/login', (req, res) => {
  res.render('login', { user: req.session.id });
  
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Email:', email); // Log do email
  // Não logar a senha: console.log('Senha:', password);

  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User Credential:", userCredential);
      const user = userCredential.user;

      // Armazenar o usuário como um objeto na sessão
      req.session.user = {
          email: user.email,
          displayName: user.displayName || "Usuario"
      };
      console.log("Usuário logado:", req.session.user);
      res.redirect('/home'); // Redirecionamento para a página home

  } catch (error) {
      console.error("Erro de login:", error); // Log do erro

      // Mensagem de erro específica
      let errorMessage;
      if (error.code === 'auth/wrong-password') {
          errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuário não encontrado. Verifique seu email.';
      } else {
          errorMessage = 'Erro ao fazer login. Tente novamente.';
      }

      // Renderiza a página de login com a mensagem de erro
      res.render('login', { error: errorMessage });
  }
});


// Middleware para verificar se o usuário está autenticado
function verificarAutenticacao(req, res, next) {
  if (req.session.user) {
      next(); // Usuário autenticado, prossegue
  } else {
      res.redirect("/login"); // Redireciona para login se não autenticado
  }
}

app.get('/home', verificarAutenticacao, async (req, res) => {
  console.log('Conteúdo da sessão:', req.session.user); // Log do conteúdo da sessão

  const user = req.session.user; // O usuário é um objeto
  console.log('Email do usuário:', user.email); // Acessando a propriedade email

  // Verifique se o e-mail é válido
  if (!user || typeof user !== 'object' || !user.email) {
      return res.status(400).send('E-mail inválido');
  }

  const nome = user.email.split('@')[0]; // Extrai o nome até o '@'

  try {
      const colecao = await getDocs(collection(banco, 'produtos'))
      const produtos = colecao.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Retorna um objeto que contém todos os dados do documento
      }));

      const authToken = req.session.authToken || null;

      // Renderiza a página com o nome, produtos e authToken
      res.render("home", { nome, produtos, authToken });
  } catch (error) {
      console.error("Não foi possível pegar produtos:", error);
      res.status(500).send("Erro ao obter produtos");
  }
});

// Rota de produtos protegida
app.get("/produtos", verificarAutenticacao, async (req, res) => {
  //produtos é a mesma coisa de home só que a diferença é que ele possui o botão de editar e exluir
    try {
      const colecao = await getDocs(collection(banco, 'produtos'))
        const produtos = colecao.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        const authToken = req.session.authToken || null; // Use o authToken real aqui

        res.render("produtos", { user: req.session.user, produtos, authToken });
        } catch (error) {
        console.error("Erro ao obter produtos:", error);
        res.status(500).send("Erro ao obter produtos");
    }
});

// Encerrando minha sessão
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// renderizando o cadastro
app.get('/cadastro', verificarAutenticacao, (req, res) => {
    const authToken = req.query.authToken;
    // Valide o authToken aqui se necessário
    res.render('cadastro');
});
  
// Rota para processar o envio do formulário de cadastro
app.post('/cadastro', verificarAutenticacao, async (req, res) => {
    const { nome, preco, descricao } = req.body;
    try {
      await addDoc(collection(banco, 'produtos'),{

        nome: nome,
        preco: parseFloat(preco),
        descricao: descricao
      });
      res.redirect('/produtos');
    } catch (e) {
      console.error('Erro ao adicionar documento: ', e);
      res.status(500).send('Erro ao adicionar produto');
    }
  });


  app.get('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const produtoRef = doc(banco, 'produtos', id);

    try {
        const produtoDoc = await getDoc(produtoRef);
        if (!produtoDoc.exists()) {
            return res.status(404).send('Produto não encontrado');
        }
        res.render('cadastro', { produto: { id: id, ...produtoDoc.data() }, isEdit: true });
    } catch (error) {
        console.error('Erro ao buscar produto para edição:', error);
        res.status(500).send('Erro ao buscar produto');
    }
});


app.post('/editar', verificarAutenticacao, async (req, res) => {
  const { id, nome, preco, descricao } = req.body; // Captura o ID aqui
  console.log('ID do produto:', id); // Log do ID para depuração

  console.log('Dados recebidos:', { nome, preco, descricao });

  const idProduto = doc(banco, 'produtos', id);

  try {
      // Verifica se o produto existe
      const produtoDoc = await getDoc(idProduto);
      if (!produtoDoc.exists()) {
          return res.status(404).send('Produto não encontrado');
      }

      // Valida os dados
      if (!nome || isNaN(parseFloat(preco)) || !descricao) {
          return res.status(400).send('Dados inválidos');
      }

      // Atualiza o documento com os novos valores
      await updateDoc(idProduto, {
          nome,
          preco: parseFloat(preco),
          descricao,
      });
      console.log('Produto atualizado com sucesso');
      res.redirect('/produtos');
  } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).send('Erro ao atualizar produto');
  }
});

app.post('/excluir/:id', verificarAutenticacao, async (req, res) => {
  const id = req.params.id;
  console.log('ID do produto para exclusão:', id);

  const idProduto = doc(banco, 'produtos', id);

  try {
      // Verifica se o produto existe
      const produtoDoc = await getDoc(idProduto);
      if (!produtoDoc.exists()) {
          return res.status(404).send('Produto não encontrado');
      }

      // Exclui o documento
      await deleteDoc(idProduto);
      console.log('Produto excluído com sucesso');
      res.redirect('/produtos');
  } catch (error) {
      console.error('Erro ao excluir produto:', error);
      res.status(500).send('Erro ao excluir produto');
  }
});


app.listen(3000, () => {
    console.log("Emanuel TechStore na porta http://localhost:3000");
});

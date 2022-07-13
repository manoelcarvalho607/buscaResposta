const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { application } = require("express");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//Database

connection
    .authenticate()
    .then(() => {
        console.log("conexão feita com o DataBase");
    })
    .catch((error) => {
        console.log("erro ao se conectar com DataBase " + error);
    })


//renderizador de html (ejs)
app.set('view engine', 'ejs');
// carregar arquivos estáticos
app.use(express.static('public'));
// bodyParser decodifica os dados enviando do formulario em uma estrutura js
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
   Pergunta.findAll({raw:true, order:[
    ['id','DESC']
   ]}).then(perguntas=>{
    res.render("index",{
        perguntas: perguntas
    })
   });
});

app.get("/pergunta", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(()=>{
        res.redirect("/");
    }).catch((error)=>{
        res.send("Erro : " + error);
    })

});

app.get("/pergunta/:id", (req, res) =>{
    var id = req.params.id;
    Pergunta.findOne({
        where: {id:id}
    }).then(pergunta => {
        if(pergunta != undefined){

            Resposta.findAll({
                where: {perguntaId: pergunta.id}
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta: pergunta,
                    respostas : respostas
                });

            })


           
        }else{
            res.redirect("/");
        }
    })
});


app.post("/responder",(req, res) =>{
    var corpo = req.body.corpo;
    var perguntaId = req.body.id;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=>{
        res.redirect("/pergunta/" + perguntaId);
    })
});



app.listen(8080, () => {
    console.log("App rodando!");
});
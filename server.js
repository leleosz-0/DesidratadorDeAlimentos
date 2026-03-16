const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 3000;
const SECRET_KEY = "supersecreto123";

app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("desidratador.db");

db.serialize(() => {
  // Usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    pergunta TEXT,
    resposta TEXT
  )`);

  // Alimentos
  db.run(`CREATE TABLE IF NOT EXISTS alimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    temperatura REAL,
    tempo INTEGER,
    user_id INTEGER
  )`);

  // Sensor (apenas 1 linha, status atual)
  db.run(`CREATE TABLE IF NOT EXISTS sensor (
    id INTEGER PRIMARY KEY CHECK(id=1),
    temperatura REAL
  )`);
  db.run(`INSERT OR IGNORE INTO sensor (id, temperatura) VALUES (1,0)`);

  // Setpoint
  db.run(`CREATE TABLE IF NOT EXISTS setpoints (
    id INTEGER PRIMARY KEY CHECK(id=1),
    valor REAL DEFAULT 65
  )`);
  db.run(`INSERT OR IGNORE INTO setpoints (id, valor) VALUES (1,65)`);
});

// Registro/Login
app.post("/register", async (req,res)=>{
  const {username,password,pergunta,resposta} = req.body;
  const hash = await bcrypt.hash(password,10);
  const hashResp = await bcrypt.hash(resposta,10);
  db.run(`INSERT INTO users (username,password,pergunta,resposta) VALUES (?,?,?,?)`,
    [username,hash,pergunta,hashResp], function(err){
      if(err) return res.status(400).json({error:"Usuário já existe"});
      res.json({message:"Registrado"});
    });
});

app.post("/login", (req,res)=>{
  const {username,password} = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err,user)=>{
    if(!user) return res.status(400).json({error:"Usuário não encontrado"});
    const valid = await bcrypt.compare(password,user.password);
    if(!valid) return res.status(400).json({error:"Senha inválida"});
    const token = jwt.sign({id:user.id},SECRET_KEY);
    res.json({token});
  });
});

// Esqueci senha
app.post("/forgot-password", (req,res)=>{
  const {username,resposta,novaSenha} = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err,user)=>{
    if(!user) return res.status(400).json({error:"Usuário não existe"});
    const valid = await bcrypt.compare(resposta,user.resposta);
    if(!valid) return res.status(400).json({error:"Resposta incorreta"});
    const hashNova = await bcrypt.hash(novaSenha,10);
    db.run(`UPDATE users SET password=? WHERE id=?`, [hashNova,user.id]);
    res.json({message:"Senha alterada"});
  });
});

// Middleware JWT
function auth(req,res,next){
  const token = req.headers["authorization"];
  if(!token) return res.status(401).json({error:"Token faltando"});
  jwt.verify(token,SECRET_KEY,(err,decoded)=>{
    if(err) return res.status(401).json({error:"Token inválido"});
    req.user = decoded;
    next();
  });
}

// CRUD Alimentos
app.post("/alimentos", auth, (req,res)=>{
  const {nome,temperatura,tempo} = req.body;
  db.run(`INSERT INTO alimentos (nome,temperatura,tempo,user_id) VALUES (?,?,?,?)`,
    [nome,temperatura,tempo,req.user.id], function(err){
      if(err) return res.status(400).json({error:err.message});
      res.json({id:this.lastID});
    });
});
app.get("/alimentos", auth, (req,res)=>{
  db.all(`SELECT * FROM alimentos WHERE user_id=?`, [req.user.id], (err,rows)=> res.json(rows));
});

// Sensor / Setpoint
app.post("/sensor-data", (req,res)=>{
  const {temperatura} = req.body;
  db.run(`UPDATE sensor SET temperatura=? WHERE id=1`, [temperatura]);
  db.get(`SELECT valor FROM setpoints WHERE id=1`, [], (err,row)=>{
    res.json({ setpoint: row ? row.valor : 65 });
  });
});

app.get("/sensor-data", auth, (req,res)=>{
  db.get(`SELECT temperatura FROM sensor WHERE id=1`, [], (err,row)=>res.json(row||{temperatura:0}));
});

// Setpoint
app.post("/set-target", auth, (req,res)=>{
  let {valor} = req.body;
  if(valor>70) valor=70;
  if(valor<0) valor=0;
  db.run(`UPDATE setpoints SET valor=? WHERE id=1`, [valor]);
  res.json({valor});
});
app.get("/set-target", auth, (req,res)=>{
  db.get(`SELECT valor FROM setpoints WHERE id=1`, [], (err,row)=>res.json(row));
});

app.listen(PORT, ()=>console.log(`Server rodando na porta ${PORT}`));

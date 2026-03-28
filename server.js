/* server.js - Versão Final Corrigida e Segura */
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;
const SECRET_KEY = "supersecreto123"; // Em produção use process.env.JWT_SECRET
const ESP32_API_KEY = "desidratador_esp32_2026"; // Mude para uma chave forte

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("desidratador.db");

// ====================== CONFIGURAÇÃO EMAIL ======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'leogabri0903@gmail.com',
        pass: 'otoz tgjr cmop rubu'   // App Password do Google
    }
});

// ====================== BANCO DE DADOS ======================
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        expires_at INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS alimentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        temperatura REAL,
        tempo INTEGER,
        user_id INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sensor (id INTEGER PRIMARY KEY CHECK(id=1), temperatura REAL)`);
    db.run(`INSERT OR IGNORE INTO sensor (id, temperatura) VALUES (1, 0)`);

    db.run(`CREATE TABLE IF NOT EXISTS setpoints (id INTEGER PRIMARY KEY CHECK(id=1), valor REAL DEFAULT 65)`);
    db.run(`INSERT OR IGNORE INTO setpoints (id, valor) VALUES (1, 65)`);
});

// ====================== MIDDLEWARE PARA ESP32 ======================
app.post("/sensor-data", (req, res, next) => {
    if (req.header("X-API-Key") !== ESP32_API_KEY) {
        return res.status(401).json({ error: "Chave de API inválida" });
    }
    next();
});

// ====================== MIDDLEWARE DE AUTENTICAÇÃO ======================
function auth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token ausente" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido ou expirado" });
        req.user = decoded;
        next();
    });
}

// ====================== REGISTRO ======================
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
    }
    if (!username || !password) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?,?,?)`,
        [username, email, hash],
        function(err) {
            if (err) return res.status(400).json({ error: "Usuário ou email já cadastrado" });
            res.json({ message: "Conta criada com sucesso!" });
        }
    );
});

// ====================== LOGIN (CORRIGIDO) ======================
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    db.get(`SELECT * FROM users WHERE email=?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Erro interno no servidor" });
        if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Senha inválida" });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    });
});

// ====================== RECUPERAÇÃO DE SENHA ======================
app.post("/request-reset", (req, res) => {
    const { email } = req.body;

    db.get(`SELECT id FROM users WHERE email=?`, [email], (err, user) => {
        if (!user) return res.status(400).json({ error: "Email não cadastrado" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 15 * 60 * 1000;

        db.run(`DELETE FROM password_resets WHERE user_id=?`, [user.id]);

        db.run(`INSERT INTO password_resets (user_id, code, expires_at) VALUES (?,?,?)`,
            [user.id, code, expires]);

        const mailOptions = {
            from: 'leogabri0903@gmail.com',
            to: email,
            subject: 'Código de Recuperação - Desidratador',
            text: `Olá!\n\nSeu código de recuperação é: ${code}\n\nVálido por 15 minutos.\n\nNão compartilhe com ninguém.`
        };

        transporter.sendMail(mailOptions)
            .then(() => res.json({ message: "Código enviado para o seu email!" }))
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: "Erro ao enviar email" });
            });
    });
});

app.post("/reset-password", async (req, res) => {
    const { code, newPassword } = req.body;

    db.get(`SELECT * FROM password_resets WHERE code=?`, [code], async (err, reset) => {
        if (!reset || Date.now() > reset.expires_at) {
            return res.status(400).json({ error: "Código inválido ou expirado" });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        db.run(`UPDATE users SET password=? WHERE id=?`, [hash, reset.user_id]);
        db.run(`DELETE FROM password_resets WHERE id=?`, [reset.id]);

        res.json({ message: "Senha redefinida com sucesso!" });
    });
});

// ====================== CRUD ALIMENTOS ======================
app.post("/alimentos", auth, (req, res) => {
    const { nome, temperatura, tempo } = req.body;
    db.run(`INSERT INTO alimentos (nome, temperatura, tempo, user_id) VALUES (?,?,?,?)`,
        [nome, temperatura, tempo, req.user.id],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

app.get("/alimentos", auth, (req, res) => {
    db.all(`SELECT * FROM alimentos WHERE user_id=?`, [req.user.id], (err, rows) => res.json(rows));
});

// ====================== SENSOR E SETPOINT ======================
app.post("/sensor-data", (req, res) => {
    const { temperatura } = req.body;
    if (typeof temperatura !== "number") {
        return res.status(400).json({ error: "Temperatura inválida" });
    }

    db.run(`UPDATE sensor SET temperatura=? WHERE id=1`, [temperatura]);
    db.get(`SELECT valor FROM setpoints WHERE id=1`, [], (err, row) => {
        res.json({ setpoint: row ? row.valor : 65 });
    });
});

app.get("/sensor-data", auth, (req, res) => {
    db.get(`SELECT temperatura FROM sensor WHERE id=1`, [], (err, row) => 
        res.json(row || { temperatura: 0 })
    );
});

app.post("/set-target", auth, (req, res) => {
    let { valor } = req.body;
    if (valor > 70) valor = 70;
    if (valor < 0) valor = 0;

    db.run(`UPDATE setpoints SET valor=? WHERE id=1`, [valor]);
    res.json({ valor });
});

app.get("/set-target", auth, (req, res) => {
    db.get(`SELECT valor FROM setpoints WHERE id=1`, [], (err, row) => res.json(row || { valor: 65 }));
});

app.listen(PORT, () => {
    console.log(`🚀 Server rodando na porta ${PORT} - Desidratador seguro!`);
});
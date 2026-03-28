/* script.js - Versão Corrigida */
let token = localStorage.getItem("token") || null;

// ====================== LOGIN ======================
function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return alert("Preencha email e senha");

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.token) {
            token = data.token;
            localStorage.setItem("token", token);
            document.querySelector(".background").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            atualizarDashboard();
            setInterval(atualizarDashboard, 5000);
        } else {
            alert(data.error || "Erro no login");
        }
    })
    .catch(() => alert("Servidor inacessível"));
}

// ====================== CADASTRO ======================
function mostrarCadastro() {
    document.getElementById("login").style.display = "none";
    document.getElementById("cadastro").style.display = "block";
}

function voltarLogin() {
    document.getElementById("cadastro").style.display = "none";
    document.getElementById("login").style.display = "block";
}

function criarConta() {
    const username = document.getElementById("new-user").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-pass").value;

    if (!username || !email || !password) return alert("Preencha todos os campos");

    fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })
    .then(r => r.json())
    .then(data => alert(data.message || data.error))
    .catch(() => alert("Erro ao registrar"));
}

// ====================== RECUPERAÇÃO DE SENHA ======================
function mostrarEsqueciSenha() {
    document.querySelector(".background").style.display = "none";
    document.getElementById("forgot-pane").style.display = "block";
    document.getElementById("reset-step1").style.display = "block";
    document.getElementById("reset-step2").style.display = "none";
}

function voltarStep1() {
    document.getElementById("reset-step1").style.display = "block";
    document.getElementById("reset-step2").style.display = "none";
}

function enviarCodigo() {
    const email = document.getElementById("reset-email").value.trim();
    if (!email) return alert("Digite seu email cadastrado");

    fetch("/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(r => r.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            document.getElementById("reset-step1").style.display = "none";
            document.getElementById("reset-step2").style.display = "block";
        } else {
            alert(data.error || "Erro ao enviar código");
        }
    })
    .catch(() => alert("Servidor inacessível"));
}

function redefinirSenha() {
    const code = document.getElementById("reset-code").value.trim();
    const novaSenha = document.getElementById("reset-nova").value;

    if (code.length !== 6) return alert("O código deve ter 6 dígitos");

    fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, newPassword: novaSenha })
    })
    .then(r => r.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            document.getElementById("forgot-pane").style.display = "none";
            document.querySelector(".background").style.display = "flex";
            document.getElementById("login").style.display = "block";
        } else {
            alert(data.error || "Erro ao redefinir senha");
        }
    })
    .catch(() => alert("Erro de conexão"));
}

// ====================== DASHBOARD ======================
async function atualizarDashboard() {
    if (!token) return;

    try {
        // Temperatura atual
        const resSensor = await fetch("/sensor-data", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dataSensor = await resSensor.json();
        document.getElementById("temp").innerText = dataSensor.temperatura || 0;

        // Setpoint
        const resTarget = await fetch("/set-target", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dataTarget = await resTarget.json();
        document.getElementById("setpoint").innerText = dataTarget.valor || 65;

        // Lista de alimentos
        const resAlim = await fetch("/alimentos", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dataAlim = await resAlim.json();

        const lista = document.getElementById("lista");
        lista.innerHTML = "";
        dataAlim.forEach(a => {
            lista.innerHTML += `<li>${a.nome} — ${a.temperatura}°C por ${a.tempo} min</li>`;
        });
    } catch (e) {
        console.error("Erro ao atualizar dashboard:", e);
    }
}

function ajustarSetpoint(delta) {
    let atual = parseInt(document.getElementById("setpoint").innerText) || 65;
    let novo = Math.min(70, Math.max(0, atual + delta));

    fetch("/set-target", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ valor: novo })
    })
    .then(() => atualizarDashboard());
}

function addAlimento() {
    const nome = document.getElementById("nome").value.trim();
    const temp = parseFloat(document.getElementById("tempAlim").value);
    const tempo = parseInt(document.getElementById("tempoAlim").value);

    if (!nome || isNaN(temp) || isNaN(tempo)) {
        return alert("Preencha todos os campos corretamente");
    }

    fetch("/alimentos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome, temperatura: temp, tempo })
    })
    .then(() => {
        document.getElementById("nome").value = "";
        document.getElementById("tempAlim").value = "";
        document.getElementById("tempoAlim").value = "";
        atualizarDashboard();
    })
    .catch(() => alert("Erro ao adicionar alimento"));
}
/* script.js (totalmente reescrito para o novo fluxo de recuperação) */
let token = localStorage.getItem("token") || null;

/* ====================== LOGIN ====================== */
function login(){
    fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:document.getElementById("username").value,
            password:document.getElementById("password").value
        })
    })
    .then(r=>r.json())
    .then(data=>{
        if(data.token){
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
    .catch(()=>alert("Servidor inacessível"));
}

/* ====================== CADASTRO (agora com email) ====================== */
function mostrarCadastro(){
    document.getElementById("login").style.display = "none";
    document.getElementById("cadastro").style.display = "block";
}

function voltarLogin(){
    document.getElementById("cadastro").style.display = "none";
    document.getElementById("login").style.display = "block";
}

function criarConta(){
    const username = document.getElementById("new-user").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-pass").value;

    if(!email || !email.includes("@")){
        return alert("Por favor, insira um email válido");
    }

    fetch("/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username, email, password})
    })
    .then(r=>r.json())
    .then(data=>alert(data.message || data.error))
    .catch(()=>alert("Erro ao registrar"));
}

/* ====================== RECUPERAÇÃO POR EMAIL (novo fluxo) ====================== */
function mostrarEsqueciSenha(){
    document.querySelector(".background").style.display = "none";
    document.getElementById("forgot-pane").style.display = "block";
    document.getElementById("reset-step1").style.display = "block";
    document.getElementById("reset-step2").style.display = "none";
}

function voltarStep1(){
    document.getElementById("reset-step1").style.display = "block";
    document.getElementById("reset-step2").style.display = "none";
}

function enviarCodigo(){
    const email = document.getElementById("reset-email").value.trim();
    if(!email){
        return alert("Digite seu email cadastrado");
    }

    fetch("/request-reset",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
    })
    .then(r=>r.json())
    .then(data=>{
        if(data.message){
            alert(data.message);
            document.getElementById("reset-step1").style.display = "none";
            document.getElementById("reset-step2").style.display = "block";
        } else {
            alert(data.error || "Erro ao enviar código");
        }
    })
    .catch(()=>alert("Servidor inacessível"));
}

function redefinirSenha(){
    const code = document.getElementById("reset-code").value.trim();
    const novaSenha = document.getElementById("reset-nova").value;

    if(code.length !== 6){
        return alert("O código deve ter 6 dígitos");
    }

    fetch("/reset-password",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code, newPassword: novaSenha})
    })
    .then(r=>r.json())
    .then(data=>{
        if(data.message){
            alert(data.message);
            // Volta para a tela de login
            document.getElementById("forgot-pane").style.display = "none";
            document.querySelector(".background").style.display = "flex";
            document.getElementById("login").style.display = "block";
            document.getElementById("cadastro").style.display = "none";
        } else {
            alert(data.error || "Erro ao redefinir senha");
        }
    })
    .catch(()=>alert("Erro de conexão"));
}

/* ====================== DASHBOARD ====================== */
async function atualizarDashboard(){
    if(!token) return;

    try{
        // Temperatura atual (sensor)
        const resSensor = await fetch("/sensor-data", {headers:{Authorization:token}});
        const dataSensor = await resSensor.json();
        document.getElementById("temp").innerText = dataSensor.temperatura || 0;

        // Setpoint
        const resTarget = await fetch("/set-target", {headers:{Authorization:token}});
        const dataTarget = await resTarget.json();
        document.getElementById("setpoint").innerText = dataTarget.valor || 65;

        // Lista de alimentos
        const resAlim = await fetch("/alimentos", {headers:{Authorization:token}});
        const dataAlim = await resAlim.json();

        const lista = document.getElementById("lista");
        lista.innerHTML = "";

        dataAlim.forEach(a=>{
            lista.innerHTML += `<li>${a.nome} — ${a.temperatura}°C por ${a.tempo} min</li>`;
        });
    } catch(e){
        console.error(e);
    }
}

function ajustarSetpoint(delta){
    let atual = parseInt(document.getElementById("setpoint").innerText);
    let novo = Math.min(70, Math.max(0, atual + delta));

    fetch("/set-target",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:token
        },
        body:JSON.stringify({valor:novo})
    })
    .then(()=>atualizarDashboard());
}

function addAlimento(){
    const nome = document.getElementById("nome").value.trim();
    const temp = parseFloat(document.getElementById("tempAlim").value);
    const tempo = parseInt(document.getElementById("tempoAlim").value);

    if(!nome || isNaN(temp) || isNaN(tempo)) return alert("Preencha todos os campos");

    fetch("/alimentos",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:token
        },
        body:JSON.stringify({nome, temperatura:temp, tempo})
    })
    .then(()=>atualizarDashboard());
}
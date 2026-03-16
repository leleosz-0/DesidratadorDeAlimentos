let token = "";

/* LOGIN */

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

token=data.token;

document.querySelector(".background").style.display="none";
document.getElementById("dashboard").style.display="block";

atualizarDashboard();
setInterval(atualizarDashboard,5000);

}

else alert(data.error);

})
.catch(()=>alert("Servidor inacessível"));

}


/* MOSTRAR ESQUECI SENHA */

function mostrarEsqueciSenha(){

document.querySelector(".background").style.display="none";
document.getElementById("forgot-pane").style.display="block";

}


/* RECUPERAR SENHA */

function recuperarSenha(){

const username=document.getElementById("rec-user").value;
const resposta=document.getElementById("rec-resp").value;
const novaSenha=document.getElementById("rec-nova").value;

fetch("/forgot-password",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,resposta,novaSenha})

})
.then(r=>r.json())
.then(data=>alert(data.message||data.error))

}


/* CADASTRO */

function mostrarCadastro(){

document.getElementById("login").style.display="none";
document.getElementById("cadastro").style.display="block";

}


function voltarLogin(){

document.getElementById("cadastro").style.display="none";
document.getElementById("login").style.display="block";

}


function criarConta(){

const username = document.getElementById("new-user").value;
const password = document.getElementById("new-pass").value;

fetch("/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username,
password
})

})
.then(r=>r.json())
.then(data=>alert(data.message || data.error));

}



/* DASHBOARD */

async function atualizarDashboard(){

try{

const resSensor=await fetch("/sensor-data",{headers:{Authorization:token}});
const dataSensor=await resSensor.json();
document.getElementById("temp").innerText=dataSensor.temperatura||0;


const resTarget=await fetch("/set-target",{headers:{Authorization:token}});
const dataTarget=await resTarget.json();
document.getElementById("setpoint").innerText=dataTarget.valor||65;


const resAlim=await fetch("/alimentos",{headers:{Authorization:token}});
const dataAlim=await resAlim.json();

const lista=document.getElementById("lista");

lista.innerHTML="";

dataAlim.forEach(a=>{
lista.innerHTML+=`<li>${a.nome} - ${a.temperatura}°C por ${a.tempo}min</li>`;
});

}catch(e){

console.log(e);

}

}


function ajustarSetpoint(delta){

let atual=parseInt(document.getElementById("setpoint").innerText);

let novo=atual+delta;

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

const nome=document.getElementById("nome").value;
const temp=document.getElementById("tempAlim").value;
const tempo=document.getElementById("tempoAlim").value;

fetch("/alimentos",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:token
},

body:JSON.stringify({nome,temperatura:temp,tempo})

})
.then(()=>atualizarDashboard());

}

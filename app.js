const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"";
const foods=[
["Jambon blanc","🥓",100,115,20,1,3],["Œuf","🥚",1,70,6.3,.4,4.8],["Pâtes cuites","🍝",100,155,5.8,30,.9],
["Emmental","🧀",30,114,8.7,.1,8.7],["Gruyère","🧀",30,123,8.7,.1,10],["Camembert","🧀",30,90,5.7,.2,7.2],
["Pain","🥖",100,265,9,49,3.2],["Poulet cuit","🍗",100,165,31,0,3.6],["Riz cuit","🍚",100,130,2.7,28,.3],
["Thon au naturel","🐟",100,116,26,0,1],["Fromage de chèvre","🧀",30,90,5.5,.2,7.5],["Yaourt nature","🥛",1,75,4.5,6,3.5],
["Miel","🍯",15,46,0,12.4,0],["Beurre","🧈",10,75,.1,0,8.2],["Huile d'olive","🫒",10,90,0,0,10],
["Banane","🍌",100,89,1.1,23,.3],["Pomme","🍎",100,52,.3,14,.2],["Flocons d'avoine","🥣",40,148,5.2,24,2.8],
["Lait demi-écrémé","🥛",100,46,3.2,4.8,1.6],["Lentilles cuites","🫘",100,116,9,20,.4],["Saumon","🐠",100,208,20,0,13],["Pomme de terre cuite","🥔",100,87,1.9,20,.1]
];
let data=JSON.parse(localStorage.getItem("sporttrack_data")||'{"foods":[],"workouts":[],"cardio":[],"meals":[]}');
let selectedFood=null, builder=[];
function save(){localStorage.setItem("sporttrack_data",JSON.stringify(data));renderAll()}
function toast(t){let el=$("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1900)}
function totals(items){return items.reduce((a,x)=>({k:a.k+x.kcal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{k:0,p:0,c:0,f:0})}
function todayFoods(){return data.foods.filter(x=>x.date===today())}
function foodValues(food,amount,unit){let factor=unit==="portion"?amount/food.base:amount/food.base;return {kcal:food.kcal*factor,p:food.p*factor,c:food.c*factor,f:food.f*factor}}
function renderFoodLibrary(){
 const q=$("foodSearch").value.toLowerCase();
 $("foodLibrary").innerHTML=foods.filter(f=>f[0].toLowerCase().includes(q)).map((f)=>`<button class="food-choice ${selectedFood===f[0]?"selected":""}" data-food="${f[0]}"><span>${f[1]}</span><span>${f[0]}<small style="display:block;color:#a5a7b1">${f[3]} kcal / ${f[2]} ${f[2]===1?"portion":"g"}</small></span></button>`).join("");
 document.querySelectorAll("[data-food]").forEach(b=>b.onclick=()=>{selectedFood=b.dataset.food;let f=foods.find(x=>x[0]===selectedFood);$("foodAmount").value=f[2];$("foodUnit").value=f[2]===1?"portion":"g";$("selectedFood").textContent=`${f[1]} ${f[0]} sélectionné`; $("addFoodBtn").disabled=false;renderFoodLibrary()});
}
function renderNutrition(){
 let t=totals(todayFoods());$("totalKcal").textContent=Math.round(t.k);$("totalP").textContent=Math.round(t.p)+" g";$("totalC").textContent=Math.round(t.c)+" g";$("totalF").textContent=Math.round(t.f)+" g";
 $("homeKcal").textContent=Math.round(t.k)+" kcal";$("homeProtein").textContent=Math.round(t.p)+" g";$("homeP").textContent=Math.round(t.p)+" g";$("homeC").textContent=Math.round(t.c)+" g";$("homeF").textContent=Math.round(t.f)+" g";
 $("foodLog").className="stack"+(todayFoods().length?"":" empty");
 $("foodLog").innerHTML=todayFoods().length?todayFoods().map(x=>`<div class="log-row"><div><b>${x.emoji} ${x.name}</b><small>${x.amount} ${x.unit} · ${Math.round(x.p)} g protéines</small></div><div><b>${Math.round(x.kcal)} kcal</b></div><button class="delete-btn" data-del-food="${x.id}">×</button></div>`).join(""):"Aucun aliment pour le moment.";
 document.querySelectorAll("[data-del-food]").forEach(b=>b.onclick=()=>{data.foods=data.foods.filter(x=>x.id!==b.dataset.delFood);save()});
 $("homeFoods").innerHTML=todayFoods().slice(-3).reverse().map(x=>`<div class="log-row"><span>${x.emoji} ${x.name}</span><b>${Math.round(x.kcal)} kcal</b></div>`).join("")||"Aucun aliment enregistré aujourd'hui.";
 $("statFoods").textContent=todayFoods().length;
 $("savedMeals").innerHTML=data.meals.map((m,i)=>`<div class="log-row"><div><b>${m.name}</b><small>${m.items.length} aliments · ${Math.round(totals(m.items).k)} kcal</small></div><button class="secondary" data-meal="${i}">Ajouter</button></div>`).join("")||"Aucun repas favori.";
 document.querySelectorAll("[data-meal]").forEach(b=>b.onclick=()=>{let m=data.meals[+b.dataset.meal];m.items.forEach(x=>data.foods.push({...x,id:crypto.randomUUID(),date:today()}));save();toast("Repas ajouté au journal")});
}
function renderBuilder(){
 $("exerciseBuilder").innerHTML=builder.map((ex,i)=>`<div class="exercise-card"><div class="exercise-head"><input class="field" data-exname="${i}" value="${esc(ex.name)}" placeholder="Nom de l'exercice" style="padding:9px"><button class="delete-btn" data-exdel="${i}">Supprimer</button></div><div class="set-row" style="color:#a5a7b1;font-size:10px"><span>Série</span><span>Répétitions</span><span>Charge (kg)</span><span></span></div>${ex.sets.map((s,j)=>`<div class="set-row"><span style="color:#a5a7b1">#${j+1}</span><input type="number" min="0" placeholder="10" value="${s.reps}" data-reps="${i},${j}"><input type="number" min="0" step=".5" placeholder="20" value="${s.weight}" data-weight="${i},${j}"><button data-setdel="${i},${j}">×</button></div>`).join("")}<button class="add-set" data-setadd="${i}">＋ Ajouter une série</button></div>`).join("")||'<p class="empty">Ajoute ton premier exercice.</p>';
 document.querySelectorAll("[data-exname]").forEach(e=>e.oninput=()=>builder[+e.dataset.exname].name=e.value);
 document.querySelectorAll("[data-reps]").forEach(e=>e.oninput=()=>{let [i,j]=e.dataset.reps.split(",");builder[i].sets[j].reps=e.value});
 document.querySelectorAll("[data-weight]").forEach(e=>e.oninput=()=>{let [i,j]=e.dataset.weight.split(",");builder[i].sets[j].weight=e.value});
 document.querySelectorAll("[data-exdel]").forEach(e=>e.onclick=()=>{builder.splice(+e.dataset.exdel,1);renderBuilder()});
 document.querySelectorAll("[data-setadd]").forEach(e=>e.onclick=()=>{builder[+e.dataset.setadd].sets.push({reps:"",weight:""});renderBuilder()});
 document.querySelectorAll("[data-setdel]").forEach(e=>e.onclick=()=>{let [i,j]=e.dataset.setdel.split(",");builder[i].sets.splice(j,1);renderBuilder()});
}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderTraining(){
 $("workoutHistory").innerHTML=data.workouts.slice().reverse().map(w=>`<div class="history-card"><div><b>${esc(w.name)}</b><small>${fmtDate(w.date)} · ${w.exercises.length} exercices</small><small>${w.exercises.map(e=>esc(e.name)).join(" · ")}</small></div><button class="delete-btn" data-del-workout="${w.id}">×</button></div>`).join("")||"Aucune séance enregistrée.";
 document.querySelectorAll("[data-del-workout]").forEach(b=>b.onclick=()=>{data.workouts=data.workouts.filter(w=>w.id!==b.dataset.delWorkout);save()});
 $("cardioHistory").innerHTML=data.cardio.slice().reverse().slice(0,6).map(c=>`<div class="log-row"><div><b>🏃 ${esc(c.type)}</b><small>${fmtDate(c.date)}</small></div><b>${c.duration} min</b></div>`).join("");
}
function renderStats(){
 let exs=data.workouts.flatMap(w=>w.exercises);$("statWorkouts").textContent=data.workouts.length;$("statExercises").textContent=exs.length;$("statMinutes").textContent=data.cardio.reduce((a,c)=>a+c.duration,0)+" min";
 $("performanceList").innerHTML=exs.slice(-8).reverse().map(e=>`<div class="log-row"><div><b>${esc(e.name)}</b><small>${e.sets.length} séries · ${e.sets.map(s=>`${s.reps||"—"} reps × ${s.weight||"—"} kg`).join(" / ")}</small></div></div>`).join("")||"Enregistre une séance pour voir tes performances ici.";
}
function renderAll(){renderNutrition();renderTraining();renderStats();$("homeSessions").textContent=data.workouts.length;$("homeCardio").textContent=data.cardio.length;$("homeWorkouts").innerHTML=data.workouts.slice(-2).reverse().map(w=>`<div class="log-row"><span>🏋️ ${esc(w.name)}<small>${fmtDate(w.date)}</small></span><b>${w.exercises.length} ex.</b></div>`).join("")||"Aucune séance enregistrée pour le moment."}
function showPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.page===name));window.scrollTo(0,0)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showPage(b.dataset.go));
$("settingsBtn").onclick=()=>showPage("settings");
$("foodSearch").oninput=renderFoodLibrary;
$("addFoodBtn").onclick=()=>{let f=foods.find(x=>x[0]===selectedFood);if(!f)return;let amount=Number($("foodAmount").value);if(!amount||amount<=0)return toast("Indique une quantité valide");let v=foodValues({kcal:f[3],p:f[4],c:f[5],f:f[6],base:f[2]},amount,$("foodUnit").value);data.foods.push({id:crypto.randomUUID(),date:today(),name:f[0],emoji:f[1],amount,unit:$("foodUnit").value==="g"?"g":"portion(s)",...v});save();toast("Aliment ajouté")};
$("clearFoodsBtn").onclick=()=>{if(confirm("Supprimer les aliments enregistrés aujourd'hui ?")){data.foods=data.foods.filter(x=>x.date!==today());save()}};
$("saveMealBtn").onclick=()=>{let name=$("mealName").value.trim();if(!name||!todayFoods().length)return toast("Ajoute des aliments et donne un nom au repas");data.meals.push({name,items:todayFoods().map(({id,date,...x})=>x)});save();$("mealName").value="";toast("Repas favori enregistré")};
$("addExerciseBtn").onclick=()=>{builder.push({name:"",sets:[{reps:"",weight:""}]});renderBuilder()};
$("saveWorkoutBtn").onclick=()=>{let name=$("workoutName").value.trim();let exercises=builder.map(e=>({name:e.name.trim(),sets:e.sets.filter(s=>s.reps||s.weight)})).filter(e=>e.name);if(!name||!exercises.length)return toast("Ajoute un nom et au moins un exercice");data.workouts.push({id:crypto.randomUUID(),name,date:$("workoutDate").value||today(),exercises});builder=[];$("workoutName").value="";renderBuilder();save();toast("Séance enregistrée")};
$("saveCardioBtn").onclick=()=>{let type=$("cardioType").value.trim(),duration=Number($("cardioDuration").value);if(!type||duration<=0)return toast("Renseigne l'activité et la durée");data.cardio.push({type,duration,date:$("cardioDate").value||today()});$("cardioType").value="";$("cardioDuration").value="";save();toast("Activité enregistrée")};
$("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="sporttrack-sauvegarde.json";a.click();URL.revokeObjectURL(a.href)};
$("importFile").onchange=async e=>{try{let parsed=JSON.parse(await e.target.files[0].text());if(!parsed.foods||!parsed.workouts)throw 0;data={...data,...parsed};save();toast("Données importées")}catch{toast("Fichier invalide")}};
$("todayLabel").textContent=fmtDate(today());$("nutritionDate").textContent=fmtDate(today());$("workoutDate").value=today();$("cardioDate").value=today();
renderFoodLibrary();renderBuilder();renderAll();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

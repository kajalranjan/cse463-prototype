/* ---------- data (fictional, simulated inventory) ---------- */
const COLOURS = {
  "Natural-Pink":{hex:"#F2E4E2",motif:"#C98C8C",fam:["White / Ivory","Pink"]},
  "Natural-Green":{hex:"#EEF0E3",motif:"#8FA27A",fam:["White / Ivory","Green"]},
  "Ivory":{hex:"#F7F3EA",motif:"#D9CFBD",fam:["White / Ivory"]},
  "Light Grey":{hex:"#E6E6E4",motif:"#A6A6A2",fam:["Grey"]},
  "Indigo":{hex:"#2F3E6E",motif:"#C9D3EE",fam:["Blue"]},
  "Rust":{hex:"#B5562F",motif:"#F1C7A9",fam:["Red"]},
  "Off-White":{hex:"#F5F0E6",motif:"#CDA75A",fam:["White / Ivory"]},
  "Peach":{hex:"#F4CDB6",motif:"#C98D52",fam:["Pink"]},
  "Natural White":{hex:"#F4F2EC",motif:"#BDBDB5",fam:["White / Ivory"]},
  "Grey":{hex:"#BFC0BE",motif:"#F3F3F1",fam:["Grey"]},
  "Mustard":{hex:"#D9A631",motif:"#7A2E2A",fam:["Yellow"]},
  "Red":{hex:"#B3262C",motif:"#F5D6C8",fam:["Red"]},
  "Sage":{hex:"#BCC7AE",motif:"#F1F3EA",fam:["Green"]},
  "Black":{hex:"#2A2726",motif:"#C9A15A",fam:["Black"]},
  "Maroon":{hex:"#6B1F28",motif:"#E4B9A2",fam:["Red"]}
};
const P = [
 {id:"p1",name:"Cotton Silk Hand Block Printed Dupatta",craft:"Hand Block Print",fabric:"Cotton Silk",colours:["Natural-Pink","Natural-Green"],price:1405,mrp:1499,pattern:"block",dims:"2.25 m × 0.90 m",care:"Dry clean only"},
 {id:"p2",name:"Cotton Chikankari Dupatta",craft:"Chikankari",fabric:"Cotton",colours:["Ivory","Light Grey"],price:1890,mrp:2100,pattern:"chikan",dims:"2.30 m × 0.95 m",care:"Gentle hand wash"},
 {id:"p3",name:"Cotton Dabu Print Dupatta",craft:"Dabu Print",fabric:"Cotton",colours:["Indigo","Rust"],price:1290,mrp:1290,pattern:"dabu",dims:"2.25 m × 0.90 m",care:"Hand wash separately"},
 {id:"p4",name:"Chanderi Zari Border Dupatta",craft:"Handwoven",fabric:"Chanderi",colours:["Off-White","Peach"],price:2490,mrp:2490,pattern:"zari",dims:"2.40 m × 0.95 m",care:"Dry clean only"},
 {id:"p5",name:"Cotton Silk Chikankari Dupatta",craft:"Chikankari",fabric:"Cotton Silk",colours:["Natural White","Grey"],price:4199,mrp:5999,pattern:"chikan",dims:"2.40 m × 1.00 m",care:"Dry clean only"},
 {id:"p6",name:"Cotton Bandhani Dupatta",craft:"Bandhani",fabric:"Cotton",colours:["Mustard","Red"],price:990,mrp:1100,pattern:"dots",dims:"2.20 m × 0.90 m",care:"Hand wash separately"},
 {id:"p7",name:"Linen Embroidered Dupatta",craft:"Embroidered",fabric:"Linen",colours:["Sage","Ivory"],price:1650,mrp:1650,pattern:"chikan",dims:"2.25 m × 0.90 m",care:"Gentle hand wash"},
 {id:"p8",name:"Silk Ajrakh Dupatta",craft:"Ajrakh",fabric:"Silk",colours:["Black","Maroon"],price:3290,mrp:3290,pattern:"dabu",dims:"2.40 m × 1.00 m",care:"Dry clean only"}
];
const byId = id => P.find(p=>p.id===id);
const FABRICS = ["Cotton","Cotton Silk","Chanderi","Linen","Silk"];
const FAMS = ["White / Ivory","Pink","Green","Grey","Blue","Yellow","Red","Black"];
const FAMHEX = {"White / Ivory":"#F6F2E9","Pink":"#F0C9C6","Green":"#B9C9A5","Grey":"#BDBDBD","Blue":"#2F3E6E","Yellow":"#D9A631","Red":"#B3262C","Black":"#222"};
const PRICES = [["Under ₹1,000",0,999],["₹1,000 – ₹2,000",1000,2000],["₹2,000 – ₹5,000",2001,5000]];
const STATES = ["Andhra Pradesh","Delhi","Gujarat","Karnataka","Kerala","Maharashtra","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"];
const SCREEN_NAMES = {S1:"Dupatta listing",S2:"Product detail",S3:"Bag",S4:"Delivery & payment",S5:"Order review",S6:"Recovery: colour sold out",S7:"Updated review",S8:"Order confirmed"};

/* ---------- state ---------- */
let st;
function fresh(){ return {
  screen:"S1", filters:{fabric:[],fam:[],price:[]}, pid:null, colour:null, editIndex:null,
  pin:"", pinMsg:null, bag:[], form:{name:"",phone:"",email:"",addr1:"",addr2:"",city:"",state:"",pin:""},
  pay:"UPI", errors:{}, triedSubmit:false, soldOut:{}, recoveryDone:false, change:null, orderNo:null, toast:null, modal:null
};}
st = fresh();

/* ---------- helpers ---------- */
const rs = n => "₹" + n.toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtD = d => d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
function eta(){ const a=new Date(), b=new Date(); a.setDate(a.getDate()+4); b.setDate(b.getDate()+5); return fmtD(a)+" – "+fmtD(b); }
const validPin = p => /^[1-9][0-9]{5}$/.test(p);
const isSold = (pid,c) => st.soldOut[pid+"|"+c];
const subtotal = () => st.bag.reduce((s,i)=>s+byId(i.pid).price*i.qty,0);
const mrpTotal = () => st.bag.reduce((s,i)=>s+byId(i.pid).mrp*i.qty,0);
const ship = () => subtotal()>=1000||!st.bag.length?0:99;
const total = () => subtotal()+ship();
const fullName = p => p.colours.length ? p.name : p.name;

function img(p, colour, extra=""){
  const c = COLOURS[colour]; const id = "pt"+p.id+colour.replace(/\W/g,"");
  let motif="";
  if(p.pattern==="block") motif=`<circle cx="10" cy="10" r="4" fill="none" stroke="${c.motif}" stroke-width="1.6"/><path d="M10 3v14M3 10h14" stroke="${c.motif}" stroke-width="1"/>`;
  else if(p.pattern==="chikan") motif=`<path d="M10 4c3 3 3 9 0 12c-3-3-3-9 0-12z" fill="none" stroke="${c.motif}" stroke-width="1.3"/>`;
  else if(p.pattern==="dabu") motif=`<rect x="5" y="5" width="10" height="10" transform="rotate(45 10 10)" fill="none" stroke="${c.motif}" stroke-width="1.5"/>`;
  else if(p.pattern==="zari") motif=`<circle cx="10" cy="10" r="1.6" fill="${c.motif}"/>`;
  else motif=`<circle cx="5" cy="5" r="1.8" fill="${c.motif}"/><circle cx="15" cy="15" r="1.8" fill="${c.motif}"/>`;
  return `<svg class="img ${extra}" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(colour+' '+p.name)}">
   <defs><pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">${motif}</pattern>
   <linearGradient id="g${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".10"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
   <rect width="200" height="250" fill="#E9E4DC"/>
   <path d="M40 0 C60 60 30 140 55 250 L145 250 C170 140 140 60 160 0 Z" fill="${c.hex}"/>
   <path d="M40 0 C60 60 30 140 55 250 L145 250 C170 140 140 60 160 0 Z" fill="url(#${id})"/>
   <path d="M40 0 C60 60 30 140 55 250 L145 250 C170 140 140 60 160 0 Z" fill="url(#g${id})"/>
   <path d="M55 250 L145 250 L146 238 L54 238 Z" fill="${c.motif}" opacity=".85"/>
   <path d="M85 0 C95 70 80 160 92 250" stroke="#000" stroke-opacity=".07" stroke-width="6" fill="none"/>
  </svg>`;
}
function stepper(cur){
  const steps=["Bag","Delivery & payment","Review","Done"]; const idx={S3:0,S4:1,S5:2,S6:2,S7:2,S8:3}[cur];
  return `<div class="stepper" aria-label="Checkout progress">${steps.map((s,i)=>`<div class="${i<idx?'done':i===idx?'cur':''}">${i<idx?'✓ ':''}${i+1}. ${s}</div>`).join("")}</div>`;
}
function go(s){ st.screen=s; st.toast=null; render(); window.scrollTo(0,0); }

/* ---------- screens ---------- */
function S1(){
  const f=st.filters;
  const list=P.filter(p=>(!f.fabric.length||f.fabric.includes(p.fabric))
     &&(!f.fam.length||p.colours.some(c=>COLOURS[c].fam.some(x=>f.fam.includes(x))))
     &&(!f.price.length||f.price.some(i=>p.price>=PRICES[i][1]&&p.price<=PRICES[i][2])));
  const chips=[...f.fabric.map(v=>["fabric",v,v]),...f.fam.map(v=>["fam",v,v]),...f.price.map(v=>["price",v,PRICES[v][0]])];
  const box=(grp,val,label,dot="")=>`<label><input type="checkbox" data-f="${grp}" data-v="${val}" ${f[grp].includes(val)?"checked":""}>${dot}${label}</label>`;
  return `<div class="crumb">Home / Women / Dupattas</div>
  <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px"><h1 style="font-size:36px">Dupattas</h1><span class="muted">${list.length} of ${P.length} items</span></div>
  <div class="listing">
   <aside class="filters" aria-label="Filters">
    <h4>FABRIC</h4>${FABRICS.map(v=>box("fabric",v,v)).join("")}
    <h4>COLOUR</h4>${FAMS.map(v=>box("fam",v,v,`<span class="dot" style="background:${FAMHEX[v]}"></span>`)).join("")}
    <h4>PRICE</h4>${PRICES.map((p,i)=>box("price",i,p[0])).join("")}
   </aside>
   <section>
    <div class="chips" aria-label="Applied filters">${chips.length?`<span class="small muted">Showing:</span>`+chips.map(c=>`<span class="chip">${esc(c[2])}<button aria-label="Remove ${esc(c[2])}" data-rm="${c[0]}" data-v="${c[1]}">×</button></span>`).join("")+`<button class="link small" id="clearF">Clear all</button>`:`<span class="small muted">No filters applied – use the panel on the left to narrow by fabric, colour or price.</span>`}</div>
    ${list.length?`<div class="grid">${list.map(p=>`<button class="pcard" data-p="${p.id}">${img(p,p.colours[0])}<div class="b"><div class="kicker">${p.craft}</div><div class="pname">${esc(p.colours[0])} ${p.name}</div><div><span class="price">${rs(p.price)}</span>${p.mrp>p.price?`<span class="mrp">${rs(p.mrp)}</span><span class="off">-${Math.round((1-p.price/p.mrp)*100)}%</span>`:""}</div><div class="swrow">${p.colours.map(c=>`<span class="dot" title="${c}" style="background:${COLOURS[c].hex}"></span>`).join("")}<span class="small muted" style="margin-left:4px">${p.colours.length} colours</span></div></div></button>`).join("")}</div>`
     :`<div class="empty">No dupattas match all of these filters.<br><button class="link" id="clearF2">Clear filters</button></div>`}
   </section>
  </div>`;
}
function S2(){
  const p=byId(st.pid); const c=st.colour; const editing=st.editIndex!==null;
  const pinOk=st.pinMsg&&st.pinMsg.ok;
  return `<div class="crumb"><button id="back1">Dupattas</button> / ${esc(c)} ${p.name}</div>
  <div class="pdp">
   <div class="gallery">${img(p,c)}${img(p,c)}</div>
   <div>
    <div class="kicker">${p.craft}</div>
    <h1>${esc(c)} ${p.name}</h1>
    <div style="font-size:22px"><span class="price">${rs(p.price)}</span>${p.mrp>p.price?`<span class="mrp" style="font-size:15px">${rs(p.mrp)}</span><span class="off">-${Math.round((1-p.price/p.mrp)*100)}%</span>`:""}</div>
    <div class="tax">MRP incl. of all taxes</div>
    <div class="opt"><div class="lbl">COLOUR:<b id="colName">${esc(c)}</b></div>
     <div class="swatches">${p.colours.map(x=>{const so=isSold(p.id,x);return `<button class="sw ${x===c?'on':''}" data-c="${x}" ${so?'disabled aria-disabled="true"':''} aria-pressed="${x===c}"><span class="s" style="background:${COLOURS[x].hex}"></span>${x}${so?'<span class="so">Sold out</span>':''}</button>`}).join("")}</div>
    </div>
    <div class="opt"><div class="lbl">SIZE:<b>Free Size</b></div>
     <div class="sizebtn">✓ Free Size</div>
     <div class="dims"><svg width="54" height="26" viewBox="0 0 54 26"><rect x="1" y="5" width="52" height="16" fill="${COLOURS[c].hex}" stroke="#999"/><path d="M1 2h52M1 24h0" stroke="#7A2E2A" stroke-width="1.2"/></svg>
      <div><b>${p.dims}</b> (length × width)<br><span class="muted small">About the length of an outstretched arm span – drapes over both shoulders.</span></div></div>
    </div>
    <div class="pin"><div class="small" style="font-weight:600;margin-bottom:6px">Check delivery date</div>
     <div class="r"><input type="text" inputmode="numeric" maxlength="6" id="pinIn" placeholder="Enter 6-digit PIN code" value="${esc(st.pin)}" aria-label="PIN code"><button class="btn ghost" id="pinBtn" style="padding:8px 16px">Check</button></div>
     ${st.pinMsg?`<div class="small" style="margin-top:7px;color:${pinOk?'var(--ok)':'var(--err)'};font-weight:500">${st.pinMsg.t}</div>`:""}
    </div>
    <div class="notice warn" style="margin-top:14px"><span class="ic">!</span><div><b>Non-returnable item.</b> Dupattas can’t be returned or exchanged once delivered, so please check the colour and size above before buying.</div></div>
    <div class="buyrow">
     ${editing?"":`<div class="qty"><button id="qm" aria-label="Decrease quantity">−</button><span id="qv">${st.qty||1}</span><button id="qp" aria-label="Increase quantity">+</button></div>`}
     <button class="btn" style="flex:1" id="addBtn" ${isSold(p.id,c)?"disabled":""}>${editing?"UPDATE ITEM IN BAG":"ADD TO BAG"}</button>
    </div>
    ${editing?`<div style="margin-top:8px"><button class="link small" id="cancelEdit">Cancel – keep bag as it is</button></div>`:""}
    <div class="facts"><div><b>Fabric:</b> ${p.fabric}</div><div><b>Care:</b> ${p.care}</div><div><b>Shipping:</b> Free on orders above ₹1,000</div></div>
   </div>
  </div>`;
}
function bagItem(i,idx,opts={}){
  const p=byId(i.pid); const so=isSold(i.pid,i.colour); const ch=opts.highlight;
  return `<div class="item">${img(p,i.colour)}<div>
   <div class="pname" style="font-size:15px">${ch?`<span class="hl">${esc(i.colour)}</span>`:esc(i.colour)} ${p.name}${ch?'<span class="changed-tag">CHANGED</span>':''}</div>
   <div class="attrs"><span><b>Colour:</b> ${ch?`<span class="hl">${esc(i.colour)}</span>`:esc(i.colour)}</span><span><b>Size:</b> Free Size (${p.dims})</span><span><b>Qty:</b> ${i.qty}</span></div>
   <div class="small" style="color:var(--warn);margin-top:5px">Non-returnable</div>
   ${so?`<div class="notice err" style="margin-top:8px"><span class="ic">!</span><div><b>${esc(i.colour)} is now sold out.</b> Choose another colour to continue. <button class="link" data-edit="${idx}">Change colour</button></div></div>`:""}
   ${opts.controls?`<div style="display:flex;gap:16px;margin-top:10px;align-items:center"><div class="qty" style="height:34px"><button data-qm="${idx}" style="height:32px" aria-label="Decrease">−</button><span>${i.qty}</span><button data-qp="${idx}" style="height:32px" aria-label="Increase">+</button></div><button class="link small" data-edit="${idx}">Change colour</button><button class="link small" data-del="${idx}" style="color:#666">Remove</button></div>`:""}
  </div><div class="price">${rs(byId(i.pid).price*i.qty)}</div></div>`;
}
function bill(){
  return `<div class="bill"><div><span>Items (MRP)</span><span>${rs(mrpTotal())}</span></div>
   ${mrpTotal()>subtotal()?`<div><span>Discount</span><span>− ${rs(mrpTotal()-subtotal())}</span></div>`:""}
   <div><span>Delivery</span><span class="${ship()?'':'free'}">${ship()?rs(ship()):"FREE"}</span></div>
   <div class="tot"><span>Total</span><span>${rs(total())}</span></div></div>`;
}
function S3(){
  if(!st.bag.length) return `${stepper("S3")}<div class="empty"><h2 style="margin-bottom:6px">Your bag is empty</h2><button class="btn" id="shop">Browse dupattas</button></div>`;
  const blocked=st.bag.some(i=>isSold(i.pid,i.colour));
  return `${stepper("S3")}<div class="two"><div class="panel"><h3>My Bag (${st.bag.reduce((s,i)=>s+i.qty,0)})</h3>${st.bag.map((i,idx)=>bagItem(i,idx,{controls:true})).join('<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">')}</div>
  <div class="panel"><h3>Order summary</h3>${bill()}
   <div class="small" style="margin-top:10px">${st.pin&&validPin(st.pin)?`<span style="color:var(--ok);font-weight:500">Estimated delivery to ${st.pin}: ${eta()}</span>`:`<span class="muted">Delivery date shown once you enter a PIN code.</span>`}</div>
   <button class="btn block" style="margin-top:14px" id="toCheckout" ${blocked?"disabled":""}>CONTINUE TO DELIVERY</button>
   ${blocked?`<div class="small" style="color:var(--err);margin-top:6px">Change the sold-out colour to continue.</div>`:""}
   <div style="margin-top:10px;text-align:center"><button class="link small" id="keep">Continue shopping</button></div></div></div>`;
}
function fld(k,label,type="text",cls="",extra=""){
  const e=st.errors[k];
  return `<div class="${cls}"><label class="f" for="f_${k}">${label}</label><input type="${type}" id="f_${k}" data-k="${k}" value="${esc(st.form[k])}" class="${e?'bad':''}" ${e?`aria-invalid="true" aria-describedby="e_${k}"`:""} ${extra}>${e?`<div class="ferr" id="e_${k}">${e}</div>`:""}</div>`;
}
function S4(){
  const errN=Object.keys(st.errors).length;
  return `${stepper("S4")}<div class="two"><div class="panel">
   ${errN?`<div class="notice err" style="margin-bottom:14px" role="alert"><span class="ic">!</span><div><b>${errN} field${errN>1?"s need":" needs"} attention.</b> Everything else you typed has been kept.</div></div>`:""}
   <h3>Delivery address</h3>
   <div class="form-grid">
    ${fld("name","Recipient’s full name","text","full",'autocomplete="off"')}
    ${fld("phone","Mobile number (10 digits)","tel","",'inputmode="numeric" maxlength="10"')}
    ${fld("email","Email for order updates (optional)","email")}
    ${fld("addr1","House / flat no., street","text","full")}
    ${fld("addr2","Area / landmark (optional)","text","full")}
    ${fld("city","City")}
    <div><label class="f" for="f_state">State</label><select id="f_state" data-k="state" class="${st.errors.state?'bad':''}"><option value="">Select state</option>${STATES.map(s=>`<option ${st.form.state===s?"selected":""}>${s}</option>`).join("")}</select>${st.errors.state?`<div class="ferr">${st.errors.state}</div>`:""}</div>
    ${fld("pin","PIN code (6 digits)","text","",'inputmode="numeric" maxlength="6"')}
    <div class="small" style="align-self:end;padding-bottom:12px;color:var(--ok);font-weight:500" id="etaNote">${validPin(st.form.pin)?"Estimated delivery: "+eta():""}</div>
   </div>
   <h3 style="margin-top:22px">Payment method</h3>
   <div class="small muted">Simulated – nothing is charged and no card details are collected.</div>
   <div class="pay">${[["UPI","UPI (simulated)"],["COD","Cash on delivery"],["CARD","Credit / debit card (simulated)"]].map(([v,l])=>`<label class="${st.pay===v?'on':''}"><input type="radio" name="pay" value="${v}" ${st.pay===v?"checked":""}>${l}</label>`).join("")}</div>
  </div>
  <div class="panel"><h3>Order summary</h3>${st.bag.map(i=>{const p=byId(i.pid);return `<div class="small" style="display:flex;gap:10px;margin-bottom:10px"><div style="width:44px;flex:none">${img(p,i.colour)}</div><div><b>${esc(i.colour)} ${p.name}</b><br>Free Size, Qty ${i.qty}</div></div>`}).join("")}
   <button class="link small" id="editBag">Edit bag</button>
   <div style="margin-top:10px">${bill()}</div>
   <button class="btn block" style="margin-top:14px" id="toReview">CONTINUE TO REVIEW</button>
   <div class="small muted" style="margin-top:6px;text-align:center">You’ll check everything before placing the order.</div>
  </div></div>`;
}
function reviewBody(mode){
  const f=st.form; const payL={UPI:"UPI (simulated)",COD:"Cash on delivery",CARD:"Credit / debit card (simulated)"}[st.pay];
  const ch=st.change;
  return `<div class="panel">
   <div class="sec-h"><h3>Item</h3><button class="link small" id="rvEditItem">Edit item</button></div>
   ${st.bag.map((i,idx)=>bagItem(i,idx,{highlight:mode==="S7"&&ch&&ch.idx===idx})).join("<br>")}
  </div>
  <div class="panel" style="margin-top:14px">
   <div class="rv-row"><div class="k">Deliver to</div><div><b>${esc(f.name)}</b><br>${esc(f.addr1)}${f.addr2?", "+esc(f.addr2):""}<br>${esc(f.city)}, ${esc(f.state)} ${esc(f.pin)}<br>Mobile ${esc(f.phone)}</div><button class="link small" id="rvEditAddr">Edit</button></div>
   <div class="rv-row"><div class="k">Estimated delivery</div><div><b>${eta()}</b> <span class="small muted">(estimate)</span></div><span></span></div>
   <div class="rv-row"><div class="k">Payment</div><div>${payL}</div><button class="link small" id="rvEditPay">Edit</button></div>
   <div class="rv-row"><div class="k">Returns</div><div>Non-returnable – this item can’t be returned or exchanged.</div><span></span></div>
  </div>`;
}
function reviewSide(mode){
  return `<div class="panel"><h3>Total</h3>${bill()}
   ${mode==="S7"&&st.change&&st.change.priceDiff?`<div class="small" style="margin-top:6px"><span class="hl">Total updated: ${rs(st.change.oldTotal)} → ${rs(total())}</span></div>`:mode==="S7"?`<div class="small muted" style="margin-top:6px">Total unchanged.</div>`:""}
   <button class="btn block" style="margin-top:14px" id="placeBtn">PLACE ORDER (${rs(total())})</button>
   <div class="small muted" style="margin-top:6px;text-align:center">Prototype – no payment is taken.</div></div>`;
}
function S5(){ return `${stepper("S5")}<h2 style="font-size:28px;margin-bottom:12px">Review your order</h2><div class="two"><div>${reviewBody("S5")}</div>${reviewSide("S5")}</div>`; }
function S6(){
  const i=st.bag[0]; const p=byId(i.pid); const other=p.colours.find(c=>c!==i.colour);
  const sim=P.find(x=>x.id!==p.id&&x.price<=2000&&x.colours.some(c=>COLOURS[c].fam.includes("White / Ivory")))||P[1];
  const simC=sim.colours[0];
  return `${stepper("S6")}<h2 style="font-size:28px;margin-bottom:12px">Review your order</h2>
  <div class="panel" style="border:2px solid var(--err)" role="alert">
   <div style="display:flex;gap:12px;align-items:flex-start"><div class="bigcheck" style="background:var(--err);width:40px;height:40px;font-size:22px;margin:0;flex:none">!</div>
   <div><h3 style="margin-bottom:2px">Sorry – ${esc(i.colour)} just sold out</h3>
   <div>The <b>${esc(i.colour)} ${p.name}</b> sold out while it was in your bag. <b>Your order has not been placed and nothing was charged.</b> Pick a replacement below and you’ll go straight back to review.</div>
   <div class="kept"><div>Delivery address kept (${esc(st.form.name)}, ${esc(st.form.city)} ${esc(st.form.pin)})</div><div>Payment method kept (${{UPI:"UPI",COD:"Cash on delivery",CARD:"Card"}[st.pay]})</div><div>Quantity kept (${i.qty})</div></div></div></div>
   <div class="opts">
    ${other?`<div class="optcard">${img(p,other)}<div><div class="small muted">Same dupatta, other colour</div><b>${esc(other)} ${p.name}</b><div class="small">Free Size (${p.dims}), <span class="price">${rs(p.price)}</span>, <span style="color:var(--ok)">In stock</span></div><div class="small muted">Total stays ${rs(total())}</div><button class="btn" data-swap="same">Choose ${esc(other)}</button></div></div>`:""}
    <div class="optcard">${img(sim,simC)}<div><div class="small muted">Similar dupatta</div><b>${esc(simC)} ${sim.name}</b><div class="small">Free Size (${sim.dims}), <span class="price">${rs(sim.price)}</span>, <span style="color:var(--ok)">In stock</span></div><div class="small muted">New total would be ${rs(sim.price*i.qty+((sim.price*i.qty)>=1000?0:99))}</div><button class="btn ghost" data-swap="sim" data-sim="${sim.id}">Choose this instead</button></div></div>
   </div>
   <div style="margin-top:12px" class="small">Prefer to look around? <button class="link" id="s6bag">Go to bag</button> (your details stay saved).</div>
  </div>
  <div style="opacity:.45;pointer-events:none;margin-top:14px" aria-hidden="true"><div class="two"><div>${reviewBody("S5")}</div><div class="panel"><h3>Total</h3>${bill()}<button class="btn block" disabled style="margin-top:14px">PLACE ORDER</button></div></div></div>`;
}
function S7(){
  const c=st.change;
  return `${stepper("S7")}<h2 style="font-size:28px;margin-bottom:12px">Review your order</h2>
  <div class="notice info" style="margin-bottom:14px"><span class="ic">i</span><div><b>Updated:</b> ${esc(c.text)}. Your address and payment are unchanged. Please check the item below, then place your order.</div></div>
  <div class="two"><div>${reviewBody("S7")}</div>${reviewSide("S7")}</div>`;
}
function S8(){
  const f=st.form; const payL={UPI:"UPI (simulated)",COD:"Cash on delivery",CARD:"Card (simulated)"}[st.pay];
  return `${stepper("S8")}<div class="confirm panel" style="padding:28px">
   <div class="bigcheck">✓</div>
   <h1 style="font-size:36px">Order placed</h1>
   <div style="margin:6px 0 16px">Thank you! Order <b>${st.orderNo}</b> is confirmed${f.email?` and a copy will be sent to <b>${esc(f.email)}</b>`:""}.</div>
   ${st.bag.map(i=>bagItem(i,0,{})).join("")}
   <div class="rv-row" style="border-top:1px solid var(--line);margin-top:14px"><div class="k">Arriving</div><div><b>${eta()}</b> (estimate)</div><span></span></div>
   <div class="rv-row"><div class="k">Delivering to</div><div>${esc(f.name)}, ${esc(f.addr1)}, ${esc(f.city)} ${esc(f.pin)}</div><span></span></div>
   <div class="rv-row"><div class="k">Paid</div><div><b>${rs(total())}</b>, ${payL}</div><span></span></div>
   <div class="rv-row"><div class="k">What’s next</div><div>We’ll message ${esc(f.phone)} when it ships. This order is final (non-returnable).</div><span></span></div>
   <div style="display:flex;gap:10px;margin-top:18px"><button class="btn" id="again">Continue shopping</button><button class="btn ghost" id="reset2">Reset prototype</button></div>
  </div>`;
}

/* ---------- render & events ---------- */
const VIEWS={S1,S2,S3,S4,S5,S6,S7,S8};
function render(){
  const s = st.screen==="S5"&&st.change ? "S7" : st.screen;
  st.screen=s;
  document.getElementById("app").innerHTML=VIEWS[s]();
  document.getElementById("sid").textContent=s+": "+SCREEN_NAMES[s]+(s==="S4"&&Object.keys(st.errors).length?" (error)":"");
  document.getElementById("bagN").textContent=st.bag.reduce((a,i)=>a+i.qty,0);
  document.title = s+": "+SCREEN_NAMES[s]+" – CSE 463 Prototype – Fabindia Dupatta Checkout Redesign";
  const L=document.getElementById("layer");
  L.innerHTML=(st.toast?`<div class="toast" role="status">${st.toast}</div>`:"")+(st.modal?modalHTML():"");
  bind();
}
function modalHTML(){
  return `<div class="modal-bg" id="mbg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mh"><h3 id="mh">Delivery card</h3><div class="small muted">Use these fictional details when the prototype asks where to deliver.</div>
  <table class="card-table"><tr><td>Name</td><td>Meera Kapoor</td></tr><tr><td>Mobile</td><td>9811023456</td></tr><tr><td>Address</td><td>B-14, Green Park Extension</td></tr><tr><td>Landmark</td><td>Near Uphaar Market</td></tr><tr><td>City</td><td>New Delhi</td></tr><tr><td>State</td><td>Delhi</td></tr><tr><td>PIN code</td><td>110016</td></tr></table>
  <button class="btn block" id="mclose">Close</button></div></div>`;
}
const $=id=>document.getElementById(id);
const on=(id,fn)=>{const e=$(id); if(e) e.onclick=fn;};
function bind(){
  const s=st.screen;
  on("mclose",()=>{st.modal=null;render();});
  const mbg=$("mbg"); if(mbg) mbg.onclick=e=>{if(e.target===mbg){st.modal=null;render();}};
  if(s==="S1"){
    document.querySelectorAll("[data-f]").forEach(cb=>cb.onchange=()=>{const g=cb.dataset.f; let v=cb.dataset.v; if(g==="price") v=+v; const a=st.filters[g]; const k=a.indexOf(v); k>=0?a.splice(k,1):a.push(v); render();});
    document.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{const g=b.dataset.rm; let v=b.dataset.v; if(g==="price") v=+v; st.filters[g]=st.filters[g].filter(x=>x!==v); render();});
    on("clearF",()=>{st.filters={fabric:[],fam:[],price:[]};render();}); on("clearF2",()=>{st.filters={fabric:[],fam:[],price:[]};render();});
    document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const p=byId(b.dataset.p); st.pid=p.id; st.colour=p.colours.find(c=>!isSold(p.id,c))||p.colours[0]; st.qty=1; st.editIndex=null; go("S2");});
  }
  if(s==="S2"){
    on("back1",()=>go("S1"));
    document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{st.colour=b.dataset.c; render();});
    on("qm",()=>{st.qty=Math.max(1,(st.qty||1)-1);render();}); on("qp",()=>{st.qty=Math.min(5,(st.qty||1)+1);render();});
    const pinIn=$("pinIn"); if(pinIn){ pinIn.oninput=()=>{st.pin=pinIn.value.replace(/\D/g,"");}; pinIn.onkeydown=e=>{if(e.key==="Enter") $("pinBtn").click();}; }
    on("pinBtn",()=>{ st.pin=$("pinIn").value.replace(/\D/g,""); if(validPin(st.pin)){ st.pinMsg={ok:true,t:`✓ Delivers to ${st.pin} by ${eta()} (estimate), free shipping`}; if(!st.form.pin) st.form.pin=st.pin; } else st.pinMsg={ok:false,t:"Enter a valid 6-digit PIN code (e.g. 110016)."}; render(); });
    on("cancelEdit",()=>{st.editIndex=null;go("S3");});
    on("addBtn",()=>{
      if(st.editIndex!==null){ const it=st.bag[st.editIndex]; const old=it.colour; const wasSold=isSold(it.pid,old); if(old!==st.colour){ it.colour=st.colour; if(wasSold||st.recoveryDone){ st.change={idx:st.editIndex,text:`colour changed from ${old} to ${st.colour}`,oldTotal:total(),priceDiff:false}; st.recoveryDone=true; } } st.editIndex=null; go("S3"); st.toast=null; return; }
      const ex=st.bag.find(i=>i.pid===st.pid&&i.colour===st.colour); if(ex) ex.qty+=st.qty||1; else st.bag.push({pid:st.pid,colour:st.colour,qty:st.qty||1});
      st.screen="S3"; st.toast=`✓ Added <b>${esc(st.colour)} ${byId(st.pid).name}</b> to your bag`; render(); window.scrollTo(0,0);
    });
  }
  if(s==="S3"){
    on("shop",()=>go("S1")); on("keep",()=>go("S1"));
    on("toCheckout",()=>{ if(!st.form.pin&&validPin(st.pin)) st.form.pin=st.pin; st.errors={}; go("S4"); });
    document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const k=+b.dataset.edit; const it=st.bag[k]; st.editIndex=k; st.pid=it.pid; const p=byId(it.pid); st.colour=isSold(it.pid,it.colour)?(p.colours.find(c=>!isSold(p.id,c))||it.colour):it.colour; go("S2");});
    document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{st.bag.splice(+b.dataset.del,1); if(st.change) st.change=null; render();});
    document.querySelectorAll("[data-qm]").forEach(b=>b.onclick=()=>{const it=st.bag[+b.dataset.qm]; it.qty=Math.max(1,it.qty-1); render();});
    document.querySelectorAll("[data-qp]").forEach(b=>b.onclick=()=>{const it=st.bag[+b.dataset.qp]; it.qty=Math.min(5,it.qty+1); render();});
  }
  if(s==="S4"){
    document.querySelectorAll("[data-k]").forEach(inp=>{ inp.oninput=inp.onchange=()=>{ st.form[inp.dataset.k]=inp.value; if(inp.dataset.k==="pin"){ const n=$("etaNote"); if(n) n.textContent=validPin(inp.value)?"Estimated delivery: "+eta():""; } if(st.triedSubmit&&st.errors[inp.dataset.k]){ const e=validate()[inp.dataset.k]; if(!e){ delete st.errors[inp.dataset.k]; inp.classList.remove("bad"); const m=$("e_"+inp.dataset.k); if(m) m.remove(); } } }; });
    document.querySelectorAll('input[name=pay]').forEach(r=>r.onchange=()=>{st.pay=r.value; render();});
    on("editBag",()=>go("S3"));
    on("toReview",()=>{ st.triedSubmit=true; st.errors=validate(); if(Object.keys(st.errors).length){ render(); const first=document.querySelector(".bad"); if(first) first.focus(); window.scrollTo(0,0); return;} go("S5"); });
  }
  if(s==="S5"||s==="S7"){
    on("rvEditItem",()=>go("S3")); on("rvEditAddr",()=>go("S4")); on("rvEditPay",()=>go("S4"));
    on("placeBtn",()=>{ if(!st.recoveryDone){ const i=st.bag[0]; st.soldOut[i.pid+"|"+i.colour]=true; go("S6"); } else { st.orderNo="FB-"+(Math.floor(Date.now()/1000)%1000000+100000); go("S8"); } });
  }
  if(s==="S6"){
    on("s6bag",()=>go("S3"));
    document.querySelectorAll("[data-swap]").forEach(b=>b.onclick=()=>{
      const i=st.bag[0]; const p=byId(i.pid); const oldT=total(); const old=`${i.colour} ${p.name}`;
      if(b.dataset.swap==="same"){ const nc=p.colours.find(c=>c!==i.colour); st.change={idx:0,text:`colour changed from ${i.colour} to ${nc}`,oldTotal:oldT,priceDiff:false}; i.colour=nc; }
      else { const sim=byId(b.dataset.sim); i.pid=sim.id; i.colour=sim.colours[0]; st.change={idx:0,text:`${old} replaced with ${i.colour} ${sim.name}`,oldTotal:oldT,priceDiff:total()!==oldT}; }
      st.recoveryDone=true; go("S7");
    });
  }
  if(s==="S8"){ on("again",()=>{ const keep=st.form; st=fresh(); st.form=keep; go("S1");}); on("reset2",reset); }
}
function validate(){
  const f=st.form, e={};
  if(!f.name.trim()) e.name="Enter the recipient’s name.";
  if(!/^[6-9][0-9]{9}$/.test(f.phone.replace(/\s/g,""))) e.phone="Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
  if(f.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email="Check the email format (e.g. name@example.com) or leave it blank.";
  if(!f.addr1.trim()) e.addr1="Enter the house / flat number and street.";
  if(!f.city.trim()) e.city="Enter the city.";
  if(!f.state) e.state="Select a state.";
  if(!validPin(f.pin)) e.pin="PIN codes have exactly 6 digits (e.g. 110016).";
  return e;
}
function reset(){ st=fresh(); render(); window.scrollTo(0,0); }
$("resetBtn").onclick=reset;
$("cardBtn").onclick=()=>{st.modal=true;render();};
$("bagBtn").onclick=()=>{ if(["S6"].includes(st.screen)) return go("S3"); go("S3"); };
$("home").onclick=()=>go("S1");
render();

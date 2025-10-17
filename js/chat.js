document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('userInput');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage('user', msg);
    input.value = '';
    setTimeout(() => {
        // try Gemini first, fall back to rule-based
        sendToGemini(msg).then(resp => {
            addMessage('bot', resp);
        }).catch(() => {
            addMessage('bot', getBotAnswer(msg));
        });
    }, 700);
});

// --- Customization for Živadin Jarić, dr mr za automatiku ---
const botName = "Živadin Jarić, dr mr za automatiku";
const botIntro = "Dobrodošli! Ja sam Živadin Jarić, dr mr za automatiku i domaćin ove web stranice. Pitajte me sve što vas zanima o pametnim kućama, kontroli pristupa i automatizaciji!";

const botAnswers = [
    {
        keywords: ["pametna kuća", "smart home", "automatizacija", "automatski"],
        answer: "Kao domaćin sajta, mogu da vam kažem da pametne kuće omogućavaju daljinsko upravljanje rasvetom, grejanjem, sigurnošću i drugim uređajima putem aplikacije ili glasom. Ako želite detalje, slobodno pitajte!"
    },
    {
        keywords: ["kontrola pristupa", "pristup", "brava", "rfid", "biometrija"],
        answer: "Kao vaš domaćin, preporučujem sisteme kontrole pristupa sa karticama, PIN-om, biometrijom ili mobilnim aplikacijama za maksimalnu sigurnost."
    },
    {
        keywords: ["kamera", "video nadzor", "sigurnost", "bezbednost"],
        answer: "Pametne kamere su odličan izbor za praćenje prostora u realnom vremenu, detekciju pokreta i obaveštavanje korisnika. Ako vas zanima preporuka, tu sam!"
    },
    {
        keywords: ["cene", "cena", "koliko košta", "trošak", "plaćanje"],
        answer: "Cene zavise od broja uređaja i kompleksnosti sistema. Kao domaćin, savetujem da pogledate naš konfigurator za okvirnu ponudu ili mi napišite šta vas zanima."
    },
    {
        keywords: ["energetska efikasnost", "štednja", "struja", "potrošnja"],
        answer: "Pametni sistemi mogu značajno smanjiti potrošnju energije automatskim gašenjem uređaja i optimizacijom grejanja. Ako želite savete za štednju, pitajte slobodno!"
    },
    {
        keywords: ["podrška", "servis", "garancija", "kontakt"],
        answer: "Naš tim je dostupan 24/7 za podršku, servis i sva pitanja. Kao domaćin sajta, uvek sam tu da vas uputim na pravu adresu!"
    }
];

function getBotAnswer(question) {
    const q = question.toLowerCase();
    // parse numeric quantity expressions (e.g., "3 kamere", "tri kamere")
    const qtyMap = {"nula":0,"jedan":1,"jedna":1,"dva":2,"dvije":2,"tri":3,"četiri":4,"pet":5,"šest":6,"sedam":7,"osam":8,"devet":9,"deset":10};
    let detectedQty = null;
    // digits
    const digitMatch = q.match(/(\d+)\s*(kom|komada|komi|kamere|kamera|senzor|brava|utičnica|kamera|kamere|brave|kamera|kam|komad)?/i);
    if (digitMatch) detectedQty = parseInt(digitMatch[1]);
    else {
        // words
        for (const [word, num] of Object.entries(qtyMap)){
            if (q.includes(word)) { detectedQty = num; break; }
        }
    }
    // Prvo proveri artikle iz konfiguratora
    if (window.configuratorArticles) {
        const found = window.configuratorArticles.filter(a => a.keywords.some(k => q.includes(k)));
        if (found.length > 0) {
            // attach detectedQty if present
            const pairs = found.map(a => `${a.slug}:${detectedQty && detectedQty>0 ? detectedQty : 1}`);
            const preselectPairs = pairs.join(',');
            const configuratorUrl = `configurator.html?preselect=${encodeURIComponent(preselectPairs)}`;

            // build HTML list and include in-chat modal trigger
            let artikliTxt = found.map(a => {
                const qty = (detectedQty && detectedQty>0) ? detectedQty : 1;
                return `• <strong>${a.name}</strong> – ${a.description} (<span style='color:#00BFA5;'>€${(a.price||0).toFixed(2)}</span>) <a href='#' data-slug='${a.slug}' data-qty='${qty}' class='chat-config-btn' style='color:#4A90E2;text-decoration:underline;'>Pregled</a>`;
            }).join('<br>');

            // record analytic event for recommendation generation
            incrementRecommendationStat('generated', found.map(a=>a.slug));

            // return message with both inline preview links and option to open full configurator
            const openFull = `<a href='${configuratorUrl}' class='open-full-config' data-pre='${encodeURIComponent(preselectPairs)}'>Otvori konfigurator</a>`;
            setTimeout(()=> { attachChatPreviewHandlers(); }, 50);
            return `Preporučujem sledeće artikle iz naše ponude:<br>${artikliTxt}<br><br>Možete <a href='#' id='chatOpenModal' data-pre='${encodeURIComponent(preselectPairs)}' style='color:#4A90E2;text-decoration:underline;'>pogledati predlog</a> ili ${openFull}.`;
        }
    }
    // Ako nema artikla, koristi standardne odgovore
    for (const entry of botAnswers) {
        if (entry.keywords.some(k => q.includes(k))) {
            return entry.answer;
        }
    }
    return "Na to pitanje trenutno nemam tačan odgovor, ali kao domaćin sajta mogu da vas povežem sa našim stručnjacima ili da pokušam da pronađem više informacija!";
}

// On page load, show custom intro
window.addEventListener('DOMContentLoaded', function() {
    const chat = document.getElementById('chatMessages');
    chat.innerHTML = '';
    addMessage('bot', botIntro);
});

function addMessage(sender, text) {
    const chat = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + sender;
    msgDiv.innerHTML = `
        <div class="avatar">${sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
        <div class="text">${sender === 'bot' ? `<strong>${botName}:</strong> ` : ''}${text}</div>
    `;
    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
}

// attach handlers for preview buttons inside chat messages
function attachChatPreviewHandlers(){
    document.querySelectorAll('.chat-config-btn').forEach(btn=>{
        if (btn.dataset.attached) return; btn.dataset.attached = '1';
        btn.addEventListener('click', (e)=>{
            e.preventDefault();
            const slug = btn.dataset.slug; const qty = parseInt(btn.dataset.qty)||1;
            showChatConfiguratorModal([{slug, qty}]);
            incrementRecommendationStat('clicked', [slug]);
        });
    });
    const openModalLink = document.getElementById('chatOpenModal');
    if (openModalLink){
        openModalLink.addEventListener('click', (e)=>{
            e.preventDefault();
            const pre = decodeURIComponent(openModalLink.dataset.pre||'');
            const pairs = pre.split(',').map(p=>{ const [s,q]=p.split(':'); return {slug:s, qty:parseInt(q)||1}; });
            showChatConfiguratorModal(pairs);
            incrementRecommendationStat('clicked_bulk', pairs.map(p=>p.slug));
        });
    }
    // open-full links track click
    document.querySelectorAll('.open-full-config').forEach(a=>{
        if (a.dataset.att) return; a.dataset.att = '1';
        a.addEventListener('click', ()=>{
            incrementRecommendationStat('open_full', [a.dataset.pre]);
        });
    });
}

// Recommendation analytics in localStorage
function incrementRecommendationStat(eventType, slugs){
    try{
        const key = 'recommendationClicks';
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : {generated:0, clicked:0, clicked_bulk:0, open_full:0, items:{}};
        data[eventType] = (data[eventType]||0) + (Array.isArray(slugs)? (eventType==='generated'? slugs.length : slugs.length) : 1);
        slugs.forEach(s=>{ data.items[s] = (data.items[s]||0) + 1; });
        localStorage.setItem(key, JSON.stringify(data));
    }catch(e){ console.warn('Analytics save failed', e); }
}

// Modal logic: show suggested items inside the chat page
function showChatConfiguratorModal(pairs){
    const modal = document.getElementById('chatConfigModal');
    const body = document.getElementById('chatConfigBody');
    if(!modal || !body) return;
    body.innerHTML = '';
    let subtotal = 0;
    pairs.forEach(p=>{
        const art = window.configuratorArticles && window.configuratorArticles.find(a=>a.slug===p.slug);
        if(!art) return;
        const qty = p.qty||1;
        const row = document.createElement('div'); row.className='modal-row';
        row.innerHTML = `<div class='m-name'>${art.name} x${qty}</div><div class='m-price'>€${(art.price*qty).toFixed(2)}</div>`;
        body.appendChild(row);
        subtotal += art.price*qty;
    });
    const totals = document.createElement('div'); totals.className='modal-totals'; totals.innerHTML = `<strong>Međuzbir:</strong> €${subtotal.toFixed(2)}`;
    body.appendChild(totals);

    // set actions
    const applyBtn = document.getElementById('chatConfigApply');
    const openFull = document.getElementById('chatConfigOpenFull');
    applyBtn.onclick = ()=>{
        // apply to configurator fields (if open) via localStorage prefill flag
        const pre = pairs.map(p=>`${p.slug}:${p.qty||1}`).join(',');
        localStorage.setItem('chatPreselect', pre);
        // highlight in configurator page if user is on configurator
        if(window.location.pathname.endsWith('configurator.html')){
            applyPreselectFromChat(pairs);
        } else {
            // open configurator in same tab but anchored
            window.location.href = `configurator.html?preselect=${encodeURIComponent(pre)}`;
        }
        closeChatModal();
    };
    openFull.href = `configurator.html?preselect=${encodeURIComponent(pairs.map(p=>`${p.slug}:${p.qty||1}`).join(','))}`;
    modal.style.display = 'block'; modal.setAttribute('aria-hidden','false');
}

function closeChatModal(){
    const modal = document.getElementById('chatConfigModal');
    if(modal){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }
}

// close button
document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'chatConfigClose') closeChatModal();
    if(e.target && e.target.classList && e.target.classList.contains('chat-config-modal-backdrop')) closeChatModal();
});

// If configurator page listens for this helper, it will apply preselect without reload
window.applyPreselectFromChat = function(pairs){
    // pairs: [{slug,qty}]
    pairs.forEach(p=>{
        const el = document.querySelector(`.component-item[data-slug="${p.slug}"]`);
        if(el){
            const input = el.querySelector('input');
            const max = parseInt(input.max)||999; input.value = Math.min(max, p.qty||1); input.dispatchEvent(new Event('change'));
            // highlight and scroll
            el.classList.add('highlight-suggest');
            el.scrollIntoView({behavior:'smooth', block:'center'});
            setTimeout(()=> el.classList.remove('highlight-suggest'), 5000);
        }
    });
};

// Gemini integration hook — user must provide window.geminiConfig with endpoint/key if available
function sendToGemini(question){
    return new Promise((resolve, reject)=>{
        if(window.geminiConfig && window.geminiConfig.endpoint){
            // minimal fetch wrapper — user must provide proper CORS-enabled endpoint or proxy
            fetch(window.geminiConfig.endpoint, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({question, config: window.geminiConfig.options||{}})
            }).then(r=>r.json()).then(data=>{
                // expect data.answer or fallback
                if(data && data.answer) resolve(data.answer);
                else reject(new Error('No answer from Gemini')); 
            }).catch(err=>{ console.warn('Gemini call failed', err); reject(err); });
        } else {
            reject(new Error('No Gemini config'));
        }
    });
}

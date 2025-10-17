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
    // Multi-quantity parsing: find pairs like "3 kamere", "tri kamere", or "2 brave i 1 kamera"
    const qtyMap = {"nula":0,"jedan":1,"jedna":1,"dva":2,"dvije":2,"tri":3,"cetiri":4,"četri":4,"četiri":4,"pet":5,"šest":6,"sedam":7,"osam":8,"devet":9,"deset":10};
    // Build a map slug->qty for matched keywords
    const qtyResults = {}; // {slug: qty}
    // match digit-word pairs
    const digitPairs = q.matchAll(/(\d+)\s+([a-zčćžš]+\b)/gi);
    for (const m of digitPairs){
        const num = parseInt(m[1]); const word = m[2];
        // try to match word to product keywords
        if(window.configuratorArticles){
            for(const a of window.configuratorArticles){ if(a.keywords.some(k=> word.includes(k) || k.includes(word))){ qtyResults[a.slug] = Math.max(qtyResults[a.slug]||0, num); } }
        }
    }
    // match word-number words (tri, dva...) near product words
    for(const [w,n] of Object.entries(qtyMap)){
        if(q.includes(w)){
            // find nearest product keyword occurrence
            if(window.configuratorArticles){
                for(const a of window.configuratorArticles){ if(a.keywords.some(k=> q.includes(k))){ qtyResults[a.slug] = Math.max(qtyResults[a.slug]||0, n); } }
            }
        }
    }
    // Prvo proveri artikle iz konfiguratora
    if (window.configuratorArticles) {
        const found = window.configuratorArticles.filter(a => a.keywords.some(k => q.includes(k)));
        if (found.length > 0) {
            // build pairs using any explicitly detected quantities per-slug, default 1
            const pairs = found.map(a => `${a.slug}:${(qtyResults[a.slug] && qtyResults[a.slug]>0) ? qtyResults[a.slug] : 1}`);
            const preselectPairs = pairs.join(',');
            const configuratorUrl = `configurator.html?preselect=${encodeURIComponent(preselectPairs)}`;

            // build HTML list and include in-chat modal trigger
            let artikliTxt = found.map(a => {
                const qty = (qtyResults[a.slug] && qtyResults[a.slug]>0) ? qtyResults[a.slug] : 1;
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
        row.innerHTML = `<div class='m-name'>${art.name}</div><div class='m-controls'><input type='number' min='1' value='${qty}' data-slug='${art.slug}' class='modal-qty' style='width:64px;padding:6px;border-radius:6px;border:1px solid #ddd;'/></div><div class='m-price'>€<span class='m-line-price'>${(art.price*qty).toFixed(2)}</span></div>`;
        body.appendChild(row);
        subtotal += art.price*qty;
    });
    const totals = document.createElement('div'); totals.className='modal-totals'; totals.innerHTML = `<strong>Međuzbir:</strong> €<span id='modalSubtotal'>${subtotal.toFixed(2)}</span>`;
    body.appendChild(totals);

    // attach qty change handlers inside modal
    function recomputeModal(){
        let newSub = 0;
        body.querySelectorAll('.modal-row').forEach(r=>{
            const slug = r.querySelector('.modal-qty').dataset.slug;
            const qty = parseInt(r.querySelector('.modal-qty').value) || 0;
            const art = window.configuratorArticles.find(a=>a.slug===slug);
            if(!art) return;
            const line = (art.price * qty);
            r.querySelector('.m-line-price').textContent = line.toFixed(2);
            newSub += line;
        });
        const inst = Math.max(newSub * (window.CONFIG_INSTALLATION.percentage||0.15), (window.CONFIG_INSTALLATION.min||99.99));
        document.getElementById('modalSubtotal').textContent = newSub.toFixed(2);
        // show installation and total in footer if desired
        const footer = document.querySelector('.chat-config-modal-panel footer');
        let instEl = footer.querySelector('.modal-install');
        if(!instEl){ instEl = document.createElement('div'); instEl.className='modal-install'; instEl.style.marginRight='auto'; footer.insertBefore(instEl, footer.firstChild); }
        instEl.innerHTML = `<small>Instalacija: €${inst.toFixed(2)}</small><br><small>Ukupno: €${(newSub+inst).toFixed(2)}</small>`;
    }
    body.querySelectorAll('.modal-qty').forEach(i=> i.addEventListener('change', recomputeModal));
    recomputeModal();

    // set actions
    const applyBtn = document.getElementById('chatConfigApply');
    const openFull = document.getElementById('chatConfigOpenFull');
    applyBtn.onclick = ()=>{
        // read adjusted quantities from modal inputs
        const adjusted = [];
        body.querySelectorAll('.modal-qty').forEach(i=>{
            const s = i.dataset.slug; const q = parseInt(i.value) || 0; if(q>0) adjusted.push({slug:s, qty:q});
        });
        const pre = adjusted.map(p=>`${p.slug}:${p.qty}`).join(',');
        localStorage.setItem('chatPreselect', pre);
        if(window.location.pathname.endsWith('configurator.html')){
            window.applyPreselectFromChat(adjusted);
        } else {
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

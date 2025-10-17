// Mock AI agent for Smart Home/Access Control/Automation
const botAnswers = [
    {
        keywords: ["pametna kuća", "smart home", "automatizacija", "automatski"],
        answer: "Pametne kuće omogućavaju daljinsko upravljanje rasvetom, grejanjem, sigurnošću i drugim uređajima putem aplikacije ili glasom."
    },
    {
        keywords: ["kontrola pristupa", "pristup", "brava", "rfid", "biometrija"],
        answer: "Sistemi kontrole pristupa koriste kartice, PIN, biometriju ili mobilne aplikacije za siguran ulazak u prostor."
    },
    {
        keywords: ["kamera", "video nadzor", "sigurnost", "bezbednost"],
        answer: "Pametne kamere omogućavaju praćenje prostora u realnom vremenu, detekciju pokreta i obaveštavanje korisnika."
    },
    {
        keywords: ["cene", "cena", "koliko košta", "trošak", "plaćanje"],
        answer: "Cene zavise od broja uređaja i kompleksnosti sistema. Pogledajte naš konfigurator za okvirnu ponudu."
    },
    {
        keywords: ["energetska efikasnost", "štednja", "struja", "potrošnja"],
        answer: "Pametni sistemi mogu značajno smanjiti potrošnju energije automatskim gašenjem uređaja i optimizacijom grejanja."
    },
    {
        keywords: ["podrška", "servis", "garancija", "kontakt"],
        answer: "Naš tim je dostupan 24/7 za podršku, servis i sva pitanja. Kontaktirajte nas putem forme ili telefona."
    }
];

function getBotAnswer(question) {
    const q = question.toLowerCase();
    for (const entry of botAnswers) {
        if (entry.keywords.some(k => q.includes(k))) {
            return entry.answer;
        }
    }
    return "Na to pitanje trenutno nemam tačan odgovor, ali mogu da vas povežem sa našim stručnjacima!";
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('userInput');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage('user', msg);
    input.value = '';
    setTimeout(() => {
        addMessage('bot', getBotAnswer(msg));
    }, 700);
});

function addMessage(sender, text) {
    const chat = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + sender;
    msgDiv.innerHTML = `
        <div class="avatar">${sender === 'bot' ? '<i class=\'fas fa-robot\'></i>' : '<i class=\'fas fa-user\'></i>'}</div>
        <div class="text">${text}</div>
    `;
    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
}

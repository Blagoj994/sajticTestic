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

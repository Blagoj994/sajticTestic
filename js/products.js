// Central product catalog used by configurator and chat agent
window.configuratorArticles = [
    {
        slug: 'smart-light',
        category: 'smart-home',
        name: 'Pametno Osvetljenje',
        keywords: ['osvetljenje', 'sijalica', 'svetlo', 'hue', 'rasveta', 'smart light'],
        description: 'Philips Hue komplet sa 3 sijalice, RGB i daljinsko upravljanje',
        price: 129.99,
        max: 10
    },
    {
        slug: 'thermostat-nest',
        category: 'smart-home',
        name: 'Pametni Termostat',
        keywords: ['termostat', 'grejanje', 'hladjenje', 'temperatura', 'nest'],
        description: 'Nest Learning Thermostat sa adaptivnim učenjem i daljinskim pristupom',
        price: 249.99,
        max: 5
    },
    {
        slug: 'security-camera',
        category: 'smart-home',
        name: 'Sigurnosna Kamera',
        keywords: ['kamera', 'video', 'nadzor', 'sigurnost', 'camera', 'ip kamera'],
        description: '1080p HD Wi-Fi kamera sa noćnim vidom i detekcijom pokreta',
        price: 179.99,
        max: 8
    },
    {
        slug: 'smart-plug',
        category: 'smart-home',
        name: 'Pametna Utičnica',
        keywords: ['utičnica', 'plug', 'smart plug', 'energetska štednja'],
        description: 'Pametna utičnica sa praćenjem potrošnje i daljinskim uključenjem',
        price: 39.99,
        max: 20
    },
    {
        slug: 'biometric-lock',
        category: 'access-control',
        name: 'Biometrijska Brava',
        keywords: ['brava', 'biometrija', 'otisak', 'prsta', 'pin', 'kartica', 'lock'],
        description: 'Brava sa otiskom prsta, PIN-om i podrškom za kartice',
        price: 299.99,
        max: 5
    },
    {
        slug: 'rfid-reader',
        category: 'access-control',
        name: 'RFID Čitač',
        keywords: ['rfid', 'čitač', 'kartica', 'reader'],
        description: 'Profesionalni čitač kartica za kontrolu pristupa',
        price: 149.99,
        max: 10
    },
    {
        slug: 'access-controller',
        category: 'access-control',
        name: 'Kontroler Pristupa',
        keywords: ['kontroler', 'pristupa', 'vrata', 'controller'],
        description: 'Centralni kontroler za 4 vrata sa integracijom',
        price: 399.99,
        max: 3
    },
    {
        slug: 'door-sensor',
        category: 'smart-home',
        name: 'Senzor Vrata/Prozora',
        keywords: ['senzor', 'vrata', 'prozor', 'alarm', 'magnet'],
        description: 'Senzor za vrata i prozore za automatska obaveštenja i scenarije',
        price: 29.99,
        max: 30
    },
    {
        slug: 'smoke-detector',
        category: 'smart-home',
        name: 'Pametni Detektor Dima',
        keywords: ['dim', 'detektor', 'požar', 'bezbednost'],
        description: 'Detektor dima sa povezivanjem na aplikaciju i alarmom',
        price: 89.99,
        max: 10
    }
];

// Utility: find article by slug
window.findArticleBySlug = function(slug) {
    return window.configuratorArticles.find(a => a.slug === slug);
};

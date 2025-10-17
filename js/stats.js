// Visits per day (mock data)
const visitsData = {
    labels: ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'],
    datasets: [{
        label: 'Broj poseta',
        data: [120, 150, 180, 90, 200, 250, 170],
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        borderColor: 'rgba(74, 144, 226, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(74, 144, 226, 1)',
        pointRadius: 5
    }]
};

const visitsConfig = {
    type: 'line',
    data: visitsData,
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    }
};

// Interest by service (mock data)
const interestData = {
    labels: ['Smart Home', 'Kontrola Pristupa', 'Automatizacija', 'Video Nadzor', 'Energetska Efikasnost'],
    datasets: [{
        label: 'Interesovanje',
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
            'rgba(0,191,165,0.7)',
            'rgba(74,144,226,0.7)',
            'rgba(255,82,82,0.7)',
            'rgba(255,193,7,0.7)',
            'rgba(156,39,176,0.7)'
        ],
        borderColor: [
            'rgba(0,191,165,1)',
            'rgba(74,144,226,1)',
            'rgba(255,82,82,1)',
            'rgba(255,193,7,1)',
            'rgba(156,39,176,1)'
        ],
        borderWidth: 2
    }]
};

const interestConfig = {
    type: 'doughnut',
    data: interestData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#2C3E50', font: { size: 14 } }
            }
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    new Chart(document.getElementById('visitsChart'), visitsConfig);
    new Chart(document.getElementById('interestChart'), interestConfig);
    // Recommendation analytics from localStorage
    try{
        const raw = localStorage.getItem('recommendationClicks');
        const data = raw ? JSON.parse(raw) : null;
        if(data && data.items){
            const labels = Object.keys(data.items);
            const counts = labels.map(l=>data.items[l]||0);
            const recommendConfig = {
                type: 'bar',
                data: { labels: labels, datasets: [{ label: 'Klikovi', data: counts, backgroundColor: 'rgba(0,191,165,0.8)' }] },
                options: { responsive: true, plugins:{legend:{display:false}} }
            };
            new Chart(document.getElementById('recommendChart'), recommendConfig);
            const sum = counts.reduce((s,n)=>s+n,0);
            document.getElementById('recommendSummary').textContent = `Ukupno preporuka / klikova: ${sum}. Generisano: ${data.generated||0}. Otvoreno pun konfigurator: ${data.open_full||0}.`;
        } else {
            document.getElementById('recommendSummary').textContent = 'Nema dostupnih podataka o preporukama.';
        }
    }catch(e){ console.warn('Failed to read recommendation analytics', e); }
});

document.addEventListener('DOMContentLoaded', function() {
    // Artikli iz konfiguratora za AI chat agenta
    window.configuratorArticles = [
        {
            name: 'Pametno Osvetljenje',
            keywords: ['osvetljenje', 'sijalica', 'svetlo', 'hue', 'rasveta', 'smart light'],
            description: 'Philips Hue komplet sa 3 sijalice',
            price: 129.99,
            link: 'configurator.html'
        },
        {
            name: 'Pametni Termostat',
            keywords: ['termostat', 'grejanje', 'hladjenje', 'temperatura', 'nest'],
            description: 'Nest Learning Thermostat',
            price: 249.99,
            link: 'configurator.html'
        },
        {
            name: 'Sigurnosna Kamera',
            keywords: ['kamera', 'video', 'nadzor', 'sigurnost', 'bezbednost', 'camera'],
            description: '1080p HD Wi-Fi kamera sa noćnim vidom',
            price: 179.99,
            link: 'configurator.html'
        },
        {
            name: 'Biometrijska Brava',
            keywords: ['brava', 'biometrija', 'otisak', 'prsta', 'pin', 'kartica', 'lock'],
            description: 'Otisak prsta + PIN + Kartica',
            price: 299.99,
            link: 'configurator.html'
        },
        {
            name: 'RFID Čitač',
            keywords: ['rfid', 'čitač', 'kartica', 'reader'],
            description: 'Profesionalni čitač kartica',
            price: 149.99,
            link: 'configurator.html'
        },
        {
            name: 'Kontroler Pristupa',
            keywords: ['kontroler', 'pristupa', 'vrata', 'controller'],
            description: 'Centralni kontroler za 4 vrata',
            price: 399.99,
            link: 'configurator.html'
        }
    ];
    // Initialize variables
    const systemButtons = document.querySelectorAll('.system-btn');
    const componentItems = document.querySelectorAll('.component-item');
    const selectedItems = document.querySelector('.selected-items');
    const subtotalAmount = document.querySelector('.subtotal .amount');
    const installationAmount = document.querySelector('.installation .amount');
    const totalAmount = document.querySelector('.total .amount');
    const requestQuoteBtn = document.querySelector('.request-quote-btn');

    // Installation fee calculation
    const INSTALLATION_PERCENTAGE = 0.15; // 15% of subtotal
    const MIN_INSTALLATION_FEE = 99.99;

    // System type switching
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            systemButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show/hide relevant components
            const selectedSystem = button.dataset.system;
            componentItems.forEach(item => {
                if (item.dataset.category === selectedSystem) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                    // Reset quantities when switching systems
                    item.querySelector('input').value = 0;
                }
            });

            updateSummary();
        });
    });

    // Quantity controls
    document.querySelectorAll('.component-controls').forEach(control => {
        const input = control.querySelector('input');
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');

        minusBtn.addEventListener('click', () => {
            if (parseInt(input.value) > 0) {
                input.value = parseInt(input.value) - 1;
                input.dispatchEvent(new Event('change'));
            }
        });

        plusBtn.addEventListener('click', () => {
            if (parseInt(input.value) < parseInt(input.max)) {
                input.value = parseInt(input.value) + 1;
                input.dispatchEvent(new Event('change'));
            }
        });

        input.addEventListener('change', () => {
            updateSummary();
        });
    });

    // Update summary function
    function updateSummary() {
        let subtotal = 0;
        selectedItems.innerHTML = '';

        componentItems.forEach(item => {
            const quantity = parseInt(item.querySelector('input').value);
            if (quantity > 0 && item.style.display !== 'none') {
                const name = item.querySelector('h4').textContent;
                const price = parseFloat(item.querySelector('.price').textContent.replace('€', ''));
                const itemTotal = price * quantity;
                subtotal += itemTotal;

                // Add item to summary
                const itemElement = document.createElement('div');
                itemElement.className = 'selected-item';
                itemElement.innerHTML = `
                    <span>${name} x${quantity}</span>
                    <span>€${itemTotal.toFixed(2)}</span>
                `;
                selectedItems.appendChild(itemElement);
            }
        });

        // Calculate installation fee (15% of subtotal or minimum €99.99)
        const installationFee = Math.max(subtotal * INSTALLATION_PERCENTAGE, MIN_INSTALLATION_FEE);
        
        // Update amounts
        subtotalAmount.textContent = `€${subtotal.toFixed(2)}`;
        installationAmount.textContent = `€${installationFee.toFixed(2)}`;
        totalAmount.textContent = `€${(subtotal + installationFee).toFixed(2)}`;

        // Update request quote button state
        requestQuoteBtn.disabled = subtotal === 0;
        if (subtotal === 0) {
            requestQuoteBtn.style.opacity = '0.5';
            requestQuoteBtn.style.cursor = 'not-allowed';
        } else {
            requestQuoteBtn.style.opacity = '1';
            requestQuoteBtn.style.cursor = 'pointer';
        }
    }

    // Handle quote request
    requestQuoteBtn.addEventListener('click', () => {
        let configurationDetails = 'Konfiguracija Sistema:\n\n';
        
        // Add selected items to configuration details
        componentItems.forEach(item => {
            const quantity = parseInt(item.querySelector('input').value);
            if (quantity > 0 && item.style.display !== 'none') {
                const name = item.querySelector('h4').textContent;
                const price = parseFloat(item.querySelector('.price').textContent.replace('€', ''));
                configurationDetails += `${name} x${quantity} - €${(price * quantity).toFixed(2)}\n`;
            }
        });

        // Add totals
        configurationDetails += `\nMeđuzbir: ${subtotalAmount.textContent}`;
        configurationDetails += `\nInstalacija: ${installationAmount.textContent}`;
        configurationDetails += `\nUkupno: ${totalAmount.textContent}`;

        // Create and populate form data
        const formData = new FormData();
        formData.append('configuration', configurationDetails);
        formData.append('total', totalAmount.textContent);

        // Redirect to contact form with configuration
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = 'index.html#contact';
        }

        // Store configuration in localStorage for contact form
        localStorage.setItem('configurationDetails', configurationDetails);
    });

    // Initial summary update
    updateSummary();
});
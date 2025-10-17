// Renders products from window.configuratorArticles into #productGrid
(function(){
    function formatPrice(p){
        return p && !isNaN(p) ? p.toFixed(2) + ' €' : '';
    }

    function createCard(article, idx){
        var card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (100 + (idx%5)*50).toString());

        var img = document.createElement('img');
        // try a reasonable filename based on slug, fallback to placeholder
        img.src = 'images/' + article.slug + '.jpg';
        img.alt = article.name;
        img.onerror = function(){
            this.onerror = null;
            this.src = 'images/placeholder-product.jpg';
        };

        var h3 = document.createElement('h3');
        h3.textContent = article.name;

        var p = document.createElement('p');
        p.textContent = article.description;

        var price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = formatPrice(article.price);

        var actions = document.createElement('div');
        actions.className = 'product-actions';

        var btnConfig = document.createElement('a');
        btnConfig.className = 'btn-config';
        btnConfig.href = 'configurator.html?preselect=' + encodeURIComponent(article.slug + ':1');
        btnConfig.textContent = 'Konfiguriši';

        actions.appendChild(btnConfig);

        card.appendChild(img);
        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(price);
        card.appendChild(actions);

        return card;
    }

    function render(){
        if(!window.configuratorArticles || !Array.isArray(window.configuratorArticles)) return;
        var grid = document.getElementById('productGrid');
        if(!grid) return;
        grid.innerHTML = '';
        window.configuratorArticles.forEach(function(a, i){
            var card = createCard(a, i);
            grid.appendChild(card);
        });
    }

    // Wait for DOMContentLoaded and then render. If products.js loads after, observe changes.
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', function(){ render(); });
    } else {
        render();
    }

    // If products.js is added later, watch for its availability
    if(!window.configuratorArticles){
        var observer = new MutationObserver(function(){
            if(window.configuratorArticles){ render(); observer.disconnect(); }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
})();


(function() {
    function artUrl(slug) {
        var s = String(slug || '').toLowerCase();
        return '/articles/' + s[0] + '/' + s.substring(0, Math.min(2, s.length)) + '/' + s + '.html';
    }

    document.getElementById('menuBtn')?.addEventListener('click', function() {
        document.getElementById('mainNav')?.classList.toggle('open');
    });

    var pool = null;
    function seededRandom(s) { var x = Math.sin(s) * 10000; return x - Math.floor(x); }
    function shuffleAndRender(forceSeed) {
        if (!pool || !pool.length) return;
        var seed = forceSeed || Math.floor(Date.now() / (12 * 60 * 60 * 1000));
        var shuffled = pool.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(seededRandom(seed + i) * (i + 1));
            var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
        }
        var item = shuffled[0];
        var card = document.getElementById('popularCard');
        if (card && item) {
            card.href = artUrl(item.slug);
            document.getElementById('popularTitle').textContent = item.title;
            document.getElementById('popularDesc').textContent = item.desc || 'Практичный материал для владельцев и покупателей Honda.';
        }
        var container = document.getElementById('popular-articles-container');
        if (container) {
            container.innerHTML = shuffled.slice(1, 11).map(function(a) {
                return '<a href="' + artUrl(a.slug) + '" class="hl-article-card"><b>' + a.title + '</b><span>' + (a.desc || a.cat || 'Материал Honda Library') + '</span></a>';
            }).join('');
        }
    }
    fetch('/static/js/popular_articles.json').then(function(r){ return r.json(); }).then(function(data){ pool = data || []; shuffleAndRender(); }).catch(function(){
        var container = document.getElementById('popular-articles-container');
        if (container) container.innerHTML = '<div class="hl-article-placeholder">Подборка материалов временно недоступна.</div>';
    });
    document.getElementById('refreshBtn')?.addEventListener('click', function() {
        shuffleAndRender(Date.now());
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => { this.style.transform = ''; }, 420);
    });

    var chunkCache = {}, activeIdx = -1;
    var input = document.getElementById('searchInput');
    var dd = document.getElementById('searchDropdown');
    if (!input || !dd) return;
    var TR = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
    function transliterate(t) { var r=''; for(var i=0;i<t.length;i++){ var c=t[i].toLowerCase(); r+=(TR[c]!==undefined)?TR[c]:c; } return r; }
    function getPrefix(q) {
        var lat = transliterate(q.trim()).replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');
        if(lat.match(/^(kak|gde)-./)) return lat.substring(0,5);
        var clean = lat.replace(/-/g,'');
        return clean.length >= 2 ? clean.substring(0,2) : clean;
    }
    function loadChunk(prefix, cb) {
        if(chunkCache[prefix]) return cb(chunkCache[prefix]);
        dd.innerHTML = '<div class="sd-empty">Загрузка...</div>'; dd.style.display='block';
        fetch('/static/js/search-chunks/' + prefix + '.json').then(function(r){ if(!r.ok){ cb([]); return null; } return r.json(); }).then(function(data){
            if(!data) return;
            chunkCache[prefix] = data.map(function(item){
                var title = (item.t || '').normalize('NFC');
                return {s:item.s, t:title, i:item.i || '📄', c:item.c || '', tl:title.toLowerCase(), sl:(item.s || '').toLowerCase()};
            });
            cb(chunkCache[prefix]);
        }).catch(function(){ cb([]); });
    }
    function doSearch() {
        var q = input.value.normalize('NFC').toLowerCase().trim();
        if(q.length < 2) { dd.style.display='none'; activeIdx=-1; return; }
        var prefix = getPrefix(q);
        if(!prefix || prefix.length < 2) { dd.innerHTML='<div class="sd-empty">Введите 2+ символа</div>'; dd.style.display='block'; return; }
        loadChunk(prefix, function(data){
            var words = q.split(/\s+/);
            var results = data.filter(function(item){ return words.every(function(w){ return item.tl.indexOf(w) !== -1 || item.sl.indexOf(w) !== -1; }); }).slice(0,8);
            dd.innerHTML = results.length ? results.map(function(item){
                var url = artUrl(item.s);
                return '<a href="' + url + '" class="sd-item"><div class="sd-icon">' + item.i + '</div><div class="sd-info"><div class="sd-title">' + item.t + '</div><div class="sd-slug">' + url + '</div></div></a>';
            }).join('') : '<div class="sd-empty">Ничего не найдено</div>';
            dd.style.display='block'; activeIdx=-1;
        });
    }
    function updateActive() { dd.querySelectorAll('.sd-item').forEach(function(el,i){ el.classList.toggle('sd-active', i === activeIdx); }); }
    input.addEventListener('input', doSearch);
    input.addEventListener('focus', function(){ if(input.value.trim().length >= 2) doSearch(); });
    input.addEventListener('keydown', function(e){
        var items = dd.querySelectorAll('.sd-item');
        if(e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); updateActive(); }
        else if(e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, -1); updateActive(); }
        else if(e.key === 'Enter') { e.preventDefault(); if(activeIdx >= 0 && items[activeIdx]) items[activeIdx].click(); else if(items.length) items[0].click(); }
        else if(e.key === 'Escape') { dd.style.display = 'none'; activeIdx = -1; }
    });
    document.addEventListener('click', function(e){ if(!e.target.closest('.hl-search')) { dd.style.display='none'; activeIdx=-1; } });
})();

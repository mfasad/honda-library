// Yandex.Metrika — counter 108740780
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}
)(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(108740780,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});


// VideoRoll — Под текстом статьи, перед похожими
(function(){
    var target = document.querySelector('.article-body');
    if (!target) return;

    // Ad container
    var wrap = document.createElement('div');
    wrap.style.cssText = 'margin:20px 0;text-align:center';
    wrap.innerHTML = '<div id="vid_vpaut_div" style="display:inline-block;width:600px;height:320px" vid_vpaut_pl="41931"></div>';
    target.parentNode.insertBefore(wrap, target.nextSibling);

    // External script
    var s = document.createElement('script');
    s.src = 'https://videoroll.net/js/vid_vpaut_script.js';
    s.async = true;
    document.body.appendChild(s);
})();


// ============================================================
//  HOTFIX: Fix search URL generation
//  Search results incorrectly include category slug in URL:
//    /voennaya-forma/kakie-berety.html
//  Correct format is hash_dirs:
//    /articles/k/ka/kakie-berety.html
//  This observer watches search dropdowns and fixes URLs.
// ============================================================
(function(){
    var dd = document.getElementById('globalSearchDropdown') || document.getElementById('searchDropdown');
    if (!dd) return;
    new MutationObserver(function(){
        var links = dd.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            if (a._urlFixed) continue;
            a._urlFixed = true;
            var href = a.getAttribute('href');
            if (!href) continue;
            if (href.indexOf('/articles/') !== -1) continue;
            var parts = href.split('/');
            var filename = parts[parts.length - 1];
            if (!filename.endsWith('.html')) continue;
            var slug = filename.replace('.html', '').toLowerCase();
            var c1 = slug[0] || '';
            var c2 = slug.substring(0, Math.min(2, slug.length));
            var newUrl = '/articles/' + c1 + '/' + c2 + '/' + filename;
            a.setAttribute('href', newUrl);
            var slugEl = a.querySelector('.sd-slug');
            if (slugEl) slugEl.textContent = newUrl;
        }
    }).observe(dd, {childList: true, subtree: true});
})();

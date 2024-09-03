document.addEventListener('readystatechange', function handler() {
    document.removeEventListener('readystatechange', handler);

    let goToBottomBtn = document.createElement('button');
    goToBottomBtn.id = 'goToBottomBtn';
    goToBottomBtn.classList.add('floating-btn');
    goToBottomBtn.style.bottom = 0;
    goToBottomBtn.style.right = 0;
    goToBottomBtn.onclick = () => window.scrollTo(0, document.body.offsetHeight - 200);
    goToBottomBtn.innerText = '▼';
    document.body.prepend(goToBottomBtn);

    let backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.classList.add('floating-btn');
    backToTopBtn.style.bottom = 5 + goToBottomBtn.offsetHeight + 'px';
    backToTopBtn.style.right = 0;
    backToTopBtn.onclick = () => window.scrollTo(0, 0);
    backToTopBtn.innerText = '▲';   
    document.body.prepend(backToTopBtn);
})
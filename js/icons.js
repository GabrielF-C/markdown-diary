document.addEventListener('readystatechange', function handler() {
    document.removeEventListener('readystatechange', handler);

    let elems = document.querySelectorAll('area');
    console.log(elems);

    for (let e of elems) {
        let elemIsReplaced = false;
        if (e.attributes.length) {
            let firstAttr = e.attributes.item(0);
            let iconElem = getIconElem(firstAttr.name);
            if (iconElem) {
                e.replaceWith(iconElem);
                elemIsReplaced = true;
            }
        }
        if (!elemIsReplaced) {
            e.remove();
        }
    }

    function getIconElem(iconName) {
        let iconElem = null;
        switch (iconName) {
            case 'err':
                iconElem = createIconElem('span', '!', 'error');
                break;
            case 'warn':
                iconElem = createIconElem('span', '⚠', 'warn');
                break;
            case 'info':
                iconElem = createIconElem('span', 'i', 'info');
                break;
        }
        return iconElem;
    }

    function createIconElem(baseElemName, text, iconClass) {
        let iconElem = document.createElement(baseElemName);
        iconElem.innerText = text;
        iconElem.classList.add(iconClass, 'icon', 'plr-5');
        return iconElem;
    }
})
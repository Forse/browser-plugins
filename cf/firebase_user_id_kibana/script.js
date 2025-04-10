function waitForElement(timeout = 30000, interval = 100) {
    return new Promise((resolve, reject) => {

        const idLabel = Array.from(document.querySelectorAll('div.data-line-item > label'))
            .find(el => el.textContent.includes('ID:'));

        if (idLabel) {
            return resolve(idLabel);
        }

        // Set a timeout to stop waiting after a certain time
        const timeoutId = setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error(`Timed out waiting for element`));
        }, timeout);

        // Check at intervals for the element
        const checkInterval = setInterval(() => {
            const idLabel = Array.from(document.querySelectorAll('div.data-line-item > label'))
                .find(el => el.textContent.includes('ID:'));
            if (idLabel) {
                clearTimeout(timeoutId);
                clearInterval(checkInterval);
                resolve(idLabel);
            }
        }, interval);
    });
}

const observer = new MutationObserver(() => {
    waitForElement()
        .then(idLabel => {
            const button = document.createElement('button');

            button.id = "kibana_button"
            button.textContent = "Open in Kibana";
            button.style.marginLeft = '8px';
            button.style.cursor = 'pointer';

            button.onclick = function () {
                const idValue = idLabel.nextSibling.textContent

                window.open(
                    `http://10.0.10.70:5601/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-3d,to:now))&_a=(columns:!(RequestPath,request.user,response.status),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:b39f59d0-fe38-11ea-a9fd-dfd757f05def,key:event.action,negate:!f,params:(query:ApiRequest),type:phrase),query:(match_phrase:(event.action:ApiRequest))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:b39f59d0-fe38-11ea-a9fd-dfd757f05def,key:request.headers.x-deviceid,negate:!f,params:(query:'${idValue}'),type:phrase),query:(match_phrase:(request.headers.x-deviceid:'${idValue}')))),index:b39f59d0-fe38-11ea-a9fd-dfd757f05def,interval:auto,query:(language:kuery,query:''),sort:!(!(Timestamp,desc)))`
                )
            }

            if (document.getElementById("kibana_button")) {
                return
            } else {
                idLabel.parentElement.appendChild(button)
            }
        })
})

observer.observe(document.body, { childList: true, subtree: true });
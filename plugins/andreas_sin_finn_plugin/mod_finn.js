


setInterval(() => {
    hideChaff();
    hideBannedAds();
    AddBanButtonToAds();
}, 5000); 

function AddBanButtonToAds(){
    try{
        console.log("adding ban buttons to ads...");
        let ads = document.querySelectorAll('.sf-search-ad-link');
        for(adlink of ads){
            const linkContainer = adlink.closest('.sf-search-ad');
            if(!linkContainer){
                console.log("no link container for adlink "+adlink.id);
                continue;
            }
            if(linkContainer.querySelector('.ban-button')){
                continue; // Skip if the button already exists
            }

            let id = adlink.id;
            let button = document.createElement('button');
            button.innerText = '💣';
            button.classList.add('ban-button');
            button.classList.add('absolute');
            button.style.zIndex = '9999';
            button.style.bottom = '0px';
            button.style.right = '0px';
            button.style.cursor = 'crosshair';
            //button.style.position = 'absolute';
            button.onclick = function(event)
            {
                banAd(id)
                linkContainer.setAttribute('style','display:none')
                event.stopPropagation(); // Prevent the click from propagating to the ad
            };
            linkContainer.appendChild(button);

        }
    }
    catch(e){
        console.log("error adding ban buttons: "+e);
    }
}


function banAd(id){
    try{
        console.log("banning ad "+id);
        let bannedIds = JSON.parse(localStorage.getItem('bannedAds') || '[]');
        if(!bannedIds.includes(id)){
            bannedIds.push(id);
            localStorage.setItem('bannedAds', JSON.stringify(bannedIds));
        }
    }
    catch(e){
        console.log("error banning ad: "+e);
    }
}

function hideBannedAds(){
    try{
        console.log("removing banned ads...");

        let bannedIds = JSON.parse(localStorage.getItem('bannedAds') || '[]');
        for(index in bannedIds){
            let adLink = document.getElementById(bannedIds[index]);
            if(!adLink){
                continue;
            }
            const linkContainer = adLink.closest('.sf-search-ad');
            if(!linkContainer){
                continue;
            }
            if(linkContainer){
                linkContainer.setAttribute('style','display:none')
            }
        }
    }
    catch(e){
        console.log("error removing ads: "+e);
    }
}

function hideChaff(){
    try{
        console.log("removing chaff...");
        // $('.sf-search-ad').css('visibility','hidden');
        $('search-in-context-podlet-isolated').css('display','none');
        $('iframe').css('display','none');
        $('advt-component').css('display','none');
    
        let badged = $('.badge--info');
        badged.each(function(index){
            console.log("removing "+badged[index].html());
            badged[index].parentElement.setAttribute('style','display:none')
        });     
    }
    catch(e){
        console.log("error removing chaff: "+e);
    }
}

hideChaff();
hideBannedAds();




setInterval(() => {
    try{
        console.log("removing ads...");
        $('.sf-search-ad').remove();
        $('search-in-context-podlet-isolated').remove();
    
    
        let badged = $('.s-bg-info-subtle-active');
        badged.each(function(index){
            console.log("removing "+badged[index].html());
            badged[index].parentNode.remove();
        });     
    }
    catch(e){
        console.log("error removing ads: "+e);
    }
}, 500); 
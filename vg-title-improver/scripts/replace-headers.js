setTimeout(() => {
    console.log("FRO start 3");
    replaceHeaders();
    
}, 1000);

function replaceHeaders() {
    console.log("Frode 3");
    var counter = 0
    $("h2").each((index, element) => {
        try {
            const anchor = element.closest("a")
            const articleUrl = anchor.href
            const articleIdMatch = articleUrl.match(/\/i\/([a-zA-Z0-9]+)/);
            if (articleIdMatch != null && articleIdMatch.length > 0) {
                const articleId= articleIdMatch[1]
            }
            // console.log("FRO AricleId: " + articleId)
            
            counter ++
            //if (counter >= 10) return
            // replaceFromArticle(element, articleUrl)
            const aria = element.ariaLabel
            replaceWith(element, aria)
            injectFetchDetailsLink(anchor, element, articleUrl)
        }
        catch(ex) {
            // console.log("FRO : exc" + ex)
        }
    });
}

function replaceWith(headerElement, newText) {
    const originalHeader = headerElement.innerText
    headerElement.innerHTML = "<span>" + 
        "<span style='display:block;font-size:4rem'>" + 
        newText.replace("\n", " ").replace("<br>", " ") + 
        "</span>" + 
        "<span style='display:block;font-size:1rem;font-weight:300;margin-top:6px'>Originalt: " + originalHeader + "</span>" + 
        "</span>";
}

function injectFetchDetailsLink(anchor, headerElement, articleUrl) {
    const span = document.createElement("span")
    span.textContent = "BYTT"
    span.onclick = () => { 
        console.log("FRO hei du")
        replaceFromArticle(headerElement, articleUrl)
    }
    anchor.parentNode.insertBefore(span, anchor.nextSibling)
}

function replaceFromArticle(headerElement, url) {
    fetch(url)
        .then(response => response.text())
        .then(htmlString => {
            const parsed = $('<div>').html(htmlString);

            // Now you can use jQuery to search inside it
            const headline = parsed.find("h1").text().replace("\n", " ").replace("<br>", " "); // Just an example

            console.log("FRO\n" + 
                "Original headline: " + headerElement.innerText.replace("\n", "") + "\n" + 
                "Arialabel headline: " + headerElement.ariaLabel.replace("\n", "") + "\n" + 
                "Detailed headline: " + headline
            );
            replaceWith(headerElement, headline)
        })
        .catch(err => {
            console.error("Error loading URL:", err);
        });

}
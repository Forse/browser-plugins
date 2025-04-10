$(document).ready(function() {
    removeTrumpContent()
})

function removeTrumpContent() {
    let trumpSearch = ["Trump", "Elon", "Musk", "MAGA", "Tesla", "Vance", "Rubio", "Hegseth", "Bondi", "Robert F. Kennedy Jr."]
    const searchTermsLower = trumpSearch.map(term => term.toLowerCase());

    let $potentialElements = $('p, span, div, li, td, th, a');


    var $matchingElements = $potentialElements.filter(function() {    
        var elementTextLower = $(this).text().toLowerCase();

        var foundMatch = searchTermsLower.some(function(searchTermLower) {
            return elementTextLower.indexOf(searchTermLower) !== -1;
        });

        // Return true for the filter if any search term was found in this element
        return foundMatch;
    });

// --- Second Filter (Refinement): Keep only the most specific elements ---
    // This removes containers if a child element already matched
    $matchingElements = $matchingElements.filter(function() {
        var $this = $(this);
        // Check if any *direct children* also match the criteria
        var childHasMatch = $this.children().filter(function() {
             // Get the child's text, lowercased
             var childTextLower = $(this).text().toLowerCase();
             // Check if this child's text contains any search term
             return searchTermsLower.some(function(searchTermLower) {
                 return childTextLower.indexOf(searchTermLower) !== -1;
             });
           }).length > 0; // Returns true if any child element matched

        // Keep the current element ($this) in the $matchingElements collection
        // ONLY IF none of its direct children caused a match.
        return !childHasMatch;
    });

    if ($matchingElements.length > 0) {
        console.log("Removing " + $matchingElements.length + " elements containing specified terms.");
        $matchingElements.remove();
    } else {
        console.log("No elements found containing specified terms.");
    }


}
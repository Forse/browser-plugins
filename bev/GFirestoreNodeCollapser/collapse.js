
// Create a button element
const collapseButton = document.createElement('button');
collapseButton.id = 'collapseButton';
collapseButton.textContent = 'Collapse All Nodes';

// Style the button if needed
collapseButton.style.padding = '6px 12px'; // Matches typical button padding
collapseButton.style.marginLeft = '10px'; // Space it from the project switcher
collapseButton.style.backgroundColor = '#f1f3f4'; // Light gray background
collapseButton.style.border = '1px solid #dadce0'; // Subtle border
collapseButton.style.borderRadius = '4px'; // Rounded corners
collapseButton.style.color = '#202124'; // Dark text for contrast
collapseButton.style.fontFamily = 'Google Sans, Roboto, Arial, sans-serif'; // Match typography
collapseButton.style.fontSize = '14px'; // Standard size
collapseButton.style.cursor = 'pointer';
collapseButton.style.display = 'inline-flex'; // Aligns better with inline elements
collapseButton.style.alignItems = 'center'; // Vertically centers text

// Function to collapse nodes recursively
function collapseAllNodes() {
    // Get all expand buttons with aria-expanded="true"
    const expandButtons = document.querySelectorAll('.cfc-tree-node-expander[aria-expanded="true"]');

    // Reverse the NodeList to change the order of buttons
    const expandButtonsReverse = Array.from(expandButtons).reverse();

    // Check if there are expanded nodes to collapse
    if (expandButtonsReverse.length > 0) {
        expandButtonsReverse.reverse().forEach(button => {
            button.click(); // Collapse the node
        });

        // Keep collapsing nodes until no more expanded nodes are found
        setTimeout(collapseAllNodes, 200); // You can adjust the delay (in milliseconds) between collapses if needed
    }
}

collapseButton.addEventListener('click', collapseAllNodes);

function tryInsertButton() {
    const projectSwitcher = document
        .querySelector('pcc-platform-bar-purview-switcher.pcc-purview-switcher-container')
        .parentNode
        .parentNode;

    if (projectSwitcher && !document.getElementById('collapseButton')) {
        projectSwitcher.insertAdjacentElement('afterend', collapseButton);
        observer.disconnect(); // Stop observing once inserted
    }
}

// Set up MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
    tryInsertButton();
});

// Start observing the document body for added nodes
observer.observe(document.body, { childList: true, subtree: true });

// Try immediately in case it’s already loaded
tryInsertButton();

// Create a button element
const collapseButton = document.createElement('button');
collapseButton.id = 'collapseButton';
collapseButton.textContent = 'Collapse All Nodes';

// Style the button if needed
collapseButton.style.padding = '8px';
collapseButton.style.marginBottom = '20px';

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

const body = document.body;
if (body) {
    body.insertBefore(collapseButton, body.firstChild);
} else {
    console.error('Body element not found.');
}

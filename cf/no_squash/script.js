function isMainToDevelop(url) {
    // Create a URL object to parse the URL
    const urlObj = new URL(url);

    // Get the query parameters
    const params = new URLSearchParams(urlObj.search);

    // Extract source and target branches
    const sourceBranch = params.get('merge_request[source_branch]');
    const targetBranch = params.get('merge_request[target_branch]');

    // Check if source branch is 'main' and target branch is 'develop'
    return sourceBranch === 'main' && targetBranch === 'develop';
}

function isAnyToMain(url) {
    // Create a URL object to parse the URL
    const urlObj = new URL(url);

    // Get the query parameters
    const params = new URLSearchParams(urlObj.search);

    // Extract target branches
    const targetBranch = params.get('merge_request[target_branch]');

    // Check if target branch is 'develop'
    return targetBranch === 'main';
}

// Function to check if source branch or target branch is "main" on an existing MR
function checkBranchNames() {
    // Get all ref-container elements
    const refContainers = document.querySelectorAll('.ref-container');

    // Initialize variables to store the branches
    let sourceBranch = null;
    let targetBranch = null;

    // Find the description container
    const descriptionContainer = document.querySelector('.detail-page-description');

    if (!descriptionContainer) {
        console.error('Could not find the description container');
        return { isSourceMain: false, isTargetMain: false };
    }

    // Get the HTML content of the description container
    const descriptionHTML = descriptionContainer.innerHTML;

    // Find the source branch (after "requested to merge")
    const requestedToMergeIndex = descriptionHTML.indexOf('requested to merge');
    if (requestedToMergeIndex !== -1) {
        // Find the first ref-container after "requested to merge"
        const sourceRefStart = descriptionHTML.indexOf('ref-container', requestedToMergeIndex);
        if (sourceRefStart !== -1) {
            // Find the element that matches this position
            for (const container of refContainers) {
                // Check if this container appears in the right position in the HTML
                if (descriptionHTML.indexOf(container.outerHTML) > requestedToMergeIndex && !sourceBranch) {
                    sourceBranch = container.textContent.trim();
                    break;
                }
            }
        }
    }

    // Find the target branch (after "into")
    const intoIndex = descriptionHTML.indexOf('into');
    if (intoIndex !== -1) {
        // Find the first ref-container after "into"
        const targetRefStart = descriptionHTML.indexOf('ref-container', intoIndex);
        if (targetRefStart !== -1) {
            // Find the element that matches this position
            for (const container of refContainers) {
                // Check if this container appears in the right position in the HTML
                if (descriptionHTML.indexOf(container.outerHTML) > intoIndex && !targetBranch) {
                    targetBranch = container.textContent.trim();
                    break;
                }
            }
        }
    }

    // Check if either branch is "main"
    const isSourceMain = sourceBranch === 'main';
    const isTargetMain = targetBranch === 'main';

    console.log('Source branch:', sourceBranch, 'Is main?', isSourceMain);
    console.log('Target branch:', targetBranch, 'Is main?', isTargetMain);

    return {
        sourceBranch,
        targetBranch,
        isSourceMain,
        isTargetMain
    };
}

function disableSquashCheckboxUIForNewMR() {
    // First, find the checkbox by its ID
    const squashCheckbox = document.getElementById('merge_request_squash');

    if (!squashCheckbox) {
        console.error('Could not find the checkbox with ID: merge_request_squash');
        return;
    }
    // Navigate up through the DOM to find the main container
    // Based on the HTML provided, we need to go up to the 'form-group row' div
    // Which is 4 levels up from the checkbox

    // Get the parent element (custom-control-input)
    const customControlDiv = squashCheckbox.parentElement;

    if (!customControlDiv) {
        console.error('Could not find the parent element');
        return;
    }

    // Get the form-check container (grandparent)
    const formCheckDiv = customControlDiv.parentElement;

    if (!formCheckDiv) {
        console.error('Could not find the grandparent element');
        return;
    }

    // Get the col-12 container (great-grandparent)
    const colDiv = formCheckDiv.parentElement;

    if (!colDiv) {
        console.error('Could not find the great-grandparent element');
        return;
    }

    // Add some visual indication that it's disabled (optional)
    colDiv.style.opacity = '0.6';
    colDiv.style.border = '2px solid red';
    colDiv.style.borderRadius = '4px';
    colDiv.style.padding = '3px';

    const messageElement = document.createElement('p');
    messageElement.textContent = "🛑 This has been disabled by the extension. Merge requests with source_branch=main or target_branch=main should not be squashed 🛑"
    colDiv.parentElement.appendChild(messageElement)
}

// Function to uncheck the merge request squash checkbox
function uncheckSquashCheckboxForNewMR() {
    // Get the checkbox element by its ID
    const squashCheckbox = document.getElementById('merge_request_squash');

    // Check if the element exists
    if (squashCheckbox) {
        // Uncheck the checkbox
        squashCheckbox.checked = false;


        // Disable the checkbox
        squashCheckbox.disabled = true;

        // Optional: Trigger any event listeners that might be listening for changes
        // This can be important if there are other scripts that react to this checkbox
        const event = new Event('change', { bubbles: true });
        squashCheckbox.dispatchEvent(event);

        console.log('Squash checkbox has been unchecked');
        window.alert('Squash checkbox has been unchecked')
    } else {
        console.error('Could not find the checkbox with ID: merge_request_squash');
    }
}

// Function to uncheck the merge request squash checkbox
async function uncheckSquashCheckboxForExistingMR() {
    console.log('Waiting for squash information to load...');

    // Wait for the squash stuff to appear in the UI

    await waitForElement("input[name='squash']");

    // Get the checkbox element by its ID
    const squashCheckboxes = document.getElementsByName('squash');
    const squashCheckbox = squashCheckboxes[0];

    // Check if the element exists
    if (squashCheckbox) {
        // Uncheck the checkbox
        squashCheckbox.checked = false;


        // Disable the checkbox
        squashCheckbox.disabled = true;

        // Optional: Trigger any event listeners that might be listening for changes
        // This can be important if there are other scripts that react to this checkbox
        const event = new Event('change', { bubbles: true });
        squashCheckbox.dispatchEvent(event);

        console.log('Squash checkbox has been unchecked');
        window.alert('Squash checkbox has been unchecked');
    } else {
        console.error('Could not find the checkbox with [data-testid="squash-checkbox"]');
    }

}

async function disableSquashCheckboxUIForExistingMR() {

    await waitForElement("input[name='squash']");

    // First, find the checkbox by its ID
    const squashCheckboxes = document.getElementsByName('squash');
    const squashCheckbox = squashCheckboxes[0]

    if (!squashCheckbox) {
        console.error('Could not find the checkbox with ID: [data-testid="squash-checkbox"]');
        return;
    }

    // Get the parent element (custom-control-input)
    const customControlDiv = squashCheckbox.parentElement;

    if (!customControlDiv) {
        console.error('Could not find the parent element');
        return;
    }

    // Get the form-check container (grandparent)
    const formCheckDiv = customControlDiv.parentElement;

    if (!formCheckDiv) {
        console.error('Could not find the grandparent element');
        return;
    }

    // Add some visual indication that it's disabled (optional)
    formCheckDiv.style.opacity = '0.6';
    formCheckDiv.style.border = '2px solid red';
    formCheckDiv.style.borderRadius = '4px';
    formCheckDiv.style.padding = '3px';

    // Create a new list item
    const newListItem = document.createElement('li');

    // Add text with warning styling
    newListItem.innerHTML = `<span style="color: red;">🛑 Squashing has been disabled for this MR as it is from main or to main 🛑</span>`;

    // Add some styling to make it stand out
    newListItem.style.marginTop = '5px';
    newListItem.style.marginBottom = '5px';

    // Add a border and background for emphasis
    newListItem.style.padding = '5px';
    newListItem.style.border = '2px solid red';
    newListItem.style.borderRadius = '4px';

    const mergeDetailsList = document.querySelector('.mr-widget-merge-details')
    // Add to the list
    mergeDetailsList.appendChild(newListItem);
}

function waitForElement(selector, timeout = 30000, interval = 100) {
    return new Promise((resolve, reject) => {
        // Check if element already exists
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        // Set a timeout to stop waiting after a certain time
        const timeoutId = setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error(`Timed out waiting for element: ${selector}`));
        }, timeout);

        // Check at intervals for the element
        const checkInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearTimeout(timeoutId);
                clearInterval(checkInterval);
                resolve(element);
            }
        }, interval);
    });
}


const url = window.location.href
const branchInfo = checkBranchNames();

// New MR
if (isMainToDevelop(url) || isAnyToMain(url)) {
    if (isAnyToMain(url)) {
        console.log("We are merging into main - should not squash commits!")
    }

    if (isMainToDevelop(url)) {
        console.log("We are merging from main into develop - should not squash commits!")
    }

    uncheckSquashCheckboxForNewMR()
    disableSquashCheckboxUIForNewMR()
}

// Existing MR. Ensure squash is disabled...
if (branchInfo.isSourceMain || branchInfo.isTargetMain) {
    if (branchInfo.isSourceMain) {
        console.log("Merging from main - should not squash commits!")
    }

    if (branchInfo.isTargetMain) {
        console.log("Merging to main - should not squash commits!")
    }

    uncheckSquashCheckboxForExistingMR()
    disableSquashCheckboxUIForExistingMR()
}
const urlPatternInput = document.getElementById('urlPattern');
const groupNameInput = document.getElementById('groupName');
const saveButton = document.getElementById('saveButton');
const existingGroupsDatalist = document.getElementById('existingGroups');
const rulesListDiv = document.getElementById('rulesList');

// --- Functions ---

// Load existing rules from storage and display them
async function loadAndDisplayRules() {
    const result = await chrome.storage.sync.get(['groupRules']);
    const rules = result.groupRules || [];
    rulesListDiv.innerHTML = '<h4>Current Rules</h4>'; // Clear previous list

    if (rules.length === 0) {
        rulesListDiv.innerHTML += '<p>No rules defined yet.</p>';
        return;
    }

    rules.forEach((rule, index) => {
        const ruleElement = document.createElement('div');
        ruleElement.className = 'rule-item';
        ruleElement.innerHTML = `
            <span><strong>Pattern:</strong> ${escapeHTML(rule.pattern)}<br>
                  <strong>Group:</strong> ${escapeHTML(rule.groupName)}</span>
            <button class="delete-button" data-index="${index}">Delete</button>
        `;
        rulesListDiv.appendChild(ruleElement);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDeleteRule);
    });
}

// Populate the datalist with existing Chrome tab group names
async function populateGroupNames() {
    try {
        const groups = await chrome.tabGroups.query({});
        existingGroupsDatalist.innerHTML = ''; // Clear previous options
        const uniqueNames = new Set(groups.map(group => group.title).filter(title => title)); // Get unique, non-empty titles
        uniqueNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            existingGroupsDatalist.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching tab groups:", error);
        // Handle error - perhaps show a message to the user
    }
}

// Handle saving a new rule
async function handleSaveRule() {
    const pattern = urlPatternInput.value.trim();
    const groupName = groupNameInput.value.trim();

    if (!pattern || !groupName) {
        alert('Please enter both a URL pattern and a group name.');
        return;
    }

    // Validate Regex (basic check)
    try {
        new RegExp(pattern);
    } catch (e) {
        alert('Invalid Regular Expression pattern.');
        return;
    }


    const result = await chrome.storage.sync.get(['groupRules']);
    const rules = result.groupRules || [];

    // Prevent duplicate rules (same pattern and group name)
     if (rules.some(rule => rule.pattern === pattern && rule.groupName === groupName)) {
        alert('This rule already exists.');
        return;
    }

    rules.push({ pattern: pattern, groupName: groupName });

    await chrome.storage.sync.set({ groupRules: rules });
    alert('Rule saved successfully!');
    urlPatternInput.value = ''; // Clear inputs
    groupNameInput.value = '';
    await loadAndDisplayRules(); // Refresh the displayed list
    await populateGroupNames(); // Refresh datalist in case a new group name was used
}

// Handle deleting a rule
async function handleDeleteRule(event) {
    const indexToDelete = parseInt(event.target.getAttribute('data-index'), 10);
    const result = await chrome.storage.sync.get(['groupRules']);
    let rules = result.groupRules || [];

    if (indexToDelete >= 0 && indexToDelete < rules.length) {
        rules.splice(indexToDelete, 1); // Remove the rule at the specified index
        await chrome.storage.sync.set({ groupRules: rules });
        alert('Rule deleted.');
        await loadAndDisplayRules(); // Refresh the list
    }
}

// Utility to escape HTML to prevent XSS if displaying user input directly
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


// --- Initialization ---

// Add event listener for the save button
saveButton.addEventListener('click', handleSaveRule);

// Load rules and populate group names when the popup opens
document.addEventListener('DOMContentLoaded', () => {
     loadAndDisplayRules();
     populateGroupNames();
});
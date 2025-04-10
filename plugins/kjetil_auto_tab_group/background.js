chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Check if the tab loading is complete and it has a URL
    if (changeInfo.status === 'complete' && tab.url) {
      try {
        const result = await chrome.storage.sync.get(['groupRules']);
        const rules = result.groupRules || [];
  
        // Find the *first* matching rule
        const matchingRule = rules.find(rule => {
          try {
            // Important: Escape special characters if not intended as regex,
            // or ensure users know they NEED to enter valid regex.
            // Here, we assume the user enters valid regex patterns.
            const regex = new RegExp(rule.pattern);
            return regex.test(tab.url);
          } catch (e) {
            console.warn(`Invalid regex pattern in rule: "${rule.pattern}". Skipping rule.`);
            return false; // Skip invalid patterns
          }
        });
  
        if (matchingRule) {
          // A rule matched! Now find or create the group.
          const targetGroupName = matchingRule.groupName;
  
          // Query existing groups to find one with the target name
          const existingGroups = await chrome.tabGroups.query({ title: targetGroupName });
  
          let targetGroupId = null;
  
          if (existingGroups.length > 0) {
            // Group already exists, use the first one found
            targetGroupId = existingGroups[0].id;
          } else {
            // Group doesn't exist, create it first with the tab
            const newGroup = await chrome.tabs.group({ tabIds: [tabId] });
            targetGroupId = newGroup; // The ID of the newly created group
  
            // Now update the newly created group to set its title and color (optional)
            await chrome.tabGroups.update(targetGroupId, { title: targetGroupName });
            console.log(`Created new group "${targetGroupName}" for tab ${tabId}`);
          }
  
          // Add the tab to the target group (either existing or newly created)
          // Make sure the tab is not already in the correct group to avoid errors
          if (tab.groupId !== targetGroupId) {
             await chrome.tabs.group({ tabIds: [tabId], groupId: targetGroupId });
             console.log(`Added tab ${tabId} (${tab.url}) to group "${targetGroupName}" (ID: ${targetGroupId})`);
          }
  
        }
      } catch (error) {
        console.error("Error processing tab update:", error);
      }
    }
  });
  
  // Optional: Log when the extension starts
  console.log("Auto Tab Grouper Pro background script started.");
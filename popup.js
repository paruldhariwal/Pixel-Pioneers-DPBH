document.addEventListener('DOMContentLoaded', function () {
    // Fetch the detected category from the content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getDetectedCategory' }, function(response) {
        const warningBox = document.getElementById('warningBox');
    
        if (response && response.category) {
          // Display the detected category in the warning box
          warningBox.textContent = `Detected Dark Pattern: ${response.category}`;
          // Add additional styling or actions as needed
        } else {
          // Handle the case where no category is detected
          warningBox.textContent = 'No dark pattern detected.';
        }
      });
    });
  });
  
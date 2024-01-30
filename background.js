// Function to load the category model
async function loadCategoryModel() {
    const categoryModel = await load('models/determine_category_bert_model.joblib');
    const categoryVect = await load('models/determine_category_label_encoder.joblib');
    return { model: categoryModel, vect: categoryVect };
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === 'detectDarkPatternPresence') {
        try {
            // Load the category model asynchronously
            const categoryModel = await loadCategoryModel();

            // Determine the category of the dark pattern
            determineDarkPatternCategory(request.content, categoryModel);

            // Send an acknowledgment response (optional)
            sendResponse({ success: true });
        } catch (error) {
            // Handle errors
            console.error('Error in detectDarkPatternPresence:', error);
            sendResponse({ success: false, error: error.message });
        }
    } else if (request.action === 'darkPatternCategoryDetected') {
        // Send the detected category to the popup
        chrome.runtime.sendMessage({ action: 'setDetectedCategory', category: request.category });

        // Send a response back to the content script (optional)
        sendResponse({ success: true });
    }

    // Important: Return true to indicate that the response will be sent asynchronously
    return true;
});

// Function to determine the category of the dark pattern
function determineDarkPatternCategory(content, categoryModel) {
    // Perform category prediction
    const categoryResult = categoryModel.model.predict(categoryModel.vect.transform([content]));

    // Send the detected category back to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'darkPatternCategoryDetected', category: categoryResult[0] });
    });
}

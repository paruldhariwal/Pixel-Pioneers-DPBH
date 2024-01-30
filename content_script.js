// Function to load a file using fetch
async function load(fileUrl) {
    const response = await fetch(fileUrl);
    const data = await response.text(); // Use text() instead of json()
    return data;
}

// Function to load the presence model
async function loadPresenceModel() {
    console.log('Loading presence model...');
    const presenceModel = await load('models/determine_presence_model.joblib');
    const presenceVect = await load('models/determine_presence_label_encoder.joblib');
    console.log('Presence model loaded successfully.');
    return { model: presenceModel, vect: presenceVect };
}

// Function to load the category model
async function loadCategoryModel() {
    console.log('Loading category model...');
    const categoryModel = await load('models/determine_category_bert_model.joblib');
    const categoryVect = await load('models/determine_category_label_encoder.joblib');
    console.log('Category model loaded successfully.');
    return { model: categoryModel, vect: categoryVect };
}

// Function to detect presence of dark patterns
async function detectDarkPatternPresence() {
    console.log('Content script is running.');
    const pageContent = document.body.innerText;
    console.log('Page content:', pageContent);

    try {
        // Load the presence model
        const { model, vect } = await loadPresenceModel();

        console.log('Vect object:', vect);

        // Perform presence prediction
        const result = model.predict(vect.transform([pageContent]));

        // If presence of dark pattern is detected, determine the category
        if (result[0] === 'Dark') {
            const categoryModel = await loadCategoryModel();
            detectDarkPatternCategory(pageContent, categoryModel);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to determine the category of the dark pattern
function detectDarkPatternCategory(content, categoryModel) {
    // Perform category prediction
    const categoryResult = categoryModel.model.predict(categoryModel.vect.transform([content]));

    // Send the detected category back to the background script
    chrome.runtime.sendMessage({ action: 'darkPatternCategoryDetected', category: categoryResult[0] });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'highlightDarkPattern') {
        highlightDarkPattern(request.category);
    }
});

// Run the detection on page load
detectDarkPatternPresence();

// Function to highlight the detected dark pattern
function highlightDarkPattern(category) {
    // Create a red box around the detected dark pattern
    const warningDiv = document.createElement('div');
    warningDiv.style.border = '2px solid red';
    warningDiv.style.position = 'absolute';
    warningDiv.style.top = '0';
    warningDiv.style.left = '0';
    warningDiv.style.width = '100%';
    warningDiv.style.height = '100%';
    document.body.appendChild(warningDiv);

    // Display the category name in a small text
    const categoryText = document.createElement('p');
    categoryText.textContent = `Detected Dark Pattern: ${category}`;
    categoryText.style.color = 'white';
    categoryText.style.backgroundColor = 'red';
    categoryText.style.position = 'absolute';
    categoryText.style.top = '10px';
    categoryText.style.left = '10px';
    categoryText.style.padding = '5px';
    document.body.appendChild(categoryText);
}

const fs = require('fs');
const path = require('path');

// The file uploaded by the user
const src = "C:/Users/VIVA/.gemini/antigravity/brain/c463bd7f-6a7d-4c5d-9a96-971425dc393f/uploaded_image_1767001357197.png";
const destDir = "c:/Users/VIVA/mern_final_project/frontend/public/img";
const dest = path.join(destDir, "logo.png");

try {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log("SUCCESS: User Logo installed to", dest);
} catch (err) {
    console.error("ERROR copying file:", err);
}

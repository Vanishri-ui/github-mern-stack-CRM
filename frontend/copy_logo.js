const fs = require('fs');
const path = require('path');

const src = "C:/Users/VIVA/.gemini/antigravity/brain/c463bd7f-6a7d-4c5d-9a96-971425dc393f/viva_text_logo_red_1767001042158.png";
const destDir = "c:/Users/VIVA/mern_final_project/frontend/public/img";
const dest = path.join(destDir, "logo.png");

try {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log("SUCCESS: Logo copied to", dest);
} catch (err) {
    console.error("ERROR copying file:", err);
}

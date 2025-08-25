const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up AI Analysis Server...\n");

// Check if .env file exists
const envPath = path.join(__dirname, "server", ".env");
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env file...");

  const envContent = `GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created in server directory");
  console.log("⚠️  Please edit server/.env and add your actual Gemini API key");
} else {
  console.log("✅ .env file already exists");
}

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, "server", "uploads");
if (!fs.existsSync(uploadsPath)) {
  console.log("📁 Creating uploads directory...");
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("✅ uploads directory created");
} else {
  console.log("✅ uploads directory already exists");
}

console.log("\n📋 Next steps:");
console.log(
  "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
);
console.log(
  '2. Edit server/.env and replace "your_gemini_api_key_here" with your actual key'
);
console.log("3. Run: cd server && bun install");
console.log("4. Run: cd server && bun start");
console.log("5. In another terminal, run: bun run dev (for frontend)");
console.log("\n🎯 Test the server: http://localhost:5000/api/health");

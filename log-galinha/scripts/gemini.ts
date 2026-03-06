import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY environment variable is not set.");
    console.error("Make sure you added it to your GitHub Codespaces Secrets!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function askGemini(prompt: string) {

    const foundationPath = path.join(process.cwd(), 'PROJECT_FOUNDATION.md');
    let foundationContext = "";

    try{
        if (fs.existsSync(foundationPath)) {
            foundationContext = fs.readFileSync(foundationPath, 'utf-8');
        } else {
            console.warn("⚠️ Warning: PROJECT_FOUNDATION.md not found. Proceeding without context.");
        }

    } catch (error) {
        console.error("❌ Error reading foundation file:", error);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash",
        systemInstruction: `You are a Senior Software and Database Architect on a pair programming project, you wiil receive by prompt your tasks.
        I'm the navigator and you the pilot.
        
        You must strictly adhere to the architecture, stack, and rules defined in the following project foundation document:
    
        --- START PROJECT FOUNDATION ---
            ${foundationContext}
        --- END PROJECT FOUNDATION ---
    
        When asked to write code, always enforce the MVC pattern and TDD methodology described above.
        Write clean, with the Clean Code concepts, production-ready code. Aways show the code you'll write for analyses.
        If a folder, or a file needed to be created ask before create it`
    });

    try {
        process.stdout.write("Thinking... \r");
        const result = await model.generateContent(prompt);

        process.stdout.write(" ".repeat(15) + "/r");
        console.log(`\n Gemini:\n${result.response.text()}\n`);
    } catch (error) {
        console.error("❌ Error asking Gemini:", error);
    }
}

const userPrompt = process.argv.slice(2).join(" ");

if (userPrompt) {
    askGemini(userPrompt);
}else {
    console.log("💡 Usage: npm run ai \"your question here\"");
}
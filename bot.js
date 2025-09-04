'use strict';

// We use CommonJS here to ensure compatibility with direct Node.js execution
const { SidechatAPIClient } = require("sidechat.js");
const { GoogleGenAI } = require("@google/genai");
const readline = require("readline");
const fs = require("fs");
require("dotenv").config();

// Default values
const NUM_CONTEXT_POSTS = 20;
const NUM_POSTS_TO_GENERATE = 20;
let TIME_BETWEEN_POSTS = 10;

// Try to load configuration if available
let POST_TYPE = "scarecrow";
let MIN_DELAY = 5;
let MAX_DELAY = 15;
let START_TIME = null;
let STOP_TIME = null;

try {
  if (fs.existsSync("./bot-config.json")) {
    const config = JSON.parse(fs.readFileSync("./bot-config.json", "utf8"));
    POST_TYPE = config.postType || "scarecrow";
    MIN_DELAY = config.delayMin || 5;
    MAX_DELAY = config.delayMax || 15;
    START_TIME = config.startTime ? new Date(config.startTime) : null;
    STOP_TIME = config.stopTime ? new Date(config.stopTime) : null;
    console.log("Bot configuration loaded successfully.");
  }
} catch (error) {
  console.error("Failed to load bot configuration:", error);
}

async function authenticate() {
  const API = new SidechatAPIClient();
  const phoneNumber = process.env.PHONE_NUMBER;

  await API.loginViaSMS(phoneNumber);
  console.log("SMS sent.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter SMS verification code: ", async (code) => {
      await API.verifySMSCode(phoneNumber, code);
      console.log("Successfully logged in.");

      const token = API.userToken;
      fs.writeFileSync("token.json", JSON.stringify({ token }), "utf8");
      console.log("Token saved to token.json");

      rl.close();
      resolve(token);
    });
  });
}

async function runBot() {
  let token;
  if (fs.existsSync("./token.json")) {
    const tokenData = JSON.parse(fs.readFileSync("./token.json", "utf8"));
    token = tokenData.token;
    console.log("Authorization token loaded.");
  } else {
    token = await authenticate();
  }

  // Add handlers for graceful shutdown
  process.on('SIGINT', () => {
    console.log('Bot stopping due to SIGINT signal');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Bot stopping due to SIGTERM signal');
    process.exit(0);
  });

  const API = new SidechatAPIClient(token);

  const user = await API.getCurrentUser();
  console.log("User ID: " + user.id);

  const groupId = process.env.GROUP_ID;
  console.log("Group ID: " + groupId);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const model = ai.models;

  // Check if we should wait for the start time
  if (START_TIME) {
    const now = new Date();
    if (now < START_TIME) {
      const waitTime = START_TIME.getTime() - now.getTime();
      console.log(`Waiting until scheduled start time: ${START_TIME.toLocaleString()}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  while (true) {
    // Check if we should stop
    if (STOP_TIME) {
      const now = new Date();
      if (now >= STOP_TIME) {
        console.log(`Reached scheduled stop time: ${STOP_TIME.toLocaleString()}`);
        process.exit(0);
      }
    }
    
    // Get a random delay time within the configured range
    TIME_BETWEEN_POSTS = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
    
    const hotPosts = await API.getGroupPosts(groupId, "hot");
    const postsContext = hotPosts.posts
      .slice(0, NUM_CONTEXT_POSTS)
      .map((post) => post.text)
      .join("\n\n");
    console.log(`Collected context from ${NUM_CONTEXT_POSTS} hot posts.`);

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][now.getDay()];
    const currentTime = now.toLocaleTimeString("en-US");

    console.log(`Generating new posts about ${POST_TYPE} with Gemini...`);
    const prompt = `
You are a sharp, witty comedy writer tasked with creating viral social media content. Your current muse: ${POST_TYPE}! Your goal is to generate ${NUM_POSTS_TO_GENERATE} genuinely funny, shareable jokes about ${POST_TYPE} for anonymous posting. Absolutely no AI mentions or identifying yourself as AI.

**Deep Dive into the Vibe:**
Analyze the provided ${postsContext} (recent popular posts) thoroughly. Don't just skim; understand the *undercurrents* – the trending topics, the public mood, specific events or locations buzzing online, popular slang, or recurring sentiments.

**Your Creative Challenge:**
Craft ${NUM_POSTS_TO_GENERATE} original jokes that *feel* contemporary and relevant, subtly echoing or playing off the themes, vibes, or specific elements found in the ${postsContext}. Think *inspiration*, not direct quotation. The connection should be clever and nuanced, like an inside joke readers familiar with the trends might catch, rather than an obvious name-drop. If the context mentions a specific event or trend, find a funny angle on it.

**Key Temporal Context:**
- Current date: ${currentDate}
- Current day: ${dayOfWeek}
- Current time: ${currentTime}
- Ensure your jokes align temporally with this information (e.g., referencing "today" if it's ${dayOfWeek}, mentioning recent events naturally).

**Essential Style & Content Rules:**
- **Maximize Humor & Virality:** Aim for genuinely funny, clever, unexpected, maybe slightly absurd takes.
- **Diverse Comedy Styles:** Mix it up! Use wordplay, puns, observational humor, absurdity, and meta-humor (perhaps a subtle joke about posting anonymously or the nature of online content).
- **Mandatory Keyword:** Every single joke MUST include the word "${POST_TYPE}".
- **Frequent Keyword:** The word "field" SHOULD appear in MANY of the jokes when relevant to the topic.
- **Context Weaving:** MANY jokes, not necessarily all, should allude to the locations/things/events identified in the ${postsContext}. Make these connections feel organic and witty, not forced or overly literal. Capture the *essence* or make a clever parallel.
- **Varied Structure:** Include sharp one-liners and slightly longer setup/punchline jokes.
- **Fresh & Original:** Avoid tired clichés unless you're giving them a truly novel twist.
- **Formatting:**
    - Absolutely no asterisks (*) for emphasis.
    - No numbering or bullet points for the jokes.
- **Output:** Respond with EXACTLY ${NUM_POSTS_TO_GENERATE} jokes separated by "---". Produce absolutely no other text before or after the jokes. Remember not to use any asterisks (*) for emphasis.
`;

    const response = await model.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const generatedContent = response.text;
    const generatedPosts = generatedContent
      .split("---")
      .map((post) => post.trim())
      .filter((post) => post.length > 0);

    console.log(`Successfully generated ${generatedPosts.length} posts.`);

    for (let i = 0; i < generatedPosts.length; i++) {
      const post = generatedPosts[i];
      await API.createPost(post, groupId, [], false, false, true);
      console.log(`Post sent successfully: ${post}`);
      if (i === generatedPosts.length - 1) {
        console.log("All posts sent.");
      }
      await new Promise((resolve) =>
        setTimeout(resolve, TIME_BETWEEN_POSTS * 60 * 1000)
      );
    }
  }
}

// Export for API use
module.exports = { runBot };

// Direct execution from command line
if (require.main === module) {
  runBot();
}

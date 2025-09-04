const { SidechatAPIClient } = require("sidechat.js");
const { GoogleGenAI } = require("@google/genai");
const readline = require("readline");
const fs = require("fs");
require("dotenv").config();

const NUM_CONTEXT_POSTS = 20;
const NUM_POSTS_TO_GENERATE = 20;
const TIME_BETWEEN_POSTS = 10;

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

async function main() {
  let token;
  if (fs.existsSync("./token.json")) {
    const tokenData = JSON.parse(fs.readFileSync("./token.json", "utf8"));
    token = tokenData.token;
    console.log("Authorization token loaded.");
  } else {
    token = await authenticate();
  }

  const API = new SidechatAPIClient(token);

  const user = await API.getCurrentUser();
  console.log("User ID: " + user.id);

  const groupId = user.memberships[1].groupId;
  console.log("Group ID: " + groupId);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const model = ai.models;

  while (true) {
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

    console.log("Generating new posts with Gemini...");
    const prompt = `
You are a sharp, witty comedy writer tasked with creating viral social media content. Your current muse: Scarecrows! Your goal is to generate ${NUM_POSTS_TO_GENERATE} genuinely funny, shareable jokes about scarecrows for anonymous posting. Absolutely no AI mentions or identifying yourself as AI.

**Deep Dive into the Vibe:**
Analyze the provided ${postsContext} (recent popular posts) thoroughly. Don't just skim; understand the *undercurrents* – the trending topics, the public mood, specific events or locations buzzing online, popular slang, or recurring sentiments.

**Your Creative Challenge:**
Craft ${NUM_POSTS_TO_GENERATE} original scarecrow jokes that *feel* contemporary and relevant, subtly echoing or playing off the themes, vibes, or specific elements found in the ${postsContext}. Think *inspiration*, not direct quotation. The connection should be clever and nuanced, like an inside joke readers familiar with the trends might catch, rather than an obvious name-drop. If the context mentions a specific event or trend, find a funny, scarecrow-centric *angle* on it.

**Key Temporal Context:**
- Current date: ${currentDate}
- Current day: ${dayOfWeek}
- Current time: ${currentTime}
- Ensure your jokes align temporally with this information (e.g., referencing "today" if it's ${dayOfWeek}, mentioning recent events naturally).

**Essential Style & Content Rules:**
- **Maximize Humor & Virality:** Aim for genuinely funny, clever, unexpected, maybe slightly absurd takes.
- **Diverse Comedy Styles:** Mix it up! Use wordplay, puns, observational humor, absurdity, and meta-humor (perhaps a subtle joke about posting anonymously or the nature of online content, but still centered on scarecrows).
- **Mandatory Keyword:** Every single joke MUST include the word "scarecrow".
- **Frequent Keyword:** The word "field" MUST appear in MOST (at least >50%) of the jokes.
- **Context Weaving:** MANY jokes, not necessarily all, should allude to the locations/things/events identified in the ${postsContext}. Make these connections feel organic and witty, not forced or overly literal. Capture the *essence* or make a clever parallel.
- **Varied Structure:** Include sharp one-liners and slightly longer setup/punchline jokes.
- **Fresh & Original:** Avoid tired scarecrow clichés unless you're giving them a truly novel twist.
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

main();

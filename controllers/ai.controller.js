import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function generateImage({ prompt, fileName }) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
        seed: Date.now() % Math.floor(Math.random() * 1000),
        aspectRatio: "1:1",
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imgData = part.inlineData.data;
        const buffer = Buffer.from(imgData, "base64");
        fs.writeFileSync(path.join(process.cwd(),"images", fileName + ".png"), buffer);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function addText({ fileName, quote }) {
  const fontPath = path.join(process.cwd(), "fonts", "roboto.ttf");

  registerFont(fontPath, { family: "MyFont" });

  const image = await loadImage(path.join(process.cwd(),"./images/" , fileName + ".png"));

  const canvasSize = 1024;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  const scale = Math.max(canvasSize / image.width, canvasSize / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (canvasSize - width) / 2;
  const y = (canvasSize - height) / 2;

  ctx.drawImage(image, x, y, width, height);

  ctx.font = "40px 'MyFont'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 6;

  const lines = quote.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, canvasSize / 2, canvasSize / 2 + i * 50);
  });

  ctx.font = "30px MyFont";
  ctx.fillText(
    "- " + process.env.CREATOR_NAME,
    canvasSize * 0.8,
    canvasSize * 0.95
  );

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./output/" + fileName + ".png", buffer);
}

const generatePostImage = async ({ prompt, quote, time }) => {
  try {
    await generateImage({
      prompt,
      fileName: time,
    });
    setTimeout(async () => {
      await addText({
        fileName: time,
        quote,
      });
    }, 500);
  } catch (error) {
    console.error("Error generating image:", error);
  }
};

const generatePostDetails = async () => {
  const prompt = `
  Generate a JSON object with the following fields:
  
  1. "motivationalLine": Create a motivational phrase focusing on overcoming challenges. (can include \\n for formatting).
  2. "imagePrompt": A { Cinematic / Ghilbi / Minimalist / Black & White (High Contrast)} image description (512x512) that visually represents the motivationalLine. The image must be deep, emotional, and high in contrast, with no text inside.
  3. "instagramTitle": A catchy and short Instagram title for the post.
  4. "instagramDescription": A creative, inspiring caption that elaborates on the motivationalLine and ends with 5 relevant hashtags.
  5. "tags": An array of 5 appropriate hashtags used in the description.
  
  Output the result as **pure JSON only** (no markdown, no explanations).
  Example format:
  {
    "motivationalLine": "Push yourself, because no one else will do it for you.",
    "imagePrompt": "A lone runner climbing a steep hill under a stormy sky, with beams of light breaking through the clouds, all in high-contrast black and white.",
    "instagramTitle": "Rise Above!",
    "instagramDescription": "Sometimes the climb is tough, but the view from the top is worth every step. Keep pushing. 💪 #MotivationMonday #NoExcuses #KeepGoing #ClimbToSuccess #BlackAndWhiteArt",
    "tags": ["#MotivationMonday", "#NoExcuses", "#KeepGoing", "#ClimbToSuccess", "#BlackAndWhiteArt"]
  }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        seed: Date.now() % Math.floor(Math.random() * 1000),
        responseModalities: ["Text"],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        try {
          const jsonText = part.text
            .trim()
            .replace(/^```json|```$/g, "")
            .trim();
          const parsed = JSON.parse(jsonText);
          return parsed;
        } catch (err) {
          console.error("Failed to parse JSON:", err);
          console.log("Raw response text:\n", part.text);
        }
      }
    }
  } catch (error) {
    console.error("Error during prompt generation:", error);
  }
  return {};
};


const generatePost = async () => {

    const details = await generatePostDetails();
    if(Object.keys(details).length === 0) {
      console.error("Failed to generate post details.");
      return;
    }
    const { motivationalLine, imagePrompt, instagramTitle, instagramDescription, tags } = details;
    const fileName = Date.now();
    await generatePostImage({ prompt: imagePrompt, quote: motivationalLine, time: fileName });
    return {
      filePath : `output/${fileName}.png`,
      instagramDescription,
      instagramTitle,
      tags,
    }
  }
  


export { generatePost };
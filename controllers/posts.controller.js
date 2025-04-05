import { generatePost } from "./ai.controller.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const endPOINT = `https://graph.facebook.com/v22.0/${process.env.INSTAGRAM_ACCOUNT_ID}`;

const generateInstagramPost = async (NGROKPATH) => {
    const { filePath, instagramDescription, instagramTitle, tags } =
    await generatePost();
    const caption = `${instagramDescription} ${tags}`;
    const POST_URL = `${endPOINT}/media?image_url=${(process.env.APP_URL || NGROKPATH)+"/"+filePath}&access_token=${process.env.ACCESS_TOKEN}&caption=${caption}&alt_text=${instagramTitle}`
    
    try {
        const response = await axios.post(POST_URL);
        let creationId = response.data.id;
        const PUBLISH_URL = `${endPOINT}/media_publish?creation_id=${creationId}&access_token=${process.env.ACCESS_TOKEN}`
        const details = await axios.post(PUBLISH_URL);
        console.log(details.data);
        console.log("Post published successfully!");
    } catch (error) {
        console.log(error);
    }
    return filePath;
};

export { generateInstagramPost };

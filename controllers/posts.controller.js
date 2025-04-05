import { generatePost } from "./ai.controller.js";
import axios from "axios";


const generateInstagramPost = async (NGROKPATH) => {
    const { filePath, instagramDescription, instagramTitle, tags } =
    await generatePost();
    const caption = `${instagramDescription} ${tags}`;

    try {
        const response = await axios.post(
        `https://graph.facebook.com/v22.0/${
            process.env.INSTAGRAM_ACCOUNT_ID
        }/media?image_url=${
            (process.env.APP_URL || NGROKPATH) + "/" + filePath
        }&access_token=${
            process.env.ACCESS_TOKEN
        }&caption=${caption}&alt_text=${instagramTitle}`
        );
        let creationId = response.data.id;
        const details = await axios.post(
        `https://graph.facebook.com/v22.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish?creation_id=${creationId}&access_token=${process.env.ACCESS_TOKEN}`
        );
        console.log(details.data);
        console.log("Post published successfully!");
    } catch (error) {
        console.log(error);
    }
    return filePath;
};

export { generateInstagramPost };

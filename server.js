import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("Amlaj AI Bot is running");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(200).send("Webhook endpoint is ready");
});

app.post("/webhook", async (req, res) => {
  res.status(200).send("EVENT_RECEIVED");

  try {
    const body = req.body;

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          const messageText = event.message?.text;

          if (senderId && messageText) {
            const aiReply = await generateReply(messageText);
            await sendMessage(senderId, aiReply);
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
  }
});

async function generateReply(userMessage) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
أنت بوت مبيعات جزائري لمنتج مجموعة الأملج للشعر.
تكلم باللهجة الجزائرية البسيطة.
لا ترسل رسالة طويلة.
رد برسالة قصيرة وواضحة.
لا تعد بنتائج طبية مضمونة.
قل: يساعد على العناية بالشعر وتقويته وتقليل التساقط مع الاستعمال المنتظم.
هدفك هو مساعدة الزبون وجمع الطلب.
إذا أراد الطلب اسأله عن الاسم، الهاتف، الولاية، البلدية، العنوان.
`
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });

  return response.choices[0].message.content;
}

async function sendMessage(senderId, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: { text }
    }
  );
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

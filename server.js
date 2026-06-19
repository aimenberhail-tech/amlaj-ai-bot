import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(express.static("."));

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const ORDER_FORM_URL = "https://amlaj-ai-bot.onrender.com/order.html";

app.get("/", (req, res) => {
  res.send("Dina Shop Bot is running");
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

          if (senderId) {
            await sendOrderButton(senderId);
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
  }
});

async function sendOrderButton(senderId) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text:
              "أهلا حنونة 🥰\n\nكل التفاصيل والنتائج وطريقة الاستعمال وأسعار التوصيل موجودة هنا، وتقدري تأكدي الطلب مباشرة من نفس الصفحة 👇",
            buttons: [
              {
                type: "web_url",
                url: ORDER_FORM_URL,
                title: "🛒 مشاهدة العرض وتأكيد الطلب"
              }
            ]
          }
        }
      }
    }
  );
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

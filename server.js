import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.static("."));

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const IMAGES = {
  offer: "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/offer.png",
  benefits: "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/benefits.png",
  results: "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/results.png",
  usage: "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/usage.png",
  delivery: "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/delivery.png"
};

const ORDER_FORM_URL = "https://amlaj-ai-bot.onrender.com/order.html";

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[إأآا]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/[ذ]/g, "د")
    .replace(/[éèêë]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[ù]/g, "u")
    .replace(/[îï]/g, "i")
    .replace(/[ô]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function hasAny(text, words) {
  const t = normalize(text);
  return words.some((w) => t.includes(normalize(w)));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getOfferEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);

  const months = [
    "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
    "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function startButtons() {
  return [
    { title: "😔 مشكل في الوجه", payload: "MENU_BENEFITS" },
    { title: "🚚 السعر والتوصيل", payload: "MENU_DELIVERY" },
    { title: "🧴 طريقة الاستعمال", payload: "MENU_USAGE" },
    { title: "🛒 تأكيد الطلب", payload: "MENU_ORDER" }
  ];
}

function afterBenefitsButtons() {
  return [
    { title: "🛒 تأكيد الطلب", payload: "MENU_ORDER" },
    { title: "🚚 السعر والتوصيل", payload: "MENU_DELIVERY" },
    { title: "🧴 طريقة الاستعمال", payload: "MENU_USAGE" }
  ];
}

function afterDeliveryButtons() {
  return [
    { title: "🛒 تأكيد الطلب", payload: "MENU_ORDER" },
    { title: "🧴 طريقة الاستعمال", payload: "MENU_USAGE" }
  ];
}

function afterUsageButtons() {
  return [
    { title: "🛒 تأكيد الطلب", payload: "MENU_ORDER" },
    { title: "🚚 السعر والتوصيل", payload: "MENU_DELIVERY" }
  ];
}

app.get("/", (req, res) => {
  res.send("Dina Shop Landing Bot is running");
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
          const messageText = event.message?.text || "";
          const payload =
            event.message?.quick_reply?.payload ||
            event.postback?.payload ||
            null;

          if (senderId) {
            await handleMessage(senderId, messageText, payload);
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
  }
});

async function handleMessage(senderId, messageText, payload) {
  const msg = normalize(messageText);

  if (
    payload === "MENU_BENEFITS" ||
    hasAny(msg, ["مشكل", "مشكلتي", "الوجه", "تجاعيد", "هالات", "تصبغات", "حبوب", "اثار", "آثار", "كلف", "مسام"])
  ) {
    await sendImage(senderId, IMAGES.benefits);
    await wait(900);
    await sendImage(senderId, IMAGES.results);
    await wait(500);
    await sendQuickReplies(
      senderId,
      "إذا اقتنعتي حنونة تقدري تطلبي مباشرة 👇🥰",
      afterBenefitsButtons()
    );
    return;
  }

  if (
    payload === "MENU_DELIVERY" ||
    hasAny(msg, ["توصيل", "التوصيل", "توصلو", "توصلولي", "الشحن", "livraison", "delivery"])
  ) {
    await sendImage(senderId, IMAGES.delivery);
    await wait(500);
    await sendQuickReplies(
      senderId,
      "التوصيل لباب المنزل حنونة 🚚🥰",
      afterDeliveryButtons()
    );
    return;
  }

  if (
    payload === "MENU_USAGE" ||
    hasAny(msg, ["استعمال", "طريقة الاستعمال", "كيفاش نستعمل", "نستعمل", "usage", "utilisation"])
  ) {
    await sendImage(senderId, IMAGES.usage);
    await wait(500);
    await sendQuickReplies(
      senderId,
      "طريقة الاستعمال موضحة فوق حنونة 🥰👇",
      afterUsageButtons()
    );
    return;
  }

  if (
    payload === "MENU_ORDER" ||
    hasAny(msg, ["نطلب", "طلب", "نكوموندي", "نحب نطلب", "commande", "commander"])
  ) {
    await sendButtonMessage(
      senderId,
      "باش تأكدي الطلب حنونة، اضغطي على الزر وعمّري الاستمارة 🛒🥰",
      [
        {
          type: "web_url",
          url: ORDER_FORM_URL,
          title: "🛒 تأكيد الطلب"
        }
      ]
    );
    return;
  }

  await sendImage(senderId, IMAGES.offer);
  await wait(500);

  await sendMessage(
    senderId,
    `🎁 عرض خاص على مجموعة اللبان الذكر العماني الأصلية\nالسعر 250 ألف فقط + صابون هدية مجانية 🎁\nالعرض صالح لغاية ${getOfferEndDate()} 🔥`
  );

  await wait(400);

  await sendQuickReplies(
    senderId,
    "اختاري حنونة وش حابة تعرفي أكثر 👇🥰",
    startButtons()
  );
}

async function sendQuickReplies(senderId, text, replies) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: {
        text,
        quick_replies: replies.map((r) => ({
          content_type: "text",
          title: r.title,
          payload: r.payload
        }))
      }
    }
  );
}

async function sendButtonMessage(senderId, text, buttons) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text,
            buttons
          }
        }
      }
    }
  );
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

async function sendImage(senderId, imageUrl) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: "image",
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }
      }
    );
  } catch (error) {
    console.error("Image send error:", error.response?.data || error.message);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

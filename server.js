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
أنت بوت مبيعات جزائري باللهجة الجزائرية لصفحة تبيع زوج منتجات:
1) مجموعة الأملج للشعر: زيت الأملج الأصلي + بخاخ الأملج الأصلي. السعر 250 ألف. للتساقط، الفراغات، الجفاف، ضعف الشعر، تطويل الشعر. النتيجة بين الأسبوع الثاني والثالث. الاستعمال: البخاخ ساعة ثم الزيت ساعة ثم غسل الشعر، مرتين في الأسبوع.
2) مجموعة اللبان الذكر العماني: زيت + كريم + صابون هدية. السعر 250 ألف. للتجاعيد، الخطوط، التصبغات، آثار الحبوب، الهالات، المسام. النتيجة من الأسبوع الأول. الاستعمال: الكريم 20 دقيقة ثم الزيت 20 دقيقة، والصباح تغسل بالصابون. الكريم يمكن استعماله صباحا كمرطب.

تحدثي دائمًا كأنك بائعة جزائرية حنونة. اعتبري الزبون امرأة افتراضيًا: أختي، حنونة، شوفي، متتحيريش. إذا قال أنه رجل استعملي: خويا، شوف، متتحيرش.
ردودك قصيرة، طبيعية، برسائل بيع، لا تكتبي فقرات طويلة. استعملي إيموجي خفيف 🥰😍❤️😊🚚✅.

إذا كتب الزبون رسالة عامة مثل: سلام، السعر، بكم، مهتمة، بدون ما يذكر الشعر أو الوجه:
لا تختاري المنتج من نفسك.
ردي برسالتين منفصلتين:
الرسالة 1:
وعليكم السلام أختي 🥰
عندنا زوج عروض: مجموعة الأملج للشعر ومجموعة اللبان الذكر للوجه، كل وحدة بسعر 250 ألف فقط + التوصيل حسب الولاية 🚚

الرسالة 2:
قوليلي برك حنونة، حابة على الشعر ولا على الوجه؟ 😊

إذا ذكر الشعر أو تساقط أو فراغات أو جفاف أو تطويل:
اختاري الأملج.

إذا ذكر الوجه أو تجاعيد أو هالات أو حبوب أو تصبغات أو آثار حبوب:
اختاري اللبان الذكر.

بعد ما تذكر المشكلة:
فهمتك أختي 🥰
شوفي متتحيريش، نعطيك المجموعة الأصلية كاملة
راهي تفيدك بإذن الله، حاجة إيفيكاس ومضمونة 😍

للأملج: بين الأسبوع الثاني والثالث تبداي تشوفي نتيجة روعة إن شاء الله.
للبان: من الأسبوع الأول تبداي تشوفي نتيجة روعة إن شاء الله.

إذا سألت واش فيها المجموعة:
الأملج: فيها زيت الأملج الأصلي + بخاخ الأملج الأصلي.
اللبان: فيها زيت اللبان الذكر + كريم + صابون هدية.

إذا سألت كيفاش نستعملها:
جاوبي بطريقة الاستعمال المناسبة للمنتج.

إذا قالت غالي أو نقصيلي:
والله أختي بعناها قبل بسعر 290 ألف 🥰 وحاليا راهي داخلة في تخفيض، السعر 250 ألف فقط ❤️

إذا قالت ما عنديش أو ظروفي:
والله غالب أختي 🥰 حاليا راهي داخلة في تخفيض فقط وبعد أيام ترجع للسعر الأصلي، ومرحبا بيك في أي وقت حنونة ❤️

إذا أرادت الطلب:
للطلب خليلي الاسم ورقم الهاتف والولاية والبلدية أختي 😊

إذا أعطت معلومات الطلب، لخصيها واطلبي الناقص فقط.
لا تخترعي سعر التوصيل إذا لم تعرفي الولاية.
لا تقولي أنك بوت أو ذكاء اصطناعي.
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

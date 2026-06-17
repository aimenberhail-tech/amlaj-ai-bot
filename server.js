import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessions = new Map();

function getSession(senderId) {
  if (!sessions.has(senderId)) {
    sessions.set(senderId, {
      product: null,
      problem: null,
      gender: "female",
      stage: "start"
    });
  }
  return sessions.get(senderId);
}

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function hasAny(text, words) {
  return words.some(w => text.includes(w));
}

function splitMessages(text) {
  return text.split("---").map(x => x.trim()).filter(Boolean);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
            const replies = await handleMessage(senderId, messageText);

            for (const reply of replies) {
              await sendMessage(senderId, reply);
              await wait(900);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
  }
});

async function handleMessage(senderId, messageText) {
  const session = getSession(senderId);
  const msg = normalize(messageText);

  if (hasAny(msg, ["انا رجل", "راني رجل", "انا راجل", "راني راجل"])) {
    session.gender = "male";
    return ["مرحبا بيك خويا 😊"];
  }

  const sister = session.gender === "male" ? "خويا" : "أختي";
  const honey = session.gender === "male" ? "خويا" : "حنونة";

  if (hasAny(msg, ["سلام", "السعر", "سعر", "بشحال", "شحال", "بكم", "مهتم"])) {
    if (session.stage === "start") {
      session.stage = "asked_product";
      return [
        "وعليكم السلام أختي 🥰\nعندنا زوج عروض اليوم:\nمجموعة الأملج للشعر: زيت + بخاخ بسعر 250 ألف\nومجموعة اللبان الذكر للوجه: زيت + كريم + صابون هدية بسعر 250 ألف\n+ التوصيل حسب الولاية 🚚",
        "قوليلي برك حنونة، حابة على الشعر ولا على الوجه؟ 😊"
      ];
    }
  }

  if (hasAny(msg, ["شعر", "تساقط", "فراغ", "فراغات", "جفاف", "يطول", "تطويل"])) {
    session.product = "amlaj";
    session.problem = messageText;
    session.stage = "persuasion";
    return [
      `فهمتك ${sister} 🥰`,
      "شوفي متتحيريش، نعطيك مجموعة الأملج الأصلية كاملة",
      "راهي تفيدك بإذن الله، حاجة إيفيكاس ومضمونة 😍",
      "بين الأسبوع الثاني والثالث تبداي تشوفي نتيجة روعة إن شاء الله"
    ];
  }

  if (hasAny(msg, ["وجه", "تجاعيد", "هالات", "تصبغات", "حبوب", "اثار", "آثار", "مسام", "كلف", "خطوط"])) {
    session.product = "luban";
    session.problem = messageText;
    session.stage = "persuasion";
    return [
      `فهمتك ${sister} 🥰`,
      "شوفي متتحيريش، نعطيك مجموعة اللبان الذكر العماني الأصلية كاملة",
      "راهي تفيدك بإذن الله، حاجة إيفيكاس ومضمونة 😍",
      "من الأسبوع الأول تبداي تشوفي نتيجة روعة إن شاء الله"
    ];
  }

  if (hasAny(msg, if (
  hasAny(msg, [
    "نستعمل",
    "استعمال",
    "نستعملها",
    "كيفاش نستعمل",
    "كيفاه نستعمل",
    "كيفاش نديرها",
    "كيفاه نديرها",
    "نحطها",
    "ندهنها"
  ])
) {
    if (session.product === "amlaj") {
      return [
        "تديري البخاخ في شعرك وتخليه ساعة 😊",
        "من بعد بلا ما تغسلي، تديري الزيت وتخليه ساعة ثانية",
        "ومن بعد تغسلي شعرك عادي",
        "تستعمليهم مرتين في الأسبوع أختي 🥰"
      ];
    }

    if (session.product === "luban") {
      return [
        "تديري الكريم في وجهك وتخليه 20 دقيقة 😊",
        "من بعد تديري الزيت وتخليه 20 دقيقة ثاني",
        "من بعد ترقدي، وغدوة الصباح تغسلي بالصابون",
        "وتقدري تستعملي الكريم صباح كمرطب عادي أختي 🥰"
      ];
    }

    return ["تقصدي طريقة استعمال الأملج ولا اللبان أختي؟ 😊"];
  }

  if (hasAny(msg, ["يفيدني", "يفيد", "صح", "مضمون", "جربت", "خايفة"])) {
    if (session.product === "amlaj") {
      return [
        "نعم أختي يفيدك بإذن الله 🥰",
        "هذا الأملج الأصلي راه يعاون على التساقط والفراغات ويقوي الشعر مع الاستعمال المنتظم",
        "رانا نخدمو بيه مدة طويلة والحمد لله، نتائج روعة ومضمونة ❤️",
        "بشهادة الزبائن تاعنا لي داوه وجربوه 🥰"
      ];
    }

    if (session.product === "luban") {
      return [
        "نعم أختي يفيدك بإذن الله 🥰",
        "هذا اللبان الذكر العماني الأصلي مناسب للتجاعيد والتصبغات وآثار الحبوب والهالات",
        "رانا نخدمو بيه مدة طويلة والحمد لله، نتائج روعة ومضمونة ❤️",
        "بشهادة الزبائن تاعنا لي داوه وجربوه 🥰"
      ];
    }
  }

  if (hasAny(msg, ["واش فيها", "فيها", "مكونات", "وش فيها"])) {
    if (session.product === "amlaj") {
      return ["مجموعة الأملج فيها زيت الأملج الأصلي + بخاخ الأملج الأصلي، بسعر 250 ألف فقط 🥰"];
    }

    if (session.product === "luban") {
      return ["مجموعة اللبان الذكر العماني فيها زيت + كريم + صابون هدية مجانية، بسعر 250 ألف فقط 🥰"];
    }

    return ["تقصدي مجموعة الأملج ولا مجموعة اللبان أختي؟ 😊"];
  }

  if (hasAny(msg, ["غالي", "نقصي", "ساعديني", "ديرولي"])) {
    return [
      "والله أختي بعناها قبل بسعر 290 ألف 🥰",
      "وحاليًا راهي داخلة في تخفيض، السعر 250 ألف فقط ❤️",
      "بعد أيام ترجع للسعر الأصلي حنونة"
    ];
  }

  if (hasAny(msg, ["ما عنديش", "مازال ما خلصتش", "زوالية", "ظروفي", "بعد أسبوع"])) {
    return [
      "والله غالب أختي 🥰",
      "حاليًا راهي داخلة في تخفيض فقط وبعد أيام ترجع للسعر الأصلي",
      "ومرحبا بيك في أي وقت حنونة ❤️"
    ];
  }

  if (hasAny(msg, ["نطلب", "نكوموندي", "نأكد", "ابعثولي", "نحبها"])) {
    session.stage = "order";
    return ["للطلب خليلي الاسم ورقم الهاتف والولاية والبلدية أختي 😊"];
  }

  if (hasAny(msg, ["شكرا", "يعطيك الصحة"])) return ["عفوا أختي 🥰"];
  if (hasAny(msg, ["يسلمك"])) return ["يعيشك حنونة ❤️"];
  if (hasAny(msg, ["يعيشك"])) return ["يسلمك أختي 🥰"];
  if (hasAny(msg, ["اوكي", "ok", "okay"])) return ["أوكي أختي 🥰"];
  if (hasAny(msg, ["نرجعلك", "نشوف", "نبحثك"])) return ["مرحبا بيك في أي وقت حنونة 🥰"];

  const aiReply = await generateReply(messageText, session);
  return splitMessages(aiReply);
}

async function generateReply(userMessage, session) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
أنت بوت مبيعات جزائري لصفحة Dina Shop.
تتكلمي باللهجة الجزائرية كأنك بائعة حنونة في Messenger.
لا تعيدي رسالة العرض إذا الزبون راه في وسط المحادثة.
استعملي سياق المحادثة الحالي:
المنتج الحالي: ${session.product || "غير محدد"}
المشكلة الحالية: ${session.problem || "غير محددة"}
المرحلة الحالية: ${session.stage || "غير محددة"}
الجنس: ${session.gender}

المنتجات:
الأملج: زيت + بخاخ، السعر 250 ألف، للتساقط والفراغات والجفاف وتطويل الشعر. النتيجة بين الأسبوع الثاني والثالث.
اللبان الذكر: زيت + كريم + صابون هدية، السعر 250 ألف، للتجاعيد والهالات والتصبغات وآثار الحبوب والمسام. النتيجة من الأسبوع الأول.

قواعد الرد:
- اعتبري الزبون امرأة إلا إذا قال أنه رجل.
- لا تكتبي فقرات طويلة.
- لا تقولي أنك بوت.
- إذا قال يفيدني؟ جاوبي حسب المنتج الحالي ولا ترجعي للبداية.
- إذا قال كيفاش؟ غالبًا يقصد طريقة الاستعمال حسب المنتج الحالي.
- إذا لم تفهمي، اسألي سؤال واحد فقط.
- استعملي إيموجي خفيف.
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

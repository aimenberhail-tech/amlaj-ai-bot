import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PRODUCT_PRICE = 250;

const DELIVERY = {
  "الجزائر": { price: 40, mode: "show" },
  "العاصمة": { price: 40, mode: "show" },

  "الشلف": { price: 50, mode: "show" },
  "ام البواقي": { price: 50, mode: "show" },
  "أم البواقي": { price: 50, mode: "show" },
  "باتنة": { price: 50, mode: "show" },
  "بجاية": { price: 50, mode: "show" },
  "البليدة": { price: 50, mode: "show" },
  "البويرة": { price: 50, mode: "show" },
  "تلمسان": { price: 50, mode: "show" },
  "تيارت": { price: 50, mode: "show" },
  "تيزي وزو": { price: 50, mode: "show" },
  "جيجل": { price: 50, mode: "show" },
  "سطيف": { price: 50, mode: "show" },
  "سعيدة": { price: 50, mode: "show" },
  "سكيكدة": { price: 50, mode: "show" },
  "سيدي بلعباس": { price: 50, mode: "show" },
  "عنابة": { price: 50, mode: "show" },
  "قالمة": { price: 50, mode: "show" },
  "قسنطينة": { price: 50, mode: "show" },
  "المدية": { price: 50, mode: "show" },
  "مستغانم": { price: 50, mode: "show" },
  "معسكر": { price: 50, mode: "show" },
  "وهران": { price: 50, mode: "show" },
  "برج بوعريريج": { price: 50, mode: "show" },
  "بومرداس": { price: 50, mode: "show" },
  "الطارف": { price: 50, mode: "show" },
  "تيسمسيلت": { price: 50, mode: "show" },
  "تيبازة": { price: 50, mode: "show" },
  "ميلة": { price: 50, mode: "show" },
  "عين الدفلى": { price: 50, mode: "show" },
  "عين تموشنت": { price: 50, mode: "show" },
  "غليزان": { price: 50, mode: "show" },

  "سوق اهراس": { price: 60, mode: "total" },
  "سوق أهراس": { price: 60, mode: "total" },

  "الأغواط": { price: 70, mode: "total" },
  "الاغواط": { price: 70, mode: "total" },
  "بسكرة": { price: 70, mode: "total" },
  "بشار": { price: 70, mode: "total" },
  "تبسة": { price: 70, mode: "total" },
  "الجلفة": { price: 70, mode: "total" },
  "ورقلة": { price: 70, mode: "total" },
  "البيض": { price: 70, mode: "total" },
  "الوادي": { price: 70, mode: "total" },
  "خنشلة": { price: 70, mode: "total" },
  "النعامة": { price: 70, mode: "total" },
  "غرداية": { price: 70, mode: "total" },
  "أولاد جلال": { price: 70, mode: "total" },
  "اولاد جلال": { price: 70, mode: "total" },
  "بني عباس": { price: 70, mode: "total" },
  "تقرت": { price: 70, mode: "total" },
  "توقرت": { price: 70, mode: "total" },
  "المغير": { price: 70, mode: "total" },
  "المنيعة": { price: 70, mode: "total" },

  "أدرار": { price: 100, mode: "total" },
  "ادرار": { price: 100, mode: "total" },
  "تيميمون": { price: 100, mode: "total" }
};

const NO_DELIVERY = [
  "تمنراست",
  "اليزي",
  "إليزي",
  "تندوف",
  "عين صالح",
  "عين قزام",
  "جانت"
];

function findWilaya(text) {
  for (const w of NO_DELIVERY) {
    if (text.includes(w.toLowerCase())) return { name: w, unavailable: true };
  }

  for (const [name, data] of Object.entries(DELIVERY)) {
    if (text.includes(name.toLowerCase())) {
      return { name, ...data };
    }
  }

  return null;
}

const sessions = new Map();

function getSession(senderId) {
  if (!sessions.has(senderId)) {
    sessions.set(senderId, {
      product: "luban",
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

function getOfferEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);

  const months = [
    "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
    "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return `${date.getDate()} ${months[date.getMonth()]}`;
}

app.get("/", (req, res) => {
  res.send("Luban AI Bot is running");
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
  if (
    hasAny(msg, [
      "وين مقركم",
      "وين حالين",
      "نتوما منين",
      ...
    ])
  ) {
     ...
  }
  if (
    hasAny(msg, [
      "سلام",
      "السعر",
      "سعر",
      "بشحال",
      "شحال",
      "بكم",
      "مهتم",
      "واش عندكم"
    ])
  ) {
    if (session.stage === "start") {
      session.stage = "asked_problem";
      return [
        `وعليكم السلام ${sister} 🥰\nعرض خاص صالح لغاية ${getOfferEndDate()} 😍\nمجموعة اللبان الذكر العماني الأصلية فيها:\nزيت + كريم + صابون هدية مجانية 🎁\nالسعر 250 ألف فقط\n+ مصاريف التوصيل حسب الولاية 🚚`,
        `قوليلي برك ${honey}، واش عندك؟ تجاعيد؟ حبوب؟ هالات؟ تصبغات؟ ولا آثار حبوب؟ 😊`
      ];
    }
  }

  if (
    hasAny(msg, [
      "تجاعيد",
      "هالات",
      "تصبغات",
      "حبوب",
      "اثار",
      "آثار",
      "مسام",
      "كلف",
      "خطوط",
      "وجه",
      "بشرة",
      "شحوب"
    ])
  ) {
    session.problem = messageText;
    session.stage = "persuasion";

    return [
      `فهمتك ${sister} 🥰`,
      "شوفي متتحيريش، نعطيك مجموعة اللبان الذكر العماني الأصلية كاملة",
      "راهي تفيدك بإذن الله، حاجة إيفيكاس ومضمونة 😍",
      "من الأسبوع الأول تبداي تشوفي نتيجة روعة إن شاء الله"
    ];
  }

  if (
    hasAny(msg, [
      "نكوموندي",
      "نكوموند",
      "نطلب",
      "ندير الطلبية",
      "نأكد",
      "نشتري",
      "نشري",
      "كيفاش نكوموندي",
      "كيفاه نكوموندي",
      "كيفاش نطلب",
      "كيفاه نطلب",
      "كيفاش نشري",
      "كيفاه نشري"
    ])
  ) {
    session.stage = "order";
    return [`للطلب خليلي الاسم ورقم الهاتف والولاية والبلدية ${sister} 😊`];
  }

  if (
    hasAny(msg, [
      "استعمال",
      "نستعمل",
      "نستعملها",
      "كيفاش نستعمل",
      "كيفاه نستعمل",
      "كيفاش نديرها",
      "كيفاه نديرها",
      "نحطها",
      "ندهنها"
    ])
  ) {
    return [
      "تديري الكريم في وجهك وتخليه 20 دقيقة 😊",
      "من بعد تديري الزيت وتخليه 20 دقيقة ثاني",
      "من بعد ترقدي عادي",
      "وغدوة الصباح تغسلي بالصابون",
      "وتقدري تستعملي الكريم صباح كمرطب وتخرجي عادي أختي 🥰"
    ];
  }

  if (hasAny(msg, ["يفيدني", "يفيد", "صح", "مضمون", "جربت", "خايفة"])) {
    return [
      `نعم ${sister} يفيدك بإذن الله 🥰`,
      "هذا اللبان الذكر العماني الأصلي مناسب للتجاعيد والتصبغات وآثار الحبوب والهالات",
      "رانا نخدمو بيه مدة طويلة والحمد لله، نتائج روعة ومضمونة ❤️",
      "بشهادة الزبائن تاعنا لي داوه وجربوه 🥰"
    ];
  }

  if (hasAny(msg, ["واش فيها", "وش فيها", "فيها", "مكونات"])) {
    return [
      "مجموعة اللبان الذكر العماني فيها:",
      "زيت اللبان الذكر + كريم + صابون هدية مجانية 🎁",
      "السعر 250 ألف فقط 🥰"
    ];
  }

  if (hasAny(msg, ["وقتاش النتيجة", "متى النتيجة", "نتيجة", "تبان النتيجة"])) {
    return ["من الأسبوع الأول تبداي تشوفي نتيجة روعة إن شاء الله 😍"];
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

  if (hasAny(msg, ["مكتب"])) {
    return [
      "معندناش للمكتب أختي 😊",
      "يعيطلك الليفرور ويجيبهالك وين بغيتي لباب الدار ولا للمكان اللي تختاريه 🚚"
    ];
  }

  if (hasAny(msg, ["شكرا", "يعطيك الصحة"])) return ["عفوا أختي 🥰"];
  if (hasAny(msg, ["يسلمك"])) return ["يعيشك حنونة ❤️"];
  if (hasAny(msg, ["يعيشك"])) return ["يسلمك أختي 🥰"];
  if (hasAny(msg, ["اوكي", "ok", "okay"])) return ["أوكي أختي 🥰"];
  if (hasAny(msg, ["نرجعلك", "نشوف", "نبحثك"])) {
    return ["مرحبا بيك في أي وقت حنونة 🥰"];
  }

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
الصفحة تبيع منتجًا واحدًا فقط: مجموعة اللبان الذكر العماني الأصلية.

لا تتكلم أبدًا عن الأملج أو الشعر أو منتجات أخرى.

المنتج:
مجموعة اللبان الذكر العماني الأصلية فيها زيت + كريم + صابون هدية مجانية.
السعر 250 ألف فقط.
لا تكتب 2500 دج.

تستعمل للتجاعيد، الخطوط، التصبغات، آثار الحبوب، الهالات، المسام، شحوب البشرة، وترطيب الوجه.

طريقة الاستعمال:
الكريم 20 دقيقة، ثم الزيت 20 دقيقة، ثم النوم، والصباح تغسل بالصابون.
الكريم يمكن استعماله صباحًا كمرطب.

النتيجة:
من الأسبوع الأول تبدا تشوف نتيجة روعة إن شاء الله.

السياق الحالي:
المشكلة: ${session.problem || "غير محددة"}
المرحلة: ${session.stage || "غير محددة"}
الجنس: ${session.gender}

قواعد صارمة:
- تحدث باللهجة الجزائرية فقط.
- اعتبر الزبون امرأة إلا إذا قال أنه رجل.
- استعمل: أختي، حنونة، شوفي، متتحيريش، يعيشك.
- ممنوع استعمال: حبيبتي، عزيزتي، أهلين، مرحبًا، كيف حالك اليوم.
- لا تبدأ محادثة جديدة إذا الزبون في وسط الحوار.
- لا تعيد العرض إذا المحادثة متقدمة.
- إذا قال: نعم، ايه، صح، كيفاش، يفيدني، أكمل حسب السياق ولا ترجع للبداية.
- إذا لم تفهم، اسأل سؤالًا واحدًا فقط.
- لا تكتب فقرات طويلة.
- هدفك البيع وجمع الطلب.
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

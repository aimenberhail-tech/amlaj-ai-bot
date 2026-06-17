import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PRODUCT_PRICE = 250;

// إذا كانت الصورة لا تُرسل، خلي الرابط فارغًا مؤقتًا ""
const PRODUCT_IMAGE =
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/722752378_857421810771610_3359621745035357339_n.jpg";

const DELIVERY = {
  "الجزائر": { price: 40, mode: "show" },
  "العاصمة": { price: 40, mode: "show" },
  "alger": { price: 40, mode: "show" },
  "algiers": { price: 40, mode: "show" },

  "الشلف": { price: 50, mode: "show" },
  "chlef": { price: 50, mode: "show" },
  "ام البواقي": { price: 50, mode: "show" },
  "أم البواقي": { price: 50, mode: "show" },
  "oum el bouaghi": { price: 50, mode: "show" },
  "باتنة": { price: 50, mode: "show" },
  "batna": { price: 50, mode: "show" },
  "بجاية": { price: 50, mode: "show" },
  "bejaia": { price: 50, mode: "show" },
  "البليدة": { price: 50, mode: "show" },
  "blida": { price: 50, mode: "show" },
  "البويرة": { price: 50, mode: "show" },
  "bouira": { price: 50, mode: "show" },
  "تلمسان": { price: 50, mode: "show" },
  "tlemcen": { price: 50, mode: "show" },
  "تيارت": { price: 50, mode: "show" },
  "tiaret": { price: 50, mode: "show" },
  "تيزي وزو": { price: 50, mode: "show" },
  "tizi ouzou": { price: 50, mode: "show" },
  "جيجل": { price: 50, mode: "show" },
  "jijel": { price: 50, mode: "show" },
  "سطيف": { price: 50, mode: "show" },
  "setif": { price: 50, mode: "show" },
  "sétif": { price: 50, mode: "show" },
  "سعيدة": { price: 50, mode: "show" },
  "saida": { price: 50, mode: "show" },
  "سكيكدة": { price: 50, mode: "show" },
  "skikda": { price: 50, mode: "show" },
  "سيدي بلعباس": { price: 50, mode: "show" },
  "sidi bel abbes": { price: 50, mode: "show" },
  "عنابة": { price: 50, mode: "show" },
  "annaba": { price: 50, mode: "show" },
  "قالمة": { price: 50, mode: "show" },
  "guelma": { price: 50, mode: "show" },
  "قسنطينة": { price: 50, mode: "show" },
  "constantine": { price: 50, mode: "show" },
  "المدية": { price: 50, mode: "show" },
  "medea": { price: 50, mode: "show" },
  "مستغانم": { price: 50, mode: "show" },
  "mostaganem": { price: 50, mode: "show" },
  "معسكر": { price: 50, mode: "show" },
  "mascara": { price: 50, mode: "show" },
  "وهران": { price: 50, mode: "show" },
  "oran": { price: 50, mode: "show" },
  "برج بوعريريج": { price: 50, mode: "show" },
  "bordj": { price: 50, mode: "show" },
  "بومرداس": { price: 50, mode: "show" },
  "boumerdes": { price: 50, mode: "show" },
  "الطارف": { price: 50, mode: "show" },
  "el tarf": { price: 50, mode: "show" },
  "تيسمسيلت": { price: 50, mode: "show" },
  "tissemsilt": { price: 50, mode: "show" },
  "تيبازة": { price: 50, mode: "show" },
  "tipaza": { price: 50, mode: "show" },
  "ميلة": { price: 50, mode: "show" },
  "mila": { price: 50, mode: "show" },
  "عين الدفلى": { price: 50, mode: "show" },
  "ain defla": { price: 50, mode: "show" },
  "عين تموشنت": { price: 50, mode: "show" },
  "ain temouchent": { price: 50, mode: "show" },
  "غليزان": { price: 50, mode: "show" },
  "relizane": { price: 50, mode: "show" },

  "سوق اهراس": { price: 60, mode: "total" },
  "سوق أهراس": { price: 60, mode: "total" },
  "souk ahras": { price: 60, mode: "total" },

  "الأغواط": { price: 70, mode: "total" },
  "الاغواط": { price: 70, mode: "total" },
  "laghouat": { price: 70, mode: "total" },
  "بسكرة": { price: 70, mode: "total" },
  "biskra": { price: 70, mode: "total" },
  "بشار": { price: 70, mode: "total" },
  "bechar": { price: 70, mode: "total" },
  "تبسة": { price: 70, mode: "total" },
  "tebessa": { price: 70, mode: "total" },
  "الجلفة": { price: 70, mode: "total" },
  "djelfa": { price: 70, mode: "total" },
  "ورقلة": { price: 70, mode: "total" },
  "ouargla": { price: 70, mode: "total" },
  "البيض": { price: 70, mode: "total" },
  "el bayadh": { price: 70, mode: "total" },
  "الوادي": { price: 70, mode: "total" },
  "el oued": { price: 70, mode: "total" },
  "خنشلة": { price: 70, mode: "total" },
  "khenchela": { price: 70, mode: "total" },
  "النعامة": { price: 70, mode: "total" },
  "naama": { price: 70, mode: "total" },
  "غرداية": { price: 70, mode: "total" },
  "ghardaia": { price: 70, mode: "total" },
  "أولاد جلال": { price: 70, mode: "total" },
  "اولاد جلال": { price: 70, mode: "total" },
  "ouled djellal": { price: 70, mode: "total" },
  "بني عباس": { price: 70, mode: "total" },
  "beni abbes": { price: 70, mode: "total" },
  "تقرت": { price: 70, mode: "total" },
  "توقرت": { price: 70, mode: "total" },
  "touggourt": { price: 70, mode: "total" },
  "المغير": { price: 70, mode: "total" },
  "el meghaier": { price: 70, mode: "total" },
  "المنيعة": { price: 70, mode: "total" },
  "el menia": { price: 70, mode: "total" },

  "أدرار": { price: 100, mode: "total" },
  "ادرار": { price: 100, mode: "total" },
  "adrar": { price: 100, mode: "total" },
  "تيميمون": { price: 100, mode: "total" },
  "timimoun": { price: 100, mode: "total" }
};

const NO_DELIVERY = [
  "تمنراست",
  "tamanrasset",
  "اليزي",
  "إليزي",
  "illizi",
  "تندوف",
  "tindouf",
  "عين صالح",
  "in salah",
  "عين قزام",
  "in guezzam",
  "جانت",
  "djanet"
];

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
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[ù]/g, "")
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ô]/g, "o")
    .replace(/[ç]/g, "c");
}

function hasAny(text, words) {
  return words.some((w) => text.includes(w.toLowerCase()));
}

function splitMessages(text) {
  return text.split("---").map((x) => x.trim()).filter(Boolean);
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

function findWilaya(text) {
  const t = normalize(text);

  for (const w of NO_DELIVERY) {
    if (t.includes(normalize(w))) return { name: w, unavailable: true };
  }

  for (const [name, data] of Object.entries(DELIVERY)) {
    if (t.includes(normalize(name))) return { name, ...data };
  }

  return null;
}

function isDeliveryQuestion(msg) {
  return hasAny(msg, [
    "توصيل",
    "التوصيل",
    "توصلو",
    "توصلولي",
    "كاين توصيل",
    "شحال التوصيل",
    "livraison",
    "delivery",
    "a domicile",
    "domicile",
    "وصل",
    "تبعثو"
  ]);
}

function isPriceQuestion(msg) {
  return hasAny(msg, [
    "السعر",
    "سعر",
    "بشحال",
    "شحال",
    "بكم",
    "prix",
    "price",
    "bchhal",
    "chhal"
  ]);
}

function isStartMessage(msg) {
  return hasAny(msg, [
    "سلام",
    "salam",
    "slm",
    "cc",
    "bonjour",
    "bonsoir",
    "مهتم",
    "interesse",
    "interested",
    "واش عندكم"
  ]);
}

function isOrderQuestion(msg) {
  return hasAny(msg, [
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
    "كيفاه نشري",
    "commande",
    "commander",
    "ncommandi",
    "ncommondi",
    "nchri",
    "acheter"
  ]);
}

function isUsageQuestion(msg) {
  return hasAny(msg, [
    "استعمال",
    "نستعمل",
    "نستعملها",
    "كيفاش نستعمل",
    "كيفاه نستعمل",
    "كيفاش نديرها",
    "كيفاه نديرها",
    "نحطها",
    "ندهنها",
    "utilisation",
    "utiliser",
    "comment utiliser",
    "mode d'emploi"
  ]);
}

function isProblemMessage(msg) {
  return hasAny(msg, [
    "تجاعيد",
    "rides",
    "wrinkles",
    "هالات",
    "cernes",
    "تصبغات",
    "taches",
    "pigmentation",
    "حبوب",
    "boutons",
    "acne",
    "اثار",
    "آثار",
    "مسام",
    "pores",
    "كلف",
    "melasma",
    "خطوط",
    "وجه",
    "visage",
    "بشرة",
    "peau",
    "شحوب"
  ]);
}

function isTrustQuestion(msg) {
  return hasAny(msg, [
    "يفيدني",
    "يفيد",
    "صح",
    "مضمون",
    "جربت",
    "خايفة",
    "مجرب",
    "جربتوه",
    "صارحيني",
    "فيه نتيجة",
    "كاين نتيجة",
    "resultat",
    "efficace",
    "vrai",
    "garantie"
  ]);
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

  if (hasAny(msg, [
    "وين مقركم", "وين حالين", "نتوما منين", "منين نتوما",
    "وين راكم", "وين المحل", "وين كاينين", "from where"
  ])) {
    return [
      `رانا من العاصمة ${sister} 😊`,
      "والتوصيل متوفر لجميع الولايات لباب الدار 🚚"
    ];
  }

  if (hasAny(msg, ["مكتب", "للمكتب", "المكتب", "bureau"])) {
    return [
      `معندناش للمكتب ${sister} 😊`,
      "يعيطلك الليفرور ويجيبهالك وين بغيتي لباب الدار ولا للمكان اللي تختاريه 🚚"
    ];
  }

  const wilaya = findWilaya(msg);

  if (wilaya && (isDeliveryQuestion(msg) || msg.length <= 30)) {
    if (wilaya.unavailable) {
      return [`للأسف حاليًا ما عندناش توصيل لهذه الولاية ${sister} 😔`];
    }

    const total = PRODUCT_PRICE + wilaya.price;

    if (wilaya.mode === "total") {
      return [
        "خيار الناس 🥰",
        `السعر الإجمالي مع التوصيل لباب الدار ${total} ألف 🚚`
      ];
    }

    return [
      "خيار الناس 🥰",
      `التوصيل ${wilaya.price} ألف لباب الدار 🚚`
    ];
  }

  if (isDeliveryQuestion(msg) && !wilaya) {
    return [`لأي ولاية التوصيل ${sister}؟ 😊`];
  }

  if ((isStartMessage(msg) || isPriceQuestion(msg)) && session.stage === "start") {
    session.stage = "asked_problem";
    return [
      `وعليكم السلام ${sister} 🥰\nعرض خاص صالح لغاية ${getOfferEndDate()} 😍\nمجموعة اللبان الذكر العماني الأصلية فيها:\nزيت + كريم + صابون هدية مجانية 🎁\nالسعر 250 ألف فقط\n+ مصاريف التوصيل حسب الولاية 🚚`,
      `قوليلي برك ${honey}، واش عندك؟ تجاعيد؟ حبوب؟ هالات؟ تصبغات؟ ولا آثار حبوب؟ 😊`
    ];
  }

  if (isPriceQuestion(msg)) {
    return [
      `السعر 250 ألف فقط ${sister} 🥰`,
      "والتوصيل حسب الولاية 🚚"
    ];
  }

if (isProblemMessage(msg)) {
  session.problem = messageText;
  session.stage = "persuasion";

  return [
    `أمممم فهمتك ${sister} 🥰`,
    "شوفي أختي متتحيريش، نعطيك هاذ المجموعة الأصلية كاملة 😍",
    "راهي تفيدك بزاف بإذن الله ❤️",
    "حاجة إيفيكاس ومضمونة ✨",
    "استعمال لمدة أسبوع وتبداي تشوفي نتيجة روعة إن شاء الله 😍"
  ];
}

  if (isOrderQuestion(msg)) {
    session.stage = "order";
    return [`للطلب خليلي الاسم ورقم الهاتف والولاية والبلدية ${sister} 😊`];
  }

  if (isUsageQuestion(msg)) {
    return [
      "تديري الكريم في وجهك وتخليه 20 دقيقة 😊",
      "من بعد تديري الزيت وتخليه 20 دقيقة ثاني",
      "من بعد ترقدي عادي",
      "وغدوة الصباح تغسلي بالصابون",
      `وتقدري تستعملي الكريم صباح كمرطب وتخرجي عادي ${sister} 🥰`
    ];
  }

  if (isTrustQuestion(msg)) {
    return [
      `نعم ${sister} راه مجرب ومضمون بإذن الله 🥰`,
      "رانا نخدمو بيه مدة طويلة والحمد لله",
      "نتائج روعة ومضمونة بشهادة الزبائن تاعنا ❤️",
      `بإذن الله رايحة تشكريه عليه بزاف ${honey} 😍`
    ];
  }

  if (hasAny(msg, ["واش فيها", "وش فيها", "فيها", "مكونات", "ماذا تحتوي", "وش تحتوي"])) {
    return [
      "مجموعة اللبان الذكر العماني فيها:",
      "زيت اللبان الذكر + كريم + صابون هدية مجانية 🎁",
      "السعر 250 ألف فقط 🥰"
    ];
  }

  if (hasAny(msg, ["وقتاش النتيجة", "متى النتيجة", "تبان النتيجة"])) {
    return ["من الأسبوع الأول تبداي تشوفي نتيجة روعة إن شاء الله 😍"];
  }

  if (hasAny(msg, ["غالي", "نقصي", "ساعديني", "ديرولي", "cher"])) {
    return [
      `والله ${sister} بعناها قبل بسعر 290 ألف 🥰`,
      "وحاليًا راهي داخلة في تخفيض، السعر 250 ألف فقط ❤️",
      `بعد أيام ترجع للسعر الأصلي ${honey}`
    ];
  }

  if (hasAny(msg, ["ما عنديش", "مازال ما خلصتش", "زوالية", "ظروفي", "بعد أسبوع"])) {
    return [
      `والله غالب ${sister} 🥰`,
      "حاليًا راهي داخلة في تخفيض فقط وبعد أيام ترجع للسعر الأصلي",
      `ومرحبا بيك في أي وقت ${honey} ❤️`
    ];
  }

  if (hasAny(msg, ["شكرا", "يعطيك الصحة", "merci"])) return [`عفوا ${sister} 🥰`];
  if (hasAny(msg, ["يسلمك"])) return [`يعيشك ${honey} ❤️`];
  if (hasAny(msg, ["يعيشك"])) return [`يسلمك ${sister} 🥰`];
  if (hasAny(msg, ["اوكي", "ok", "okay"])) return [`أوكي ${sister} 🥰`];
  if (hasAny(msg, ["نرجعلك", "نشوف", "نبحثك"])) return [`مرحبا بيك في أي وقت ${honey} 🥰`];

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
لا تكتب 2500 دج ولا 1000 دج.

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
- افهم العربية والفرنسية والدارجة المكتوبة بحروف لاتينية.
- اعتبر الزبون امرأة إلا إذا قال أنه رجل.
- استعمل: أختي، حنونة، شوفي، متتحيريش، يعيشك.
- ممنوع استعمال: حبيبتي، عزيزتي، أهلين، مرحبًا، كيف حالك اليوم.
- لا تبدأ محادثة جديدة إذا الزبون في وسط الحوار.
- لا تعيد العرض إذا المحادثة متقدمة.
- لا تخترع أسعار التوصيل أبدًا.
- إذا سأل عن التوصيل ولم تعرف الولاية اسأله عن الولاية فقط.
- إذا قال: نعم، ايه، صح، كيفاش، يفيدني، أكمل حسب السياق ولا ترجع للبداية.
- إذا لم تفهم، اسأل سؤالا واحدا فقط.
- لا تكتب فقرات طويلة.
- هدفك البيع وجمع الطلب.
`
      },
      { role: "user", content: userMessage }
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

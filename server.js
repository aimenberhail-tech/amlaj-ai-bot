import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "amlaj_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const PRODUCT_PRICE = 250;

const PRODUCT_IMAGE =
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/722752378_857421810771610_3359621745035357339_n.jpg";

const TESTIMONIALS = [
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/691841945_1397443288861054_3626479443604338387_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/692785460_1735975807392570_8219480836668607453_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/692934784_1284550690523632_1988814384120415675_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/693461571_1339739484699260_7997622204193395293_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/694703495_1447011860075227_3500788383516057813_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/694812129_993479616711083_5826408852734996488_n.jpg",
  "https://raw.githubusercontent.com/aimenberhail-tech/amlaj-ai-bot/main/images/696372487_2010436912887010_2192728010404173525_n.jpg"
];

const DELIVERY = {
  "الجزائر": { price: 40, mode: "show" },
  "العاصمة": { price: 40, mode: "show" },
  "alger": { price: 40, mode: "show" },

  "سطيف": { price: 50, mode: "show" },
  "setif": { price: 50, mode: "show" },
  "وهران": { price: 50, mode: "show" },
  "oran": { price: 50, mode: "show" },
  "بجاية": { price: 50, mode: "show" },
  "bejaia": { price: 50, mode: "show" },
  "البليدة": { price: 50, mode: "show" },
  "blida": { price: 50, mode: "show" },
  "عنابة": { price: 50, mode: "show" },
  "annaba": { price: 50, mode: "show" },
  "قسنطينة": { price: 50, mode: "show" },
  "constantine": { price: 50, mode: "show" },
  "باتنة": { price: 50, mode: "show" },
  "batna": { price: 50, mode: "show" },
  "جيجل": { price: 50, mode: "show" },
  "jijel": { price: 50, mode: "show" },
  "بومرداس": { price: 50, mode: "show" },
  "boumerdes": { price: 50, mode: "show" },
  "مستغانم": { price: 50, mode: "show" },
  "mostaganem": { price: 50, mode: "show" },
  "تلمسان": { price: 50, mode: "show" },
  "tlemcen": { price: 50, mode: "show" },
  "تيبازة": { price: 50, mode: "show" },
  "tipaza": { price: 50, mode: "show" },
  "الشلف": { price: 50, mode: "show" },
  "chlef": { price: 50, mode: "show" },
  "تيزي وزو": { price: 50, mode: "show" },
  "tizi ouzou": { price: 50, mode: "show" },
  "المدية": { price: 50, mode: "show" },
  "medea": { price: 50, mode: "show" },

  "سوق اهراس": { price: 60, mode: "total" },
  "souk ahras": { price: 60, mode: "total" },

  "بسكرة": { price: 70, mode: "total" },
  "biskra": { price: 70, mode: "total" },
  "تبسة": { price: 70, mode: "total" },
  "tebessa": { price: 70, mode: "total" },
  "خنشلة": { price: 70, mode: "total" },
  "khenchela": { price: 70, mode: "total" },
  "ورقلة": { price: 70, mode: "total" },
  "ouargla": { price: 70, mode: "total" },
  "غرداية": { price: 70, mode: "total" },
  "ghardaia": { price: 70, mode: "total" },
  "الجلفة": { price: 70, mode: "total" },
  "djelfa": { price: 70, mode: "total" },
  "توقرت": { price: 70, mode: "total" },
  "touggourt": { price: 70, mode: "total" },
  "بشار": { price: 70, mode: "total" },
  "bechar": { price: 70, mode: "total" },
  "الوادي": { price: 70, mode: "total" },
  "el oued": { price: 70, mode: "total" },

  "ادرار": { price: 100, mode: "total" },
  "adrar": { price: 100, mode: "total" },
  "تيميمون": { price: 100, mode: "total" },
  "timimoun": { price: 100, mode: "total" }
};

const NO_DELIVERY = [
  "تمنراست", "tamanrasset",
  "اليزي", "illizi",
  "تندوف", "tindouf",
  "عين صالح", "in salah",
  "عين قزام", "in guezzam",
  "جانت", "djanet"
];

const sessions = new Map();

function getSession(senderId) {
  if (!sessions.has(senderId)) {
    sessions.set(senderId, {
      stage: "start",
      gender: "female",
      name: null,
      phone: null,
      wilaya: null,
      commune: null,
      deliveryPrice: null,
      total: null
    });
  }
  return sessions.get(senderId);
}

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
  const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function getDeliveryEstimate() {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const today = new Date();
  const first = new Date(today);
  const second = new Date(today);

  first.setDate(today.getDate() + 1);
  second.setDate(today.getDate() + 2);

  if (first.getDay() === 5) first.setDate(first.getDate() + 1);
  if (second.getDay() === 5) second.setDate(second.getDate() + 1);

  return `${days[first.getDay()]} ولا ${days[second.getDay()]}`;
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

function isProblem(text) {
  return hasAny(text, [
    "تجاعيد", "هالات", "تصبغات", "حبوب", "اثار", "آثار", "مسام", "كلف", "خطوط",
    "rides", "cernes", "taches", "boutons", "acne", "pores", "visage", "peau"
  ]);
}

function isDeliveryQuestion(text) {
  return hasAny(text, [
    "توصيل", "شحال التوصيل", "كاين توصيل", "livraison", "delivery", "domicile"
  ]);
}

function isDeliveryTimeQuestion(text) {
  return hasAny(text, [
    "وقتاش تلحق", "وقتاش توصل", "وقتاش تجي", "كي نكوموندي اليوم",
    "شحال من نهار", "في قداش", "delai", "délai", "quand", "waktach", "twsel"
  ]);
}

function isOrderQuestion(text) {
  return hasAny(text, [
    "نحب نطلب", "نطلب", "طلب", "طلبية", "نكوموندي", "نأكد", "نشري",
    "commande", "commander", "ncommandi", "acheter"
  ]);
}

function isUsageQuestion(text) {
  return hasAny(text, [
    "استعمال", "نستعمل", "طريقة الاستعمال", "كيفاش نستعمل", "utilisation", "utiliser"
  ]);
}

function isTrustQuestion(text) {
  return hasAny(text, [
    "مجرب", "مضمون", "يفيدني", "فيه نتيجة", "صارحيني", "خايفة", "efficace", "resultat"
  ]);
}

function isProductPhotoQuestion(text) {
  return hasAny(text, [
    "صوريلي", "صورة", "صورة المنتج", "نشوف المنتج", "وريني", "photo", "image", "picture"
  ]);
}

function isProductContentQuestion(text) {
  return hasAny(text, [
    "وش فيها", "واش فيها", "مكونات", "وش تحتوي", "فيها واش", "pack", "le pack", "الباك", "المجموعة"
  ]);
}

function isTotalConfirmation(text) {
  return hasAny(text, [
    "يعني تجيني", "يعني يجي", "كلش", "مع التوصيل", "total", "koulch", "kolch"
  ]);
}

function mainMenuReplies() {
  return [
    { title: "السعر", payload: "MENU_PRICE" },
    { title: "وش فيها؟", payload: "MENU_CONTENT" },
    { title: "طريقة الاستعمال", payload: "MENU_USAGE" },
    { title: "التوصيل", payload: "MENU_DELIVERY" },
    { title: "آراء الزبائن", payload: "MENU_TESTIMONIALS" },
    { title: "صورة المنتج", payload: "MENU_PHOTO" },
    { title: "نحب نطلب", payload: "MENU_ORDER" }
  ];
}

function problemReplies() {
  return [
    { title: "تجاعيد", payload: "PROBLEM_WRINKLES" },
    { title: "هالات", payload: "PROBLEM_DARK" },
    { title: "تصبغات", payload: "PROBLEM_PIGMENT" },
    { title: "آثار حبوب", payload: "PROBLEM_ACNE" },
    { title: "حبوب", payload: "PROBLEM_PIMPLES" }
  ];
}

function afterInfoReplies() {
  return [
    { title: "طريقة الاستعمال", payload: "MENU_USAGE" },
    { title: "التوصيل", payload: "MENU_DELIVERY" },
    { title: "مجرب؟", payload: "MENU_TESTIMONIALS" },
    { title: "صورة المنتج", payload: "MENU_PHOTO" },
    { title: "نحب نطلب", payload: "MENU_ORDER" }
  ];
}

app.get("/", (req, res) => {
  res.send("Dina Shop Menu Bot is running");
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
          const text = event.message?.text || "";
          const payload = event.message?.quick_reply?.payload || event.postback?.payload || null;

          if (senderId) {
            await handleMessage(senderId, text, payload);
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
  }
});

async function handleMessage(senderId, messageText, payload) {
  const session = getSession(senderId);
  const msg = normalize(messageText);
  const sister = session.gender === "male" ? "خويا" : "أختي";
  const honey = session.gender === "male" ? "خويا" : "حنونة";

  if (hasAny(msg, ["انا رجل", "راني رجل", "انا راجل", "راني راجل"])) {
    session.gender = "male";
    await sendQuickReplies(senderId, "مرحبا بيك خويا 😊", mainMenuReplies());
    return;
  }

  if (session.stage === "collect_name" && msg.length >= 2 && !payload) {
    session.name = messageText.trim();
    session.stage = "collect_phone";
    await sendMessage(senderId, `تمام ${sister} 🥰\nخليلي رقم الهاتف`);
    return;
  }

  if (session.stage === "collect_phone" && !payload) {
    const digits = messageText.replace(/\D/g, "");
    if (digits.length >= 8) {
      session.phone = digits;
      session.stage = "collect_wilaya";
      await sendMessage(senderId, "خليلي الولاية أختي 😊");
      return;
    }
    return;
  }

  if (session.stage === "collect_wilaya" && !payload) {
    const wilaya = findWilaya(msg);
    if (!wilaya || wilaya.unavailable) return;

    session.wilaya = wilaya.name;
    session.deliveryPrice = wilaya.price;
    session.total = PRODUCT_PRICE + wilaya.price;
    session.stage = "collect_commune";
    await sendMessage(senderId, "خليلي البلدية أختي 😊");
    return;
  }

  if (session.stage === "collect_commune" && msg.length >= 2 && !payload) {
    session.commune = messageText.trim();
    session.stage = "done";

    await sendMessage(
      senderId,
      `تم تسجيل الطلبية ${sister} ✅\nالاسم: ${session.name}\nالهاتف: ${session.phone}\nالولاية: ${session.wilaya}\nالبلدية: ${session.commune}\nالسعر الإجمالي: ${session.total} ألف`
    );
    await sendMessage(senderId, "يعيطلك الليفرور قبل ما يجيك الطلب إن شاء الله 🚚🥰");
    return;
  }

  if (!payload && session.stage === "start") {
    await sendQuickReplies(
      senderId,
      "مرحبا أختي 🥰\nاختاري وش حابة تعرفي على مجموعة اللبان الذكر العماني الأصلية:",
      mainMenuReplies()
    );
    session.stage = "menu";
    return;
  }

  if (payload === "MENU_PRICE") {
    await sendMessage(
      senderId,
      `عرض خاص صالح لغاية ${getOfferEndDate()} 😍\nمجموعة اللبان الذكر العماني الأصلية فيها زيت + كريم + صابون هدية مجانية 🎁\nالسعر 250 ألف فقط\n+ مصاريف التوصيل حسب الولاية 🚚`
    );
    await sendQuickReplies(senderId, `واش عندك ${honey}؟`, problemReplies());
    return;
  }

  if (payload && payload.startsWith("PROBLEM_")) {
    await persuasionFlow(senderId, sister, honey);
    return;
  }

  if (payload === "MENU_CONTENT") {
    await sendMessage(senderId, "مجموعة اللبان الذكر العماني فيها زيت + كريم + صابون هدية مجانية 🎁");
    await sendImage(senderId, PRODUCT_IMAGE);
    await sendQuickReplies(senderId, "السعر 250 ألف فقط 🥰", afterInfoReplies());
    return;
  }

  if (payload === "MENU_PHOTO") {
    await sendMessage(senderId, `هادي هي المجموعة ${sister} 🥰`);
    await sendImage(senderId, PRODUCT_IMAGE);
    await sendQuickReplies(senderId, "فيها زيت + كريم + صابون هدية مجانية 🎁", afterInfoReplies());
    return;
  }

  if (payload === "MENU_USAGE") {
    await sendQuickReplies(
      senderId,
      "تديري الكريم في وجهك وتخليه 20 دقيقة 😊\nمن بعد تديري الزيت وتخليه 20 دقيقة ثاني\nمن بعد ترقدي عادي\nوغدوة الصباح تغسلي بالصابون\nوتقدري تستعملي الكريم صباح كمرطب وتخرجي عادي 🥰",
      afterInfoReplies()
    );
    return;
  }

  if (payload === "MENU_TESTIMONIALS") {
    await sendMessage(senderId, `نعم ${sister} راه مجرب ومضمون بإذن الله 🥰`);
    await sendTestimonials(senderId);
    await sendQuickReplies(senderId, "نتائج روعة ومضمونة بشهادة الزبائن ❤️", afterInfoReplies());
    return;
  }

  if (payload === "MENU_DELIVERY") {
    session.stage = "waiting_delivery_wilaya";
    await sendMessage(senderId, "اكتبي اسم الولاية فقط أختي 😊");
    return;
  }

  if (payload === "MENU_ORDER") {
    session.stage = "collect_name";
    await sendMessage(senderId, `تمام ${sister} 🥰\nخليلي الاسم فقط باش نثبت الطلبية`);
    return;
  }

  if (isProblem(msg)) {
    await persuasionFlow(senderId, sister, honey);
    return;
  }

  if (isDeliveryTimeQuestion(msg)) {
    await sendMessage(senderId, `إذا كومونديتي اليوم ${sister}، غالبًا طلبيتك تلحقك بين ${getDeliveryEstimate()} إن شاء الله 🚚🥰`);
    return;
  }

  const wilaya = findWilaya(msg);
  if (wilaya && (isDeliveryQuestion(msg) || session.stage === "waiting_delivery_wilaya" || msg.length <= 35)) {
    if (wilaya.unavailable) {
      await sendMessage(senderId, `للأسف حاليًا ما عندناش توصيل لهذه الولاية ${sister} 😔`);
      return;
    }

    const total = PRODUCT_PRICE + wilaya.price;
    session.total = total;

    if (wilaya.mode === "total") {
      await sendQuickReplies(senderId, `خيار الناس 🥰\nالسعر الإجمالي مع التوصيل لباب الدار ${total} ألف 🚚`, afterInfoReplies());
    } else {
      await sendQuickReplies(senderId, `خيار الناس 🥰\nالتوصيل ${wilaya.price} ألف لباب الدار 🚚`, afterInfoReplies());
    }
    return;
  }

  if (isDeliveryQuestion(msg)) {
    session.stage = "waiting_delivery_wilaya";
    await sendMessage(senderId, "اكتبي اسم الولاية فقط أختي 😊");
    return;
  }

  if (isProductContentQuestion(msg)) {
    await sendMessage(senderId, "مجموعة اللبان الذكر العماني فيها زيت + كريم + صابون هدية مجانية 🎁");
    await sendImage(senderId, PRODUCT_IMAGE);
    await sendQuickReplies(senderId, "السعر 250 ألف فقط 🥰", afterInfoReplies());
    return;
  }

  if (isProductPhotoQuestion(msg)) {
    await sendMessage(senderId, `هادي هي المجموعة ${sister} 🥰`);
    await sendImage(senderId, PRODUCT_IMAGE);
    await sendQuickReplies(senderId, "فيها زيت + كريم + صابون هدية مجانية 🎁", afterInfoReplies());
    return;
  }

  if (isUsageQuestion(msg)) {
    await sendQuickReplies(
      senderId,
      "تديري الكريم في وجهك وتخليه 20 دقيقة 😊\nمن بعد تديري الزيت وتخليه 20 دقيقة ثاني\nوغدوة الصباح تغسلي بالصابون 🥰",
      afterInfoReplies()
    );
    return;
  }

  if (isTrustQuestion(msg)) {
    await sendMessage(senderId, `نعم ${sister} راه مجرب ومضمون بإذن الله 🥰`);
    await sendTestimonials(senderId);
    await sendQuickReplies(senderId, "بإذن الله رايحة تشكريه عليه بزاف حنونة 😍", afterInfoReplies());
    return;
  }

  if (isOrderQuestion(msg)) {
    session.stage = "collect_name";
    await sendMessage(senderId, `تمام ${sister} 🥰\nخليلي الاسم فقط باش نثبت الطلبية`);
    return;
  }

  if (isTotalConfirmation(msg)) {
    await sendMessage(senderId, `نعم ${sister} 🥰`);
    await sendQuickReplies(senderId, "هذا هو السعر مع التوصيل لباب الدار 🚚", [
      { title: "نحب نطلب", payload: "MENU_ORDER" },
      { title: "طريقة الاستعمال", payload: "MENU_USAGE" },
      { title: "آراء الزبائن", payload: "MENU_TESTIMONIALS" }
    ]);
    return;
  }

  return;
}

async function persuasionFlow(senderId, sister, honey) {
  await sendMessage(senderId, `أمممم فهمتك ${sister} 🥰`);
  await wait(400);
  await sendMessage(senderId, "شوفي أختي متتحيريش، نعطيك هاذ المجموعة الأصلية كاملة 😍");
  await wait(400);
  await sendMessage(senderId, "راهي تفيدك بزاف بإذن الله ❤️");
  await wait(400);
  await sendMessage(senderId, "حاجة إيفيكاس ومضمونة ✨");
  await wait(400);
  await sendMessage(senderId, "استعمال لمدة أسبوع وتبداي تشوفي نتيجة روعة إن شاء الله 😍");
  await wait(500);

  await sendTestimonials(senderId);

  await sendQuickReplies(
    senderId,
    `نتائج روعة ومضمونة 🥰\nونزيدوك معاها ضمان لمدة شهر كامل بعد الاستعمال ❤️\nيعني إذا ما خرجتش عليك النتيجة تقدري تتصلي بينا ونرجعولك دراهمك ${honey} 🌹`,
    afterInfoReplies()
  );
}

async function sendTestimonials(senderId) {
  for (const image of TESTIMONIALS) {
    await sendImage(senderId, image);
    await wait(450);
  }
}

async function sendQuickReplies(senderId, text, replies) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: senderId },
      message: {
        text,
        quick_replies: replies.slice(0, 13).map((r) => ({
          content_type: "text",
          title: r.title,
          payload: r.payload
        }))
      }
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
            payload: { url: imageUrl, is_reusable: true }
          }
        }
      }
    );
  } catch (error) {
    console.error("Image send error:", error.response?.data || error.message);
  }
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

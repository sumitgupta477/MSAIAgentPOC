const AWS = require("aws-sdk");
const OpenAI = require("openai");

// ---------------- Hardcoded configuration ----------------
const CASES_TABLE = "CasesTable";
const SES_FROM = "sumitgupta477@gmail.com";
const ADMIN_EMAIL = "sumitgupta477@gmail.com";
const AWS_REGION = "us-east-1";
const OPENAI_API_KEY = "<Add-Your-Open-Api-Key>";

// AWS Clients
const dynamo = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION });
const ses = new AWS.SES({ region: AWS_REGION });

// OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Lazy UUID generator
async function getUuidV4() {
  const { v4 } = await import("uuid");
  return v4();
}

// ---------------- Lambda Handler ----------------
exports.handler = async (event) => {
  try {
    // Parse JSON safely
    let body = {};
    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }

    const userText = body.message || body.inputText;
    if (!userText) return reply("No message provided");

    // ---------------- AI Analysis (OpenAI) ----------------
    const ai = await analyzeWithAI(userText);

    // ---------------- Case Decision ----------------
    const createCaseKeywords = ["case", "issue", "problem", "ticket"];
    const shouldCreateCase = createCaseKeywords.some((keyword) =>
      userText.toLowerCase().includes(keyword)
    );

    if (!shouldCreateCase) {
      // No case: just return real AI reply
      return reply(ai.reply);
    }

    // ---------------- Create Case ----------------
    const caseId = await getUuidV4();
    const item = {
      case_id: caseId,
      input: userText,
      priority: body.priority || "normal",
      user: body.user || "Anonymous",
      created_at: new Date().toISOString(),
    };

    // Save to DynamoDB
    await dynamo.put({ TableName: CASES_TABLE, Item: item }).promise();

    // Send Email
    await sendEmail(caseId, item);

    return reply(`Case created successfully: ${caseId}`);
  } catch (err) {
    console.error("Lambda Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

/* ---------------- OpenAI AI ---------------- */
async function analyzeWithAI(text) {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: text }
      ],
      max_tokens: 300,
    });

    return {
      reply: resp.choices[0].message.content.trim()
    };

  } catch (err) {
    console.error("OpenAI Error:", err);
    return { reply: "Sorry, AI is temporarily unavailable." };
  }
}

/* ---------------- Email ---------------- */
async function sendEmail(caseId, data) {
  const emailBody = `
A new case has been created.

Case ID: ${caseId}
Priority: ${data.priority}

Message:
${data.input}

Created At:
${data.created_at}
`;

  return ses.sendEmail({
    Source: SES_FROM,
    Destination: { ToAddresses: [ADMIN_EMAIL] },
    Message: {
      Subject: { Data: `Case created ${caseId}` },
      Body: { Text: { Data: emailBody } },
    },
  }).promise();
}

/* ---------------- Utils ---------------- */
function reply(msg) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ response: msg }),
  };
}
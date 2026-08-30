// ── AI Service (Google Gemini) ───────────────────────────────────────────
// Sends user study context to Gemini and returns motivational text or
// answers to study-related questions.

const GEMINI_API_KEY = "AIzaSyBxHgyUqHSVeXg3IG7arxrhMF52jN1ABS0";

// gemini-2.5-flash — confirmed working with this API key
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";


/**
 * Build a context string from the user's study data so Gemini can
 * personalise its responses.
 */
function buildStudyContext(studyData = {}) {
    const {
        subjects = [],
        subjectProgress = [],
        summary = null,
        todayPlans = [],
        examName = "",
    } = studyData;

    const lines = [];

    if (examName) lines.push(`Exam: ${examName}`);

    if (summary) {
        lines.push(`Overall progress: ${summary.overall_progress ?? 0}%`);
        lines.push(
            `Completed ${summary.completed_hours ?? 0} out of ${summary.total_required_hours ?? 0} required study hours.`
        );
        lines.push(`Today's study target: ${summary.today_study_hours ?? 0} hrs`);
        lines.push(`Completed today: ${summary.completed_today_hours ?? 0} hrs`);
    }

    if (subjectProgress.length > 0) {
        lines.push("Subject progress:");
        subjectProgress.forEach((s) => {
            lines.push(
                `  - ${s.subject_name}: ${s.progress_percentage ?? 0}% done (${s.completed_hours ?? 0}/${s.required_hours ?? 0} hrs)`
            );
        });
    }

    if (todayPlans.length > 0) {
        lines.push("Today's study sessions:");
        todayPlans.forEach((p) => {
            lines.push(
                `  - ${p.subject_name}: ${p.study_hours} hrs — ${p.completed ? "✓ completed" : "pending"}`
            );
        });
    }

    return lines.join("\n");
}

/**
 * Call Gemini with the given prompt string.
 * Tries gemini-1.5-flash first; any error is logged with the real message.
 */
async function callGemini(prompt) {
    const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 400,
        },
    });


    const headers = { "Content-Type": "application/json" };

    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers,
        body,
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        console.error("[AI] Gemini API error →", msg, errBody);
        throw new Error(msg);
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // Gemini sometimes wraps JSON in ```json fences despite instructions — strip them
    return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}


/**
 * Get a personalised daily motivation quote based on user study data.
 * Returns { quote, insight }
 */
export async function getDailyMotivation(studyData = {}) {
    const context = buildStudyContext(studyData);

    const prompt = `You are a supportive and motivating study coach for a student preparing for an exam.

Here is the student's current study status:
${context || "The student has just started their study journey."}

Give ONE short, powerful motivational quote (max 20 words) and ONE brief practical insight (1-2 sentences) about how they should approach today's study.

Respond in this exact JSON format (no markdown, no extra text):
{"quote":"...","insight":"..."}`;

    const raw = await callGemini(prompt);

    try {
        const parsed = JSON.parse(raw);
        return {
            quote: parsed.quote || "Every session counts. Keep going!",
            insight: parsed.insight || "Focus on your weakest subjects today.",
        };
    } catch {
        // fallback if Gemini doesn't return valid JSON
        return {
            quote: "Small steps every day lead to great results.",
            insight:
                "Stay consistent with your schedule and celebrate every completed session.",
        };
    }
}

/**
 * Chat with the AI — ask a study-related question.
 * Returns a plain text response string.
 */
export async function chatWithAI(userMessage, studyData = {}, chatHistory = []) {
    const context = buildStudyContext(studyData);

    const historyText = chatHistory
        .slice(-6) // keep last 3 pairs
        .map((m) => `${m.role === "user" ? "Student" : "Coach"}: ${m.text}`)
        .join("\n");

    const prompt = `You are an encouraging AI study coach for a student.

Student's current study status:
${context || "The student has just started their study journey."}

${historyText ? `Previous conversation:\n${historyText}\n` : ""}
Student: ${userMessage}
Coach (respond helpfully in 2-4 sentences, be warm and specific to their data):`;

    return await callGemini(prompt);
}

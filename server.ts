import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Lazy load Gemini Client to avoid crash if API key is not present on start
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Use JSON middleware with reasonable limit
  app.use(express.json({ limit: "10mb" }));

  const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

  // Load Firebase configuration dynamically from firebase-applet-config.json
  const FIREBASE_CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");
  let firestoreDb: any = null;

  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf-8"));
      const apps = getApps();
      const firebaseApp = apps.length === 0 ? initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      }) : apps[0];
      firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
      console.log("Firestore successfully initialized for database ID:", config.firestoreDatabaseId || "(default)");
    } catch (e) {
      console.error("Failed to initialize Firebase app or Firestore", e);
    }
  }

  // Helper to read database (checks Firestore first, falls back to local cache db.json)
  const readDatabase = async () => {
    // 1. Try to fetch from Firestore cloud database
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, "clinica_data", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          // Warm up local cache as backup
          try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(cloudData, null, 2), "utf-8");
          } catch (cacheErr) {
            console.error("Failed to update local db.json cache", cacheErr);
          }
          return cloudData;
        } else {
          console.log("No clinica_data document found in Firestore. Falling back to local db.json.");
        }
      } catch (firestoreErr) {
        console.error("Error reading from Firestore, falling back to local cache", firestoreErr);
      }
    }

    // 2. Fallback to local db.json
    if (fs.existsSync(DB_PATH)) {
      try {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        return JSON.parse(data);
      } catch (e) {
        console.error("Error reading db.json", e);
      }
    }
    return null;
  };

  // Helper to write database (saves to both Firestore and local cache db.json)
  const writeDatabase = async (data: any) => {
    let success = false;

    // 1. Save to local cache first so we always have immediate backup
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
      success = true;
    } catch (e) {
      console.error("Error writing local db.json cache", e);
    }

    // 2. Persist to Firestore cloud database
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, "clinica_data", "main");
        await setDoc(docRef, data);
        console.log("Database successfully synced with Firestore cloud!");
        success = true;
      } catch (firestoreErr) {
        console.error("Error syncing with Firestore cloud", firestoreErr);
      }
    }

    return success;
  };

  // API Route: Get all clinical data
  app.get("/api/data", async (req, res) => {
    const dbData = await readDatabase();
    if (dbData) {
      res.json({ success: true, data: dbData });
    } else {
      res.json({ success: false, message: "No custom database found. Loading defaults." });
    }
  });

  // API Route: Save clinical data
  app.post("/api/data", async (req, res) => {
    const dataToSave = req.body;
    const success = await writeDatabase(dataToSave);
    if (success) {
      res.json({ success: true, message: "Database updated successfully on server!" });
    } else {
      res.status(500).json({ success: false, message: "Failed to write database to server." });
    }
  });

  // API Route: Chatbot AI Assistant
  app.post("/api/ai/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Invalid chat history messages payload." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return beautiful fallback responses if Gemini API Key is missing, ensuring a robust user experience
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let fallbackText = "Olá! Sou o Assistente Virtual da Ânima Zen. No momento estou operando no modo de demonstração local. Como posso ajudar com suas dúvidas sobre massagens, combos ou agendamento?";
      if (lastUserMsg.includes("preço") || lastUserMsg.includes("valor") || lastUserMsg.includes("quanto")) {
        fallbackText = "Nossos valores são bastante convidativos: as Massagens Individuais começam a partir de R$ 90 (Reflexologia) até R$ 160 (Pedras Quentes). Temos também Combos de SPA completos de R$ 170 a R$ 230! Qual deles você gostaria de conhecer melhor?";
      } else if (lastUserMsg.includes("onde") || lastUserMsg.includes("endereço") || lastUserMsg.includes("local")) {
        fallbackText = "Nosso santuário está localizado na Rua Joana Angélica, 13 - Conj. Maria Tomasia, Fortaleza - CE. Venha nos visitar ou agende seu horário pelo site!";
      } else if (lastUserMsg.includes("fidelidade") || lastUserMsg.includes("cartão")) {
        fallbackText = "Temos um Programa de Fidelidade maravilhoso! A cada 10 massagens que você realizar na Ânima Zen, a 11ª é um presente relaxante de 60 minutos inteiramente grátis! Basta inserir seu WhatsApp na área de fidelidade do site.";
      } else if (lastUserMsg.includes("agendar") || lastUserMsg.includes("marcar")) {
        fallbackText = "Para realizar um agendamento, basta clicar no botão 'Agendar Horário' no topo da tela, escolher o serviço e o melhor dia e horário para você! O pagamento do sinal é via PIX, super prático!";
      } else if (lastUserMsg.includes("toque") || lastUserMsg.includes("safadeza") || lastUserMsg.includes("sexual")) {
        fallbackText = "Atenção: A Ânima Zen trabalha estritamente com massoterapia profissional, terapêutica e humanizada para saúde e relaxamento. Seguimos a filosofia 'Não é Toque!'. Não realizamos nenhum tipo de serviço de cunho sexual.";
      }
      return res.json({ success: true, text: fallbackText });
    }

    try {
      // Map frontend-friendly messages to Gemini API formats
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const systemInstruction = `Você é o Assistente Virtual Ânima Zen, um assistente inteligente, extremamente atencioso, calmo, gentil e prestativo, representando o estúdio de bem-estar e massoterapia 'Ânima Zen' comandado pela profissional Bia Lopes em Fortaleza, CE.
Sua filosofia fundamental é "Não é Toque! É Massoterapia Terapêutica Humana e Bem-estar". Não temos nenhuma associação com serviços eróticos, vulgares ou sensuais de qualquer tipo. Nosso trabalho é ético, clínico, de SPA de alto padrão, relaxante e voltado exclusivamente para a saúde física, alívio de dores, redução de ansiedade e autocuidado.
Aqui estão as informações do santuário que você deve dominar e usar para responder de forma exata e profissional:
- Endereço da clínica: Rua Joana Angélica, 13 - Conj. Maria Tomasia, Fortaleza - CE.
- Contato de WhatsApp para suporte direto: (85) 99634-1602.
- Serviços Individuais e Preços:
  * Massagem Relaxante Ânima (60 min) - R$ 120 (Alivia estresse e tensões do dia a dia, restaura o equilíbrio físico).
  * Massagem Terapêutica Profunda (60 min) - R$ 140 (Foco em liberar pontos de gatilho, contraturas musculares e dores nas costas).
  * Drenagem Linfática Corporal (75 min) - R$ 130 (Reduz inchaço, ativa circulação e elimina toxinas corporais).
  * Massagem Integrativa com Pedras Quentes (80 min) - R$ 160 (Calor de pedras vulcânicas + óleos florais aquecidos).
  * Reflexologia Podal (45 min) - R$ 90 (Pontos reflexos nos pés que reequilibram o corpo inteiro e reduzem cansaço).
- Combos Especiais de SPA (perfeitos para presentes ou autocuidado supremo):
  * Combo Bem-Estar Supremo (80 min) - R$ 170 (Massagem Relaxante de 60 min + Escalda-pés terapêutico com lavanda e calêndula de 20 min + Servido com Chá Orgânico).
  * Combo Renovação Absoluta (90 min) - R$ 210 (Massagem Terapêutica de 60 min + Reflexologia Podal de 30 min + Alinhamento de Cristais + Aromaterapia).
  * Combo Spa Detox & Face (110 min) - R$ 230 (Drenagem Corporal Completa de 75 min + Massagem Facial Revitalizante de 20 min + Escalda-pés com argila e menta).
- Programa de Fidelidade: A cada 10 sessões realizadas (confirmadas), o cliente ganha 1 Massagem Relaxante de 60 minutos grátis! No site, na aba 'Fidelidade & Histórico', ele insere o WhatsApp e vê seu progresso (selos acumulados) e histórico.
- Ficha de Anamnese: É uma ficha de saúde importante para avaliar se há contraindicações e garantir a segurança do cliente. É preenchida de forma simples e interativa na tela do site (ou via Google Forms).
- Agendamento: Pode ser feito no site. O cliente escolhe o serviço, escolhe data/horário, insere seus dados e realiza a reserva com segurança. O sinal é pago via PIX, e o comprovante pode ser enviado ao nosso WhatsApp.

Responda sempre em português (PT-BR) de forma serena, empática e acolhedora, como se o cliente estivesse em um SPA de alto padrão. Evite jargões médicos incompreensíveis. Destaque sempre o cuidado personalizado de Bia Lopes. Use formatação limpa (como negritos em palavras-chave) para facilitar a leitura. Mantenha as respostas amigáveis e concisas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ success: true, text: response.text });
    } catch (e: any) {
      console.error("Error in Gemini API Assistant route:", e);
      res.status(500).json({ success: false, message: "Erro ao processar conversa com o assistente inteligente." });
    }
  });

  // API Route: Reset database
  app.post("/api/reset", (req, res) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
      }
      res.json({ success: true, message: "Database reset to defaults on server." });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to delete database on server." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

// ========================================
// IMPORTS E CONFIGURAÇÕES
// ========================================
const qrcode = require("qrcode-terminal");
const {
  Client,
  Buttons,
  List,
  MessageMedia,
  LocalAuth,
} = require("whatsapp-web.js");
const puppeteer = require("puppeteer");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CONFIGURAÇÃO DO CLIENTE WHATSAPP
// ========================================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
      "--window-size=1920,1080",
    ],
    executablePath:
      "/home/ubuntu/.cache/puppeteer/chrome/linux-137.0.7151.70/chrome-linux64/chrome",
  },
});

// ========================================
// EVENTOS DO CLIENTE WHATSAPP
// ========================================
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }); // Mostra o QR code no terminal
  const qrPath = path.join(__dirname, "whatsapp-qr.txt");
  fs.writeFileSync(qrPath, qr);
  console.log("QR Code salvo em:", qrPath);
});

client.on("ready", () => {
  console.log("Tudo certo! WhatsApp conectado.");
});

client.initialize();

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ========================================
// DADOS DOS PLANOS
// ========================================
const planos = {
  1: {
    nome: "Landing Page Profissional",
    preco: "R$ 99,90",
    periodo: "único",
    recursos: [
      "Design exclusivo e responsivo",
      "1 página otimizada para conversão",
      "Formulário de contato integrado",
      "Integração com WhatsApp",
      "SEO básico incluso",
      "Suporte por 30 dias",
      "Entrega em até 7 dias",
    ],
  },
  2: {
    nome: "Plano de Alterações",
    preco: "R$ 57,90",
    periodo: "mês",
    recursos: [
      "5 alterações mensais",
      "Atualizações de conteúdo",
      "Ajustes de design",
      "Suporte prioritário",
      "Cancelamento a qualquer momento",
      "Sem fidelidade",
      "Sem multa de cancelamento",
    ],
  },
};

// ========================================
// ARMAZENAMENTO DE DADOS
// ========================================
const respostasUsuarios = new Map();

// ========================================
// PROCESSAMENTO DE MENSAGENS
// ========================================
client.on("message", async (msg) => {
  if (msg.from.endsWith("@c.us")) {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;
    const userId = msg.from;

    // Verifica se é uma mensagem inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
      respostasUsuarios.delete(userId); // Limpa qualquer estado anterior
      await iniciarConversa(msg, name);
    }
    // Menu principal - sempre funciona, independente do estado
    else if (msg.body.match(/^[1-4]$/)) {
      respostasUsuarios.delete(userId); // Limpa qualquer estado anterior
      await processarMenuPrincipal(msg, userId);
    }
    // Seleção de plano (quando usuário está vendo os planos)
    else if (
      msg.body.match(/^[1-2]$/) &&
      respostasUsuarios.has(userId) &&
      respostasUsuarios.get(userId).visualizandoPlanos
    ) {
      await processarSelecaoPlano(msg, userId);
    }
    // Opção voltar
    else if (
      msg.body.toLowerCase() === "voltar" &&
      respostasUsuarios.has(userId)
    ) {
      respostasUsuarios.delete(userId);
      await iniciarConversa(msg, name);
    }
    // Processamento da resposta "finalizar"
    else if (
      respostasUsuarios.has(userId) &&
      msg.body.toLowerCase() === "finalizar"
    ) {
      await encaminharParaEspecialista(msg);
      respostasUsuarios.delete(userId);
    }
  }
});

// ========================================
// FUNÇÕES DO MENU PRINCIPAL
// ========================================

/**
 * Inicia a conversa com o usuário
 */
async function iniciarConversa(msg, name) {
  await delay(1000);
  await client.sendMessage(
    msg.from,
    ` *Olá, ${name.split(" ")[0]}!* \n\n` +
      `Sou o *assistente virtual* da *FGDIGITAL*! \n\n` +
      `Estou aqui para ajudar você a criar uma landing page profissional que vai transformar sua presença digital! \n\n` +
      `Como posso ajudar? Escolha uma opção:\n\n` +
      `1️⃣ - *Criar minha Landing Page* \n` +
      `2️⃣ - *Conhecer nossos Planos* \n` +
      `3️⃣ - *Nossos Serviços* \n` +
      `4️⃣ - *Falar com um Especialista* \n\n` +
      `Digite o número da opção desejada! `
  );
}

/**
 * Processa a seleção do menu principal
 */
async function processarMenuPrincipal(msg, userId) {
  const opcao = msg.body;

  switch (opcao) {
    case "1":
      await iniciarColetaLandingPage(msg, userId);
      break;
    case "2":
      await mostrarPlanos(msg);
      break;
    case "3":
      await mostrarServicos(msg);
      break;
    case "4":
      await encaminharParaEspecialista(msg);
      break;
  }
}

// ========================================
// FUNÇÕES DE LANDING PAGE
// ========================================

/**
 * Inicia o processo de coleta de informações para landing page
 */
async function iniciarColetaLandingPage(msg, userId) {
  // Marca o usuário como aguardando finalização
  respostasUsuarios.set(userId, {
    aguardandoFinalizacao: true,
  });

  await client.sendMessage(
    msg.from,
    " *Criar minha Landing Page* \n\n" +
      "Perfeito! Para começarmos a criar sua landing page profissional, precisamos coletar algumas informações importantes.\n\n" +
      "📝 *Acesse nosso formulário personalizado:*\n" +
      "🔗 https://forms.google.com/seu-formulario-aqui\n\n" +
      "✅ Preencha todas as informações solicitadas\n" +
      "📤 Após ter preenchido e enviado, digite *finalizar* para encaminhar a solicitação para o nosso time de desenvolvedores\n\n" +
      "Assim que você confirmar, um de nossos especialistas entrará em contato em até 30 minutos para apresentar sua proposta personalizada! 🚀\n\n" +
      "🔙 Para voltar ao menu principal, digite *menu*"
  );
}

// ========================================
// FUNÇÕES DE PLANOS E SERVIÇOS
// ========================================

/**
 * Processa a seleção de plano pelo usuário
 */
async function processarSelecaoPlano(msg, userId) {
  const planoSelecionado = msg.body;
  const plano = planos[planoSelecionado];

  if (plano) {
    // Atualiza o estado do usuário para aguardar finalização
    respostasUsuarios.set(userId, {
      aguardandoFinalizacao: true,
      planoSelecionado: plano.nome,
      precoPlano: plano.preco,
    });

    await client.sendMessage(
      msg.from,
      ` *Fico muito feliz por escolher a gente!* \n\n` +
        `Você selecionou o plano: *${plano.nome}*\n` +
        `Preço: ${plano.preco}/${plano.periodo}\n\n` +
        `Para começarmos a trabalhar juntos e criar algo incrível para você, precisamos coletar algumas informações importantes.\n\n` +
        `📝 *Acesse nosso formulário personalizado:*\n` +
        `🔗 https://qyrz011h.forms.app/briefing\n\n` +
        `✅ Preencha todas as informações solicitadas\n` +
        `📤 Após ter preenchido e enviado, digite *finalizar* para encaminhar a solicitação para o nosso time de especialistas\n\n` +
        `Assim que você confirmar, um de nossos especialistas entrará em contato em até 30 minutos para finalizar sua contratação e começar a criar sua landing page! 🚀\n\n` +
        `🔙 Para voltar ao menu principal, digite *menu*`
    );
  }
}

/**
 * Mostra os planos disponíveis
 */
async function mostrarPlanos(msg) {
  // Marca o usuário como visualizando planos
  respostasUsuarios.set(msg.from, {
    visualizandoPlanos: true,
  });

  let mensagem = "💎 *Nossos Planos* 💎\n\n";

  for (const [id, plano] of Object.entries(planos)) {
    mensagem += `*${plano.nome}*\n`;
    mensagem += `Preço: ${plano.preco}/${plano.periodo}\n`;
    mensagem += "Recursos incluídos:\n";
    plano.recursos.forEach((recurso) => {
      mensagem += `✓ ${recurso}\n`;
    });
    mensagem += "\n";
  }

  mensagem += " *Escolha seu plano:*\n";
  mensagem += "1️⃣ - *Landing Page Profissional* (R$ 99,90)\n";
  mensagem += "2️⃣ - *Plano de Alterações* (R$ 57,90/mês)\n\n";
  mensagem +=
    "Digite o número do plano desejado ou *voltar* para retornar ao menu principal!";

  await client.sendMessage(msg.from, mensagem);
}

/**
 * Mostra os serviços oferecidos
 */
async function mostrarServicos(msg) {
  let mensagem = "🛠️ *Nossos Serviços* 🛠️\n\n";

  mensagem += "🎨 *Landing Pages*\n";
  mensagem += "• Design exclusivo e responsivo\n";
  mensagem += "• Otimizadas para conversão\n";
  mensagem += "• Integração com WhatsApp\n";
  mensagem += "• SEO básico incluso\n\n";

  mensagem += "🌐 *Sites*\n";
  mensagem += "• Sites institucionais\n";
  mensagem += "• E-commerce\n";
  mensagem += "• Blogs e portais\n";
  mensagem += "• Sistemas personalizados\n\n";

  mensagem += "🤖 *Chatbot*\n";
  mensagem += "• Atendimento automatizado 24/7\n";
  mensagem += "• Integração com WhatsApp Business\n";
  mensagem += "• Respostas personalizadas\n";
  mensagem += "• Qualificação de leads\n\n";

  mensagem += "🎭 *Designer*\n";
  mensagem += "• Logos e identidade visual\n";
  mensagem += "• Banners e materiais promocionais\n";
  mensagem += "• Social media design\n";
  mensagem += "• UI/UX design\n\n";

  mensagem += "Para começar a criar sua landing page agora, digite *1*!\n";
  mensagem += "Para falar com um especialista, digite *4*!";

  await client.sendMessage(msg.from, mensagem);
}

// ========================================
// FUNÇÕES DE ATENDIMENTO
// ========================================

/**
 * Encaminha o usuário para um especialista
 */
async function encaminharParaEspecialista(msg) {
  await client.sendMessage(
    msg.from,
    "👨‍💻 *Falar com Especialista*\n\n" +
      "Um de nossos especialistas entrará em contato em até 1 hora útil.\n\n" +
      "Enquanto isso, que tal conhecer nossos planos? Digite *2* para ver as opções disponíveis!"
  );
}
// ========================================
// CONFIGURAÇÃO DO SERVIDOR WEB
// ========================================
app.get("/", (req, res) => {
  res.send("Bot de WhatsApp rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});

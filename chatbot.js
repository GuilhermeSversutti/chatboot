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

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Informações dos planos
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

// Informações sobre a empresa
const sobreNos = {
  missao:
    "Transformar ideias em resultados digitais através de landing pages profissionais",
  diferencial: [
    "Mais de 500 empresas atendidas",
    "Taxa média de conversão acima de 30%",
    "Tempo médio de carregamento otimizado",
    "Suporte 24/7",
    "Entrega rápida em até 7 dias",
    "Satisfação garantida ou seu dinheiro de volta",
  ],
  contato: {
    email: "fgdigitalLandipage@gmail.com",
    telefone: "(11) 99391-5926",
  },
};

// Perguntas para coleta de informações da landing page
const perguntasLandingPage = [
  {
    id: "objetivo",
    pergunta:
      "🔹 *1. Qual é o principal objetivo da sua landing page?*\n\n" +
      "1 - Vender um produto ou serviço\n" +
      "2 - Captar contatos (leads)\n" +
      "3 - Promover um evento ou lançamento\n" +
      "4 - Outro\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "cta",
    pergunta:
      "🔹 *2. Qual será o CTA (chamada para ação) principal?*\n\n" +
      "1 - Solicitar orçamento\n" +
      "2 - Falar no WhatsApp\n" +
      "3 - Baixar material gratuito\n" +
      "4 - Outro\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "publico_alvo",
    pergunta:
      "🔹 *3. Quem é o seu público-alvo?*\n\n" +
      "1 - Empresários\n" +
      "2 - Mães\n" +
      "3 - Estudantes\n" +
      "4 - Pequenas empresas\n" +
      "5 - Outro\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "oferta",
    pergunta:
      "🔹 *4. O que você está oferecendo na página?*\n\n" +
      "1 - Produto físico\n" +
      "2 - Serviço profissional\n" +
      "3 - Curso/treinamento\n" +
      "4 - Evento\n" +
      "5 - Outro\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "beneficios",
    pergunta:
      "🔹 *5. Quais são os 3 principais benefícios ou diferenciais dessa oferta?*\n\n" +
      "Digite os 3 benefícios, um por linha:\n" +
      "1. \n" +
      "2. \n" +
      "3. \n\n" +
      "✳ Digite cada benefício em uma nova linha.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "texto",
  },
  {
    id: "identidade_visual",
    pergunta:
      "🔹 *6. Deseja usar sua identidade visual?*\n\n" +
      "1 - Sim, já tenho logo, cores e fontes\n" +
      "2 - Não, preciso de ajuda com isso\n" +
      "3 - Tenho algumas ideias, mas preciso de orientação\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "estilo_design",
    pergunta:
      "🔹 *7. Qual estilo de design você prefere?*\n\n" +
      "1 - Moderno\n" +
      "2 - Minimalista\n" +
      "3 - Criativo/despojado\n" +
      "4 - Corporativo/profissional\n" +
      "5 - Outro\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "conteudo",
    pergunta:
      "🔹 *8. Já possui textos e imagens para usar na página?*\n\n" +
      "1 - Sim, tenho todo o conteúdo\n" +
      "2 - Tenho apenas algumas informações\n" +
      "3 - Não, preciso que criem para mim\n" +
      "4 - Preciso de ajuda para organizar o conteúdo\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
  {
    id: "secoes",
    pergunta:
      "🔹 *9. Deseja incluir alguma dessas seções?*\n\n" +
      "Digite os números das seções desejadas, separados por vírgula:\n" +
      "1 - Depoimentos de clientes\n" +
      "2 - Logos de clientes/parceiros\n" +
      "3 - FAQ (Perguntas frequentes)\n" +
      "4 - Contador regressivo\n" +
      "5 - Integração com WhatsApp\n" +
      "6 - Outro\n\n" +
      "✳ Exemplo: 1,3,5\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "multipla_escolha",
  },
  {
    id: "prazo",
    pergunta:
      "🔹 *10. Qual é o prazo ideal para entrega da landing page?*\n\n" +
      "1 - Urgente (1 a 3 dias)\n" +
      "2 - Em até 7 dias\n" +
      "3 - Em até 15 dias\n" +
      "4 - Sem urgência\n\n" +
      "✳ Digite o número da opção desejada.\n" +
      "🔙 Para voltar ao menu principal, digite *voltar*",
    tipo: "opcoes",
  },
];

// Armazenamento temporário das respostas dos usuários
const respostasUsuarios = new Map();

client.on("message", async (msg) => {
  if (msg.from.endsWith("@c.us")) {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;
    const userId = msg.from;

    // Verifica se é uma mensagem inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
      await iniciarConversa(msg, name);
    }
    // Menu principal
    else if (msg.body.match(/^[1-5]$/) && !respostasUsuarios.has(userId)) {
      await processarMenuPrincipal(msg, userId);
    }
    // Processamento das respostas da landing page
    else if (respostasUsuarios.has(userId)) {
      await processarRespostaLandingPage(msg, userId);
    }
  }
});

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
      `3️⃣ - *Sobre Nós* \n` +
      `4️⃣ - *Ver Cases de Sucesso* \n` +
      `5️⃣ - *Falar com um Especialista* \n\n` +
      `Digite o número da opção desejada! `
  );
}

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
      await mostrarSobreNos(msg);
      break;
    case "4":
      await mostrarCases(msg);
      break;
    case "5":
      await encaminharParaEspecialista(msg);
      break;
  }
}

async function iniciarColetaLandingPage(msg, userId) {
  // Limpa qualquer estado anterior
  respostasUsuarios.delete(userId);

  // Inicializa novo estado
  respostasUsuarios.set(userId, {
    etapa: 0,
    respostas: {},
    emColeta: true,
  });

  await client.sendMessage(
    msg.from,
    "Ótimo! Vou te ajudar a criar uma landing page profissional. \n\n" +
      "Para começarmos, preciso coletar algumas informações importantes sobre seu negócio.\n\n" +
      "Vamos lá? Responda cada pergunta que eu fizer para criarmos a landing page perfeita para você! \n\n" +
      perguntasLandingPage[0].pergunta
  );
}

async function processarRespostaLandingPage(msg, userId) {
  const dadosUsuario = respostasUsuarios.get(userId);

  if (!dadosUsuario || !dadosUsuario.emColeta) {
    return;
  }

  const etapaAtual = dadosUsuario.etapa;
  const perguntaAtual = perguntasLandingPage[etapaAtual];

  // Verifica se o usuário quer voltar
  if (msg.body.toLowerCase() === "voltar") {
    respostasUsuarios.delete(userId);
    await client.sendMessage(
      msg.from,
      "🔄 *Voltando ao menu principal...*\n\n" +
        "Como posso ajudar? Escolha uma opção:\n\n" +
        "1️⃣ - *Criar minha Landing Page* 🎨\n" +
        "2️⃣ - *Conhecer nossos Planos* 💎\n" +
        "3️⃣ - *Sobre Nós* 📖\n" +
        "4️⃣ - *Ver Cases de Sucesso* 📈\n" +
        "5️⃣ - *Falar com um Especialista* 👨‍💻\n\n" +
        "Digite o número da opção desejada! 😊"
    );
    return;
  }

  // Validação específica para cada tipo de pergunta
  if (perguntaAtual.tipo === "opcoes") {
    const opcao = parseInt(msg.body);
    if (isNaN(opcao) || opcao < 1 || opcao > 5) {
      await client.sendMessage(
        msg.from,
        "❌ *Opção inválida!*\n\n" +
          "Por favor, digite apenas o número da opção desejada.\n\n" +
          perguntaAtual.pergunta
      );
      return;
    }
  } else if (perguntaAtual.tipo === "multipla_escolha") {
    const opcoes = msg.body.split(",").map((n) => parseInt(n.trim()));
    if (opcoes.some(isNaN) || opcoes.some((n) => n < 1 || n > 6)) {
      await client.sendMessage(
        msg.from,
        "❌ *Formato inválido!*\n\n" +
          "Por favor, digite os números separados por vírgula.\n" +
          "Exemplo: 1,3,5\n\n" +
          perguntaAtual.pergunta
      );
      return;
    }
  }

  // Salva a resposta
  dadosUsuario.respostas[perguntaAtual.id] = msg.body;

  // Verifica se terminou todas as perguntas
  if (etapaAtual + 1 < perguntasLandingPage.length) {
    dadosUsuario.etapa++;
    await client.sendMessage(
      msg.from,
      perguntasLandingPage[dadosUsuario.etapa].pergunta
    );
  } else {
    // Finaliza coleta e mostra mensagem de agradecimento
    dadosUsuario.emColeta = false;
    await finalizarColeta(msg, userId);
  }
}

async function finalizarColeta(msg, userId) {
  const dadosUsuario = respostasUsuarios.get(userId);

  await client.sendMessage(
    msg.from,
    "*Muito obrigado por suas respostas!*\n\n" +
      "Recebemos todas as informações necessárias para criar sua landing page profissional.\n\n" +
      "*Próximos Passos:*\n" +
      "✅ Um de nossos desenvolvedores entrará em contato em até 30 minutos\n" +
      "✅ Apresentaremos uma proposta personalizada baseada em suas necessidades\n" +
      "✅ Iniciaremos o desenvolvimento após sua aprovação\n\n" +
      "*Contato Direto:*\n" +
      "📧 " +
      sobreNos.contato.email +
      "\n" +
      "📱 " +
      sobreNos.contato.telefone +
      "\n\n" +
      "Agradecemos imensamente por ter escolhido a FGDIGITAL para seu projeto! 🚀\n" +
      "Estamos ansiosos para transformar sua ideia em uma landing page de sucesso! 💫\n\n" +
      "*FGDIGITAL - Transformando ideias em resultados digitais* ✨"
  );

  respostasUsuarios.delete(userId);
}

async function mostrarPlanos(msg) {
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

  mensagem += "Para começar a criar sua landing page agora, digite *1*!\n";
  mensagem += "Para falar com um especialista, digite *5*!";

  await client.sendMessage(msg.from, mensagem);
}

async function mostrarSobreNos(msg) {
  let mensagem = "🏢 *Sobre a FGDIGITAL* 🏢\n\n";
  mensagem += `*Nossa Missão:*\n${sobreNos.missao}\n\n`;
  mensagem += "*Nosso Diferencial:*\n";
  sobreNos.diferencial.forEach((item) => {
    mensagem += `✓ ${item}\n`;
  });
  mensagem += "\n*Contato:*\n";
  mensagem += `📧 Email: ${sobreNos.contato.email}\n`;
  mensagem += `📞 Telefone: ${sobreNos.contato.telefone}\n\n`;
  mensagem += "Para voltar ao menu principal, digite *menu*!";

  await client.sendMessage(msg.from, mensagem);
}

async function mostrarCases(msg) {
  await client.sendMessage(
    msg.from,
    "📈 *Cases de Sucesso* 📈\n\n" +
      "Veja alguns dos nossos clientes satisfeitos:\n\n" +
      "*TechCorp Brasil*\n" +
      "✓ Aumento de 150% em leads\n" +
      "✓ Taxa de conversão de 35%\n\n" +
      "*Inovação Digital*\n" +
      "✓ Crescimento de 200% em vendas\n" +
      "✓ ROI positivo em 30 dias\n\n" +
      "*StartupBR*\n" +
      "✓ Redução de 40% no CAC\n" +
      "✓ Aumento de 180% em conversões\n\n" +
      "Quer criar sua própria história de sucesso? Digite *1* para começar agora!"
  );
}

async function encaminharParaEspecialista(msg) {
  await client.sendMessage(
    msg.from,
    "👨‍💻 *Falar com Especialista*\n\n" +
      "Um de nossos especialistas entrará em contato em até 1 hora útil.\n\n" +
      "Enquanto isso, que tal conhecer nossos planos? Digite *2* para ver as opções disponíveis!"
  );
}

app.get("/", (req, res) => {
  res.send("Bot de WhatsApp rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});

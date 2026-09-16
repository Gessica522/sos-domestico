/* =========================================================
   SOS Doméstico — script principal
   Seções: 1) Menu mobile  2) Dados dos acidentes  3) Cards informativos
           4) Painel do chatbot (abre/fecha; o widget do n8n é
              inicializado à parte, em index.html)
           5) Aviso de chamada em desktop
   ========================================================= */

/* ---------- 1) Menu mobile ---------- */
(function initNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ---------- 2) Dados dos acidentes -----------------------------------
   Cada item alimenta um card informativo (ícone, título e resumo).
   Os campos "steps" e "warning" ficam disponíveis para uso futuro,
   por exemplo como contexto enviado ao chatbot (SOS Doméstico).
   Para adicionar um novo acidente, basta incluir um novo objeto aqui. */
const ACCIDENTS = [
  {
    id: "queimaduras",
    title: "Queimaduras",
    summary: "Queimaduras de pele por calor, atrito ou líquidos quentes.",
    icon: `<path d="M24 6c4 8-6 10-4 18 1 5 6 8 10 6 6-3 6-11 2-16 2 6-2 8-4 6 2-6-2-10-4-14z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
    steps: [
      "Afaste a pessoa da fonte de calor com segurança.",
      "Resfrie a área com água corrente fria (não gelada) por 10 a 20 minutos.",
      "Não use gelo, manteiga, pasta de dente ou outros produtos caseiros.",
      "Cubra a queimadura com um pano limpo e seco, sem apertar.",
      "Não estoure bolhas que se formarem."
    ],
    warning: "Procure atendimento médico se a queimadura for extensa, muito profunda, atingir rosto, mãos ou genitais, ou tiver origem elétrica ou química."
  },
  {
    id: "cortes",
    title: "Cortes e sangramentos",
    summary: "Ferimentos com sangramento causados por objetos cortantes.",
    icon: `<path d="M10 34l24-24M14 38l6-2 2-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    steps: [
      "Se possível, lave as mãos antes de socorrer.",
      "Aplique pressão direta e firme sobre o ferimento com um pano limpo.",
      "Eleve o membro ferido, se possível, para ajudar a reduzir o sangramento.",
      "Mantenha a pressão até o sangramento diminuir ou parar.",
      "Não retire objetos encravados no ferimento."
    ],
    warning: "Procure atendimento se o sangramento não parar em cerca de 10 minutos, o corte for profundo ou houver objeto encravado."
  },
  {
    id: "quedas",
    title: "Quedas",
    summary: "Quedas de própria altura, de escadas ou de móveis.",
    icon: `<path d="M18 8a4 4 0 108 0 4 4 0 10-8 0zM22 14v12M22 26l-8 10M22 20l10 4-4 10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    steps: [
      "Não movimente a pessoa se houver suspeita de lesão na cabeça, pescoço ou coluna.",
      "Verifique se ela está consciente e respirando normalmente.",
      "Observe dor intensa, deformidade ou dificuldade de se mexer.",
      "Em quedas na cabeça, fique atento a vômitos, sonolência excessiva ou confusão nas horas seguintes."
    ],
    warning: "Ligue para a emergência se a pessoa estiver inconsciente, com dor intensa, ou não conseguir se mover sem dor forte."
  },
  {
    id: "engasgos",
    title: "Engasgos",
    summary: "Obstrução das vias aéreas por alimentos ou objetos.",
    icon: `<circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 26v6M18 40c0-4 3-6 6-6s6 2 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
    steps: [
      "Pergunte se a pessoa consegue tossir, falar ou respirar.",
      "Se ela conseguir tossir, incentive-a a continuar tossindo com força.",
      "Se não conseguir respirar, tossir ou falar, aplique compressões abdominais (manobra de Heimlich).",
      "Em bebês, use tapinhas nas costas intercaladas com compressões no tórax.",
      "Se a pessoa perder a consciência, inicie manobras de reanimação e chame a emergência imediatamente."
    ],
    warning: "Engasgo com obstrução total das vias aéreas é uma emergência: acione o SAMU (192) enquanto presta o socorro."
  },
  {
    id: "choques",
    title: "Choques elétricos",
    summary: "Contato acidental com energia elétrica.",
    icon: `<path d="M26 6L14 26h8l-4 16 16-22h-9z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
    steps: [
      "Nunca toque na pessoa enquanto ela ainda estiver em contato com a fonte de energia.",
      "Desligue a energia no disjuntor ou na tomada, se for seguro fazer isso.",
      "Só depois de desligada a energia, verifique se a pessoa respira e está consciente.",
      "Mesmo em choques aparentemente leves, procure avaliação médica."
    ],
    warning: "Se a pessoa estiver inconsciente ou sem respirar, ligue imediatamente para o SAMU (192)."
  },
  {
    id: "intoxicacoes",
    title: "Intoxicações",
    summary: "Ingestão ou inalação de substâncias tóxicas.",
    icon: `<rect x="16" y="10" width="16" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M20 10V6h8v4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M20 24h8M24 20v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
    steps: [
      "Não induza vômito, a menos que orientado por um profissional.",
      "Identifique o que foi ingerido ou inalado, guardando a embalagem se possível.",
      "Em caso de gás ou fumaça, retire a pessoa do ambiente e ventile o local.",
      "Ligue imediatamente para a emergência ou para o Centro de Intoxicações."
    ],
    warning: "Intoxicação é sempre uma situação séria. Ligue para o SAMU (192) assim que possível."
  },
  {
    id: "picadas",
    title: "Picadas e mordidas",
    summary: "Picadas de insetos, cobras ou mordidas de animais.",
    icon: `<path d="M12 24c0-8 6-14 12-14s12 6 12 14-6 14-12 14-12-6-12-14z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 24h12M24 18v12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
    steps: [
      "Lave bem o local com água e sabão.",
      "Em picadas de animais peçonhentos, mantenha o membro afetado abaixo do nível do coração e o mais imóvel possível.",
      "Não faça torniquete, não corte o local e não tente sugar o veneno.",
      "Se possível, observe as características do animal para informar no atendimento."
    ],
    warning: "Procure atendimento médico imediatamente, mesmo que os sintomas pareçam leves no início."
  },
  {
    id: "hemorragia",
    title: "Hemorragia externa",
    summary: "Sangramento intenso e visível causado por ferimentos.",
    icon: `<path d="M24 6C16 18 10 26 10 32a14 14 0 0028 0c0-6-6-14-14-26z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
    steps: [
      "Se possível, use luvas ou proteja as mãos antes de socorrer.",
      "Aplique pressão direta e firme sobre o ferimento com um pano limpo ou gaze.",
      "Não retire o pano se ele encharcar; coloque outro por cima e mantenha a pressão.",
      "Eleve o membro ferido acima do nível do coração, se possível.",
      "Mantenha a pessoa deitada e aquecida enquanto aguarda socorro."
    ],
    warning: "Ligue para o SAMU (192) se o sangramento for abundante, não parar com pressão direta ou houver sinais de choque (palidez, tontura, pulso fraco)."
  },
  {
    id: "convulsao",
    title: "Convulsão e epilepsia",
    summary: "Crises convulsivas com perda de consciência ou movimentos involuntários.",
    icon: `<path d="M24 6v8M12 14l6 6M36 14l-6 6M8 26h8l4-8 8 16 4-8h8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    steps: [
      "Proteja a pessoa de quedas e afaste objetos que possam machucá-la.",
      "Coloque algo macio sob a cabeça e vire-a de lado, se possível.",
      "Não segure a pessoa nem tente imobilizar seus movimentos.",
      "Nunca coloque nada na boca da pessoa durante a crise.",
      "Cronometre a duração da crise e observe a respiração após ela cessar."
    ],
    warning: "Ligue para o SAMU (192) se a crise durar mais de 5 minutos, se repetir em seguida, ou se a pessoa não recuperar a consciência normalmente depois."
  }
];

/* ---------- 3) Renderização dos cards (só informativos) ---------- */
(function initAccidentCards() {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;

  grid.innerHTML = ACCIDENTS.map((item) => `
    <article class="accident-card">
      <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">${item.icon}</svg>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
    </article>
  `).join("");
})();

/* ---------- 4) Painel do chatbot -------------------------------------
   Abre/fecha o painel lateral onde o widget do n8n é exibido. A
   inicialização do widget em si (createChat) está em index.html. */
(function initChatDrawer() {
  const drawer = document.getElementById("chatDrawer");
  const backdrop = document.getElementById("chatDrawerBackdrop");
  const closeBtn = document.getElementById("chatDrawerClose");
  const openers = document.querySelectorAll(".js-open-chat");
  if (!drawer || !backdrop) return;

  function openChat() {
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeChat() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openers.forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      openChat();
    });
  });

  closeBtn.addEventListener("click", closeChat);
  backdrop.addEventListener("click", closeChat);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("open")) closeChat();
  });
})();

/* ---------- 5) Aviso de chamada em desktop ---------- */
(function initDesktopCallNote() {
  const note = document.getElementById("desktopCallNote");
  if (!note) return;
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isTouchDevice) {
    note.hidden = false;
  }
})();

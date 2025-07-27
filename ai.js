const toggleBtn = document.getElementById("toggleChatBtn");
const chatContainer = document.getElementById("chatContainer");
const closeBtn = document.getElementById("closeBtn");
const chatLog = document.getElementById("chatLog");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

toggleBtn.addEventListener("click", () => {
  if (chatContainer.style.display === "none") {
    chatContainer.style.display = "block";
  } else {
    chatContainer.style.display = "none";
  }
});

closeBtn.addEventListener("click", () => {
  chatContainer.style.display = "none";
});

function processInput(input) {
  const message = input.toLowerCase().trim();
  const greetings = ["hi", "hello", "helo", "hy", "hyy", "hii", "hey"];
  const typeWords = ["types", "pushdown", "finite", "pda", "tm", "turing"];
  const dfa = ["dfa", "deterministic"];
  const nfa = ["nfa", "non-deterministic", "non deterministic"];
  const pda = ["pda", "pushdown"];
  const tm = ["tm", "turing", "turing machine"];
  const lba = ["lba", "linear bounded"];
  const input = userInput.value.trim();
  
  if (!input) return;
  if (message.includes("ask ai") && typeWords.some(word => message.includes(word))) {
    return "Sure! You can ask the AI about topics like DFA, NFA, PDA, and other automata concepts.";
  }
  if (greetings.some(word => new RegExp(`\\b${word}\\b`).test(message))) {
    return "Hello! How can I help you today?";
  }

 let response = "";

  if (dfa.some(word => message.includes(word))) {
    response += "🔹 **DFA (Deterministic Finite Automaton)**: Recognizes regular languages. It has exactly one transition for each symbol from a state.\n\n";
  }
  if (nfa.some(word => message.includes(word))) {
    response += "🔹 **NFA (Non-deterministic Finite Automaton)**: Also recognizes regular languages. It can have multiple or no transitions for a symbol.\n\n";
  }
  if (pda.some(word => message.includes(word))) {
    response += "🔹 **PDA (Pushdown Automaton)**: Recognizes context-free languages and uses a stack for memory.\n\n";
  }
  if (lba.some(word => message.includes(word))) {
    response += "🔹 **LBA (Linear Bounded Automaton)**: Recognizes context-sensitive languages and works like a restricted Turing Machine.\n\n";
  }
  if (tm.some(word => message.includes(word))) {
    response += "🔹 **TM (Turing Machine)**: The most powerful model, capable of simulating any computation. It recognizes recursively enumerable languages.\n\n";
  }  
  if (message.includes("types")) {
    return "There are 4 major types of automata:\n\n1. DFA/NFA – Finite Automata\n2. PDA – Pushdown Automata\n3. LBA – Linear Bounded Automata\n4. TM – Turing Machines\n\nAsk about any one of them for a more detailed explanation!";
  }
  if (message.includes("how") && message.includes("website")) {
    return "To know how to use the website, please click the blue color information button placed on the top right corner of the webpage.";
  }
  if (message.includes("website") && message.includes("about")) {
    return "This website is about Automata Theory and abstract machines. For usage instructions, click the blue info button on the top right corner.";
  }
  if (response === "" && typeWords.some(word => message.includes(word))) {
    return "Here are the types of automata in automata theory:\n\n1. Finite Automata (FA) – recognizes regular languages (DFA/NFA)\n2. Pushdown Automata (PDA) – for context-free languages\n3. Linear Bounded Automata (LBA) – for context-sensitive languages\n4. Turing Machine (TM) – most powerful; handles all recursively enumerable languages.";
  }
  if (message.includes("automata")) {
    return "Automata is a model with states and transitions. It's foundational in compilers, parsers, and systems modeling.";
  }
  if (message.includes("fuck")) {
    return "Please use respectful language.";
  }
  if (["initial state", "final state", "state", "q0", "q1"].some(word => message.includes(word))) {
    return "In this website, a state represents a node. The initial state is where the automaton starts; final states are accepting nodes.";
  }
  if (message.includes("data")) {
    return "Data mode allows you to input raw data for simulating automata.";
  }
  if (message.includes("equation")) {
    return "Equation mode lets you describe automata using symbolic expressions.";
  }
  if (message.includes("text")) {
    return "Text mode allows input of automata descriptions in plain text.";
  }
  if (message.includes("ask ai")) {
    return "Use the 'Ask AI' feature to get automated help and explanations about automata and this website.";
  }
  if ([" a ", " b ", " c ", " d "].some(letter => message.includes(letter))) {
    return "These are sample input symbols you can use in the automata simulation.";
  }
  return "Please ask only from the content (Automata Theory) as I am limited to the content.";
}

sendBtn.addEventListener("click", () => {
  const input = userInput.value;
  if (input) {
    const response = processInput(input);
    chatLog.innerHTML += `<br><strong>You:</strong> ${input}<br><strong>AI:</strong> ${response}`;
    userInput.value = "";
    chatLog.scrollTop = chatLog.scrollHeight;
  }
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

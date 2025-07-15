let states = [];
let transitions = [];
let alphabet = [];
let isDFA = true;

const undoStack = [];
const redoStack = [];

const buttons = {
  data: document.getElementById('data-btn'),
  equation: document.getElementById('equation-btn'),
  text: document.getElementById('text-btn'),
  ai: document.getElementById('ask-ai')
};

const sections = {
  data: document.getElementById('data-input'),
  equation: document.getElementById('equation-input'),
  text: document.getElementById('text-input'),
  ai: document.getElementById('ai-input')
};

const alphabetInput = document.getElementById('alphabet');

function saveState() {
  const snapshot = {
    states: [...states],
    transitions: transitions.map(t => ({ ...t })),
    alphabet: [...alphabet],
    isDFA,
    initialState: document.getElementById('initial-state').value.trim(),
    finalStates: document.getElementById('final-state').value.trim()
  };
  undoStack.push(snapshot);
  redoStack.length = 0;
}

function restoreState(state) {
  states = [...state.states];
  transitions = state.transitions.map(t => ({ ...t }));
  alphabet = [...state.alphabet];
  isDFA = state.isDFA;
  document.getElementById('initial-state').value = state.initialState;
  document.getElementById('final-state').value = state.finalStates;
  document.querySelector(`input[name="type"][value="${isDFA ? 'dfa' : 'nfa'}"]`).checked = true;
  document.getElementById('states-container').innerHTML = states.map(s => `<div>${s}</div>`).join('');
  alphabetInput.value = alphabet.join(',');
  regenerateGraph();
}

function undo() {
  if (undoStack.length === 0) return;
  const current = {
    states: [...states],
    transitions: transitions.map(t => ({ ...t })),
    alphabet: [...alphabet],
    isDFA,
    initialState: document.getElementById('initial-state').value.trim(),
    finalStates: document.getElementById('final-state').value.trim()
  };
  redoStack.push(current);
  const prev = undoStack.pop();
  restoreState(prev);
}

function redo() {
  if (redoStack.length === 0) return;
  const current = {
    states: [...states],
    transitions: transitions.map(t => ({ ...t })),
    alphabet: [...alphabet],
    isDFA,
    initialState: document.getElementById('initial-state').value.trim(),
    finalStates: document.getElementById('final-state').value.trim()
  };
  undoStack.push(current);
  const next = redoStack.pop();
  restoreState(next);
}

function activateMode(mode) {
  for (let key in buttons) {
    buttons[key].style.backgroundColor = key === mode ? 'var(--hover-red)' : 'var(--main-red)';
    sections[key].style.display = key === mode ? 'block' : 'none';
  }
}
activateMode('data');

buttons.data.addEventListener('click', () => activateMode('data'));
buttons.equation.addEventListener('click', () => activateMode('equation'));
buttons.text.addEventListener('click', () => activateMode('text'));
buttons.ai.addEventListener('click', () => activateMode('ai'));

document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', () => {
    saveState();
    isDFA = radio.value === 'dfa';
    regenerateGraph();
  });
});

alphabetInput.addEventListener('input', () => {
  const alphaRaw = alphabetInput.value.trim();
  alphabet = alphaRaw ? alphaRaw.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  alphabet = [...new Set(alphabet)];
});

function validateSymbol(symbol) {
  if (symbol === 'ε') return true;
  return alphabet.includes(symbol);
}

document.getElementById('add-state-btn').addEventListener('click', () => {
  const stateInput = document.getElementById('state');
  const state = stateInput.value.trim();
  const error = document.getElementById('state-error');
  if (!state) return error.textContent = 'Please enter a state.';
  if (states.includes(state)) return error.textContent = 'State already exists!';
  saveState();
  states.push(state);
  error.textContent = '';
  document.getElementById('states-container').innerHTML += `<div>${state}</div>`;
  stateInput.value = '';
  regenerateGraph();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  saveState();
  states = [];
  transitions = [];
  alphabet = [];
  document.getElementById('state').value = '';
  document.getElementById('initial-state').value = '';
  document.getElementById('final-state').value = '';
  alphabetInput.value = '';
  document.getElementById('states-container').innerHTML = '';
  document.getElementById('graph-container').innerHTML = '';
  document.querySelectorAll('.error').forEach(e => e.textContent = '');
});

document.getElementById('initial-state').addEventListener('input', () => {
  const state = document.getElementById('initial-state').value.trim();
  const error = document.getElementById('initial-state-error');
  error.textContent = state && !states.includes(state) ? 'Initial state does not exist!' : '';
  regenerateGraph();
});

document.getElementById('final-state').addEventListener('input', () => {
  const input = document.getElementById('final-state').value.trim();
  const finals = input.split(',').map(f => f.trim());
  const error = document.getElementById('final-state-error');
  const invalid = finals.filter(f => f && !states.includes(f));
  error.textContent = invalid.length ? 'Some final states do not exist!' : '';
  regenerateGraph();
});

document.getElementById('solve-equation-btn').addEventListener('click', () => {
  const input = document.getElementById('equation-textarea').value.trim();
  const error = document.getElementById('equation-error');
  if (!input) return error.textContent = 'Please enter transitions.';
  error.textContent = '';
  saveState();
  transitions = [];
  const lines = input.split('\n');
  const seen = new Set();
  for (let line of lines) {
    const match = line.match(/^(\w+)\s*\+\s*(\w+|ε|epsilon)\s*=\s*(\w+)$/i);
    if (!match) return error.textContent = 'Invalid format. Use: q0 + a = q1';
    const [_, from, symbolRaw, to] = match;
    if (!states.includes(from)) states.push(from);
    if (!states.includes(to)) states.push(to);
    const symbol = symbolRaw.toLowerCase() === 'epsilon' ? 'ε' : symbolRaw;
    if (!validateSymbol(symbol)) return error.textContent = `Symbol '${symbol}' not in alphabet!`;
    if (isDFA && isDuplicateTransition(from, symbol, seen)) {
      return error.textContent = `DFA can't have multiple transitions for '${from}' + '${symbol}'`;
    }
    transitions.push({ from, symbol, to });
    if (symbol !== 'ε' && !alphabet.includes(symbol)) alphabet.push(symbol);
  }
  const initial = states[0];
  const final = [states[states.length - 1]];
  document.getElementById('initial-state').value = initial;
  document.getElementById('final-state').value = final.join(',');
  regenerateGraph();
});

document.getElementById('solve-text-btn').addEventListener('click', () => {
  const input = document.getElementById('text-input-field').value.trim();
  const error = document.getElementById('text-error');
  if (!input) return error.textContent = 'Please enter transitions.';
  error.textContent = '';
  saveState();
  transitions = [];
  const entries = input.split(',');
  const seen = new Set();
  for (let entry of entries) {
    const [from, symbolRaw, to] = entry.trim().split(/\s+/);
    if (!from || !symbolRaw || !to) return error.textContent = 'Each transition must be: from symbol to';
    const symbol = symbolRaw.toLowerCase() === 'epsilon' ? 'ε' : symbolRaw;
    if (!validateSymbol(symbol)) return error.textContent = `Symbol '${symbol}' not in alphabet!`;
    if (!states.includes(from)) states.push(from);
    if (!states.includes(to)) states.push(to);
    if (isDFA && isDuplicateTransition(from, symbol, seen)) {
      return error.textContent = `DFA can't have multiple transitions for '${from}' + '${symbol}'`;
    }
    transitions.push({ from, symbol, to });
    if (symbol !== 'ε' && !alphabet.includes(symbol)) alphabet.push(symbol);
  }
  const initial = states[0];
  const final = [states[states.length - 1]];
  document.getElementById('initial-state').value = initial;
  document.getElementById('final-state').value = final.join(',');
  regenerateGraph();
});

document.getElementById('submit-ai-btn').addEventListener('click', async () => {
  const prompt = document.getElementById('ai-prompt').value.trim();
  const responseBox = document.getElementById('ai-response');
  if (!prompt) {
    responseBox.textContent = 'Please enter a prompt.';
    return;
  }
  responseBox.textContent = 'Generating...';
  try {
    const res = await fetch('/api/generate-automaton', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('AI API error');
    const data = await res.json();
    if (!data.states || !data.transitions || !data.initialState || !data.finalStates) {
      throw new Error('Invalid AI response');
    }
    saveState();
    states = data.states;
    transitions = data.transitions;
    alphabet = Array.from(new Set(data.transitions.map(t => t.symbol).filter(s => s !== 'ε')));
    document.getElementById('alphabet').value = alphabet.join(',');
    document.getElementById('initial-state').value = data.initialState;
    document.getElementById('final-state').value = data.finalStates.join(',');
    document.getElementById('states-container').innerHTML = states.map(s => `<div>${s}</div>`).join('');
    regenerateGraph();
    responseBox.textContent = 'AI-generated automaton loaded.';
  } catch (e) {
    responseBox.textContent = 'Error generating automaton: ' + e.message;
  }
});

function regenerateGraph() {
  const initial = document.getElementById('initial-state').value.trim();
  const final = document.getElementById('final-state').value.trim().split(',').map(f => f.trim()).filter(f => f);
  if (!initial || !states.includes(initial)) return;
  for (let f of final) if (!states.includes(f)) return;
  drawGraph(states, transitions, initial, final);
}

function drawGraph(states, transitions, initialState, finalStates) {
  d3.select('#graph-container').selectAll('*').remove();

  const container = document.getElementById('graph-container');
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', '100%');

  const nodes = states.map(state => ({ id: state }));
  const links = transitions.map(t => ({ source: t.from, target: t.to, label: t.symbol }));

  svg.append('defs').selectAll('marker')
    .data(['arrowhead', 'startArrow'])
    .enter()
    .append('marker')
    .attr('id', d => d)
    .attr('viewBox', d => d === 'arrowhead' ? '-0 -5 10 10' : '-5 -5 10 10')
    .attr('refX', d => d === 'arrowhead' ? 30 : 12)
    .attr('refY', 0)
    .attr('markerWidth', d => d === 'arrowhead' ? 15 : 12)
    .attr('markerHeight', d => d === 'arrowhead' ? 15 : 12)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', d => d === 'arrowhead' ? 'M 0,-5 L 10,0 L 0,5' : 'M -5,-5 L 5,0 L -5,5')
    .attr('fill', d => d === 'arrowhead' ? '#fff' : '#0f0');

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(30));

  const link = svg.selectAll('.link').data(links).enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke', '#fff')      
    .attr('stroke-width', 4)
    .attr('stroke-opacity', 1)
    .attr('stroke-dasharray', d => d.label === 'ε' ? '6 3' : '0')
    .attr('marker-end', 'url(#arrowhead)');

  const node = svg.selectAll('.node').data(nodes).enter()
    .append('circle')
    .attr('class', d => finalStates.includes(d.id) ? 'node final' : 'node')
    .attr('r', 20)
    .attr('fill', '#8B0A0A')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

  const nodeLabel = svg.selectAll('.node-label').data(nodes).enter()
    .append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '-1.2em')
    .attr('fill', '#fff')
    .style('pointer-events', 'none');

  const linkLabel = svg.selectAll('.link-label').data(links).enter()
    .append('text')
    .text(d => d.label)
    .attr('class', 'link-label')
    .attr('font-size', '12px')
    .attr('fill', '#fff')
    .style('pointer-events', 'none');

  const startLine = svg.append('line').attr('class', 'start-arrow')
    .attr('stroke', '#0f0')
    .attr('stroke-width', 3)
    .attr('marker-end', 'url(#startArrow)');

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    nodeLabel
      .attr('x', d => d.x)
      .attr('y', d => d.y - 25);

    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);

    const start = nodes.find(n => n.id === initialState);
    if (start) {
      const offsetX = 30;
      const offsetY = -10;
      startLine
        .attr('x1', start.x - offsetX)
        .attr('y1', start.y + offsetY)
        .attr('x2', start.x - 5)
        .attr('y2', start.y)
        .attr('visibility', 'visible');
    } else {
      startLine.attr('visibility', 'hidden');
    }
  });
}

function isDuplicateTransition(from, symbol, seen) {
  const key = `${from}_${symbol}`;
  if (seen.has(key)) return true;
  seen.add(key);
  return false;
}

function addUndoRedoButtons() {
  const controls = document.getElementById('controls-section');
  if (!document.getElementById('undo-btn')) {
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.textContent = 'Undo';
    undoBtn.style.margin = '5px';
    undoBtn.onclick = undo;
    controls.appendChild(undoBtn);
  }
  if (!document.getElementById('redo-btn')) {
    const redoBtn = document.createElement('button');
    redoBtn.id = 'redo-btn';
    redoBtn.textContent = 'Redo';
    redoBtn.style.margin = '5px';
    redoBtn.onclick = redo;
    controls.appendChild(redoBtn);
  }
}
addUndoRedoButtons();

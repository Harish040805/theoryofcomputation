let states = [];
let transitions = [];
let alphabet = [];
let isDFA = true;

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
    isDFA = radio.value === 'dfa';
    regenerateGraph();
  });
});

document.getElementById('add-state-btn').addEventListener('click', () => {
  const stateInput = document.getElementById('state');
  const state = stateInput.value.trim();
  const error = document.getElementById('state-error');
  if (!state) return error.textContent = 'Please enter a state.';
  if (states.includes(state)) return error.textContent = 'State already exists!';
  states.push(state);
  error.textContent = '';
  document.getElementById('states-container').innerHTML += `<div>${state}</div>`;
  stateInput.value = '';
  regenerateGraph();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  states = [];
  transitions = [];
  alphabet = [];
  document.getElementById('state').value = '';
  document.getElementById('initial-state').value = '';
  document.getElementById('final-state').value = '';
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
  transitions = [];
  const lines = input.split('\n');
  const seen = new Set();

  for (let line of lines) {
    const match = line.match(/^(\w+)\s*\+\s*(\w+|ε|epsilon)\s*=\s*(\w+)$/i);
    if (!match) return error.textContent = 'Invalid format. Use: q0 + a = q1';
    const [_, from, symbol, to] = match;
    if (!states.includes(from)) states.push(from);
    if (!states.includes(to)) states.push(to);
    const cleanSymbol = symbol.toLowerCase() === 'epsilon' ? 'ε' : symbol;
    const key = `${from}_${cleanSymbol}`;
    if (isDFA && seen.has(key)) return error.textContent = `DFA can't have multiple transitions for '${from}' + '${cleanSymbol}'`;
    transitions.push({ from, symbol: cleanSymbol, to });
    seen.add(key);
    if (cleanSymbol !== 'ε' && !alphabet.includes(cleanSymbol)) alphabet.push(cleanSymbol);
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
  transitions = [];
  const entries = input.split(',');
  const seen = new Set();

  for (let entry of entries) {
    const [from, symbol, to] = entry.trim().split(/\s+/);
    if (!from || !symbol || !to) return error.textContent = 'Each transition must be: from symbol to';
    const cleanSymbol = symbol.toLowerCase() === 'epsilon' ? 'ε' : symbol;
    if (!states.includes(from)) states.push(from);
    if (!states.includes(to)) states.push(to);
    const key = `${from}_${cleanSymbol}`;
    if (isDFA && seen.has(key)) return error.textContent = `DFA can't have multiple transitions for '${from}' + '${cleanSymbol}'`;
    transitions.push({ from, symbol: cleanSymbol, to });
    seen.add(key);
    if (cleanSymbol !== 'ε' && !alphabet.includes(cleanSymbol)) alphabet.push(cleanSymbol);
  }

  const initial = states[0];
  const final = [states[states.length - 1]];
  document.getElementById('initial-state').value = initial;
  document.getElementById('final-state').value = final.join(',');
  regenerateGraph();
});

document.getElementById('submit-ai-btn').addEventListener('click', () => {
  const prompt = document.getElementById('ai-prompt').value.trim();
  const responseBox = document.getElementById('ai-response');
  if (!prompt) return responseBox.textContent = 'Please enter a prompt.';
  responseBox.textContent = 'Generating...';

  states = ['q0', 'q1', 'q2'];
  transitions = [
    { from: 'q0', symbol: 'a', to: 'q1' },
    { from: 'q1', symbol: 'b', to: 'q2' },
    { from: 'q2', symbol: 'ε', to: 'q1' }
  ];
  alphabet = ['a', 'b'];
  document.getElementById('initial-state').value = 'q0';
  document.getElementById('final-state').value = 'q2';
  regenerateGraph();
  responseBox.textContent = 'AI-generated automaton loaded.';
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
  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('viewBox', '0 0 800 600')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const nodes = states.map(state => ({ id: state }));
  const links = transitions.map(t => ({ source: t.from, target: t.to, label: t.symbol }));

  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 25).attr('refY', 0)
    .attr('markerWidth', 13).attr('markerHeight', 13)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M 0,-5 L 10,0 L 0,5').attr('fill', '#8B0A0A');

  svg.append('defs').append('marker')
    .attr('id', 'startArrow')
    .attr('viewBox', '-5 -5 10 10')
    .attr('refX', 10).attr('refY', 0)
    .attr('markerWidth', 10).attr('markerHeight', 10)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M -5,-5 L 5,0 L -5,5').attr('fill', '#0f0');

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-300))
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .force('center', d3.forceCenter(400, 300));

  const link = svg.selectAll('.link').data(links).enter()
    .append('line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#arrowhead)');

  const node = svg.selectAll('.node').data(nodes).enter()
    .append('circle')
    .attr('class', d => finalStates.includes(d.id) ? 'node final' : 'node')
    .attr('r', 20);

  const nodeLabel = svg.selectAll('.node-label').data(nodes).enter()
    .append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '-1.2em')
    .attr('fill', '#fff');

  const linkLabel = svg.selectAll('.link-label').data(links).enter()
    .append('text')
    .text(d => d.label)
    .attr('class', 'link-label')
    .attr('font-size', '12px')
    .attr('fill', '#fff');

  const startLine = svg.append('line').attr('class', 'start-arrow');

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x).attr('cy', d => d.y);
    nodeLabel.attr('x', d => d.x).attr('y', d => d.y - 25);
    linkLabel.attr('x', d => (d.source.x + d.target.x) / 2)
             .attr('y', d => (d.source.y + d.target.y) / 2);

    const start = nodes.find(n => n.id === initialState);
    if (start) {
      startLine
        .attr('x1', start.x - 50).attr('y1', start.y)
        .attr('x2', start.x - 22).attr('y2', start.y)
        .attr('stroke', '#0f0').attr('stroke-width', 2)
        .attr('marker-end', 'url(#startArrow)');
    }
  });
}

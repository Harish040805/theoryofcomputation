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

buttons.data.addEventListener('click', () => activateMode('data'));
buttons.equation.addEventListener('click', () => activateMode('equation'));
buttons.text.addEventListener('click', () => activateMode('text'));
buttons.ai.addEventListener('click', () => activateMode('ai'));
activateMode('data');

let states = [];

document.getElementById('add-state-btn').addEventListener('click', () => {
  const state = document.getElementById('state').value.trim();
  const stateError = document.getElementById('state-error');
  if (state) {
    if (!states.includes(state)) {
      states.push(state);
      document.getElementById('states-container').innerHTML += `<div>${state}</div>`;
      document.getElementById('state').value = '';
      stateError.textContent = '';
      regenerateGraph();
    } else {
      stateError.textContent = 'State already exists!';
    }
  } else {
    stateError.textContent = 'Please enter a state!';
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  states = [];
  document.getElementById('state').value = '';
  document.getElementById('initial-state').value = '';
  document.getElementById('final-state').value = '';
  document.getElementById('states-container').innerHTML = '';
  document.getElementById('graph-container').innerHTML = '';
  document.getElementById('state-error').textContent = '';
  document.getElementById('initial-state-error').textContent = '';
  document.getElementById('final-state-error').textContent = '';
});

document.getElementById('initial-state').addEventListener('input', () => {
  const initialState = document.getElementById('initial-state').value.trim();
  const initialStateError = document.getElementById('initial-state-error');
  if (initialState && !states.includes(initialState)) {
    initialStateError.textContent = 'Initial state does not exist!';
  } else {
    initialStateError.textContent = '';
  }
  regenerateGraph();
});

document.getElementById('final-state').addEventListener('input', () => {
  const finalStates = document.getElementById('final-state').value.trim().split(',').map(f => f.trim());
  const finalStateError = document.getElementById('final-state-error');
  const invalidStates = finalStates.filter(f => f && !states.includes(f));
  if (invalidStates.length > 0) {
    finalStateError.textContent = 'Final states do not exist!';
  } else {
    finalStateError.textContent = '';
  }
  regenerateGraph();
});

document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', regenerateGraph);
});

function regenerateGraph() {
  const alphabet = ['a', 'b'];
  const initial = document.getElementById('initial-state').value.trim();
  const final = document.getElementById('final-state').value.trim().split(',').map(f => f.trim());
  const isDFA = document.querySelector('input[name="type"]:checked').value === 'dfa';

  if (states.length === 0) {
    console.error('No states defined');
    return;
  }

  if (!initial || !states.includes(initial)) return;
  for (let f of final) {
    if (f && !states.includes(f)) return;
  }

  const transitions = [];
  states.forEach(from => {
    alphabet.forEach(symbol => {
      const toCount = isDFA ? 1 : Math.floor(Math.random() * states.length) + 1;
      for (let i = 0; i < toCount; i++) {
        const to = states[Math.floor(Math.random() * states.length)];
        transitions.push({ from, symbol, to });
      }
    });
  });

  drawGraph(states, transitions, initial, final);
}

document.getElementById('solve-equation-btn').addEventListener('click', () => {
  const input = document.getElementById('equation-textarea').value.trim();
  const error = document.getElementById('equation-error');
  error.textContent = '';
  if (!input) {
    error.textContent = 'Please enter an equation.';
    return;
  }

  const lines = input.split('\n');
  const transitions = [];
  const stateSet = new Set();

  for (let line of lines) {
    const match = line.match(/^(\w+)\s*\+\s*(\w+)\s*=\s*(\w+)$/);
    if (!match) {
      error.textContent = 'Invalid format. Use: q0 + a = q1';
      return;
    }
    const [_, from, symbol, to] = match;
    transitions.push({ from, symbol, to });
    stateSet.add(from);
    stateSet.add(to);
  }

  const stateList = [...stateSet];
  const initial = stateList[0];
  const final = [stateList[stateList.length - 1]];

  drawGraph(stateList, transitions, initial, final);
});

document.getElementById('solve-text-btn').addEventListener('click', () => {
  const input = document.getElementById('text-input-field').value.trim();
  const error = document.getElementById('text-error');
  error.textContent = '';
  if (!input) {
    error.textContent = 'Please enter some transitions.';
    return;
  }

  const entries = input.split(',');
  const transitions = [];
  const stateSet = new Set();

  for (let entry of entries) {
    const parts = entry.trim().split(/\s+/);
    if (parts.length !== 3) {
      error.textContent = 'Format: from symbol to';
      return;
    }
    const [from, symbol, to] = parts;
    transitions.push({ from, symbol, to });
    stateSet.add(from);
    stateSet.add(to);
  }

  const stateList = [...stateSet];
  const initial = stateList[0];
  const final = [stateList[stateList.length - 1]];

  drawGraph(stateList, transitions, initial, final);
});

document.getElementById('submit-ai-btn').addEventListener('click', () => {
  const prompt = document.getElementById('ai-prompt').value.trim();
  const responseBox = document.getElementById('ai-response');

  if (!prompt) {
    responseBox.textContent = 'Please enter a prompt.';
    return;
  }

  responseBox.textContent = 'Generating...';

  const mock = {
    states: ['q0', 'q1', 'q2'],
    initial: 'q0',
    final: ['q2'],
    transitions: [
      { from: 'q0', symbol: 'a', to: 'q1' },
      { from: 'q1', symbol: 'b', to: 'q2' },
      { from: 'q2', symbol: 'a', to: 'q1' }
    ]
  };

  drawGraph(mock.states, mock.transitions, mock.initial, mock.final);
  responseBox.textContent = `Automaton generated with ${mock.states.length} states.`;
});

function drawGraph(states, transitions, initialState, finalStates) {
  d3.select('#graph-container').selectAll('*').remove();

  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('viewBox', '0 0 800 600')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const nodes = states.map(state => ({ id: state }));
  const links = transitions.map(t => ({
    source: t.from,
    target: t.to,
    label: t.symbol
  }));

  svg.append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 13)
    .attr('markerHeight', 13)
    .append('path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', '#8B0A0A');

  svg.append('defs')
    .append('marker')
    .attr('id', 'startArrow')
    .attr('viewBox', '-5 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M -5,-5 L 5,0 L -5,5')
    .attr('fill', '#0f0');

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-300))
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .force('center', d3.forceCenter(400, 300));

  const link = svg.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#arrowhead)');

  const node = svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('class', d => finalStates.includes(d.id) ? 'node final' : 'node')
    .attr('r', 20);

  const nodeLabel = svg.selectAll('.node-label')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'node-label')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '-1.2em')
    .attr('fill', '#fff')
    .style('pointer-events', 'none')
    .style('font-weight', 'bold');

  const linkLabel = svg.selectAll('.link-label')
    .data(links)
    .enter()
    .append('text')
    .text(d => d.label)
    .attr('class', 'link-label')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#fff');

  const startLine = svg.append('line').attr('class', 'start-arrow');

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
      startLine
        .attr('x1', start.x - 50)
        .attr('y1', start.y)
        .attr('x2', start.x - 22)
        .attr('y2', start.y)
        .attr('stroke', '#0f0')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#startArrow)');
    }
  });
}

function saveAutomaton() {
  const data = {
    states: states,
    initial: document.getElementById('initial-state').value.trim(),
    final: document.getElementById('final-state').value.trim().split(',').map(f => f.trim()),
    transitions: transitions
  };
  const json = JSON.stringify(data);
  const blob = new Blob([json], {type: 'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'automaton.json';
  link.click();
}

function loadAutomaton() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      states = data.states;
      document.getElementById('initial-state').value = data.initial;
      document.getElementById('final-state').value = data.final.join(',');
      transitions = data.transitions;
      regenerateGraph();
    };
    reader.readAsText(file);
  };
  input.click();
}

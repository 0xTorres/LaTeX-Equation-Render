
    const inputText = document.getElementById('inputText');
    const renderedOutput = document.getElementById('renderedOutput');
    
    // OTIMIZAÇÕES DE PERFORMANCE
    let debounceTimeout = null;
    let lastProcessedText = '';
    let lastMathContent = '';
    let isProcessing = false;
    const contentCache = new Map();
    
    // Regex pré-compilados para melhor performance
    const patterns = {
      colorCommand: /\/c\{((?:red|green|blue)|#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))\}\{((?:[^{}]|\{[^}]*\})*)\}/g,
      imageMarkdown: /!\[([^\]]*)\]\(([^)]+)\)/g,
      imageUrl: /!\[([^\]]*)\]\(\s*(https?:\/\/[^\s'"<>]+)\s*\)/g
    };
  
    function escapeHtml(text) {
      if (text.includes("<img")) {
          return text;
      }
      const span = document.createElement('span');
      span.textContent = text;
      return span.innerHTML;
    }
  
    function hashString(str) {
      let hash = 0;
      if (str.length === 0) return hash;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash;
    }
  
    function sanitizeInput(text) {
      // Primeiro, salva os comentários HTML
      const comments = [];
      text = text.replace(/<!--[\s\S]*?-->/g, (match) => {
        comments.push(match);
        return `__HTML_COMMENT_${comments.length - 1}__`;
      });

      // Escapa todo o resto do HTML
      const span = document.createElement('span');
      span.textContent = text;
      text = span.innerHTML;

      // Restaura os comentários
      text = text.replace(/__HTML_COMMENT_(\d+)__/g, (_, index) => comments[index]);

      return text;
    }

    function parseAndRender(text) {
      text = sanitizeInput(text);
  const cacheKey = hashString(text);
  if (contentCache.has(cacheKey)) return contentCache.get(cacheKey);

  // Substitui cores
  text = text.replace(patterns.colorCommand, (_, cor, conteudo) => {
    return `<span style="color:${cor}">${conteudo}</span>`;
  });

  // Substitui imagens Markdown
  text = text.replace(patterns.imageMarkdown, (_, alt, url) => {
    return `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;" />`;
  });

  let result = '';
  let idx = 0;
  const length = text.length;

  while (idx < length) {
    let nextDisplay = text.indexOf('$$', idx);
    let nextInline = text.indexOf('$', idx);

    if (nextDisplay === -1) nextDisplay = length + 1;
    if (nextInline === -1) nextInline = length + 1;

    if (nextDisplay < nextInline) {
      result += text.slice(idx, nextDisplay); // NÃO ESCAPAR delimitadores
      let end = text.indexOf('$$', nextDisplay + 2);
      if (end === -1) {
        result += text.slice(nextDisplay);
        break;
      }
      let mathContent = text.slice(nextDisplay + 2, end);
      result += `\\[${mathContent}\\]`;
      idx = end + 2;
    } else if (nextInline < nextDisplay) {
      if (text.substr(nextInline, 2) === '$$') { 
        idx = nextInline + 2; 
        continue; 
      }
      result += text.slice(idx, nextInline); // NÃO ESCAPAR delimitadores
      let end = text.indexOf('$', nextInline + 1);
      if (end === -1) {
        result += text.slice(nextInline);
        break;
      }
      let mathContent = text.slice(nextInline + 1, end);
      result += `\\(${mathContent}\\)`;
      idx = end + 1;
    } else {
      result += text.slice(idx); // resto do texto
      break;
    }
  }

  contentCache.set(cacheKey, result);
  if (contentCache.size > 100) contentCache.delete(contentCache.keys().next().value);

  return result;
}

  
    function extractMathContent(html) {
      const mathMatches = html.match(/\\[\[\(][\s\S]*?\\[\]\)]/g);
      return mathMatches ? mathMatches.join('') : '';
    }
  
    function updateOutput() {
  if (isProcessing) return;

  const currentText = inputText.value;
  if (currentText === lastProcessedText) return;

  isProcessing = true;
  let text = currentText;

  // $$1$$
  if (!text.startsWith('$$1$$')) {
    text = "\n\n" + `$$1$$${text}`;
    inputText.value = text.substring(7);
  }

  let processedText = parseAndRender(text);
  let filteredText = processedText.substring(7);

  if (renderedOutput.innerHTML !== filteredText) {
    console.log('Atualizando conteúdo renderizado...');
    renderedOutput.innerHTML = filteredText || '<span style="display:none;"></span>';

    // Renderiza MathJax sempre
    const currentMathContent = extractMathContent(filteredText);
    if (window.MathJax && window.MathJax.typesetPromise) {
      MathJax.typesetClear([renderedOutput]);
      MathJax.typesetPromise([renderedOutput])
        .then(() => {
          console.log('MathJax renderizado corretamente.');
        })
        .catch(err => {
          console.error('Erro ao renderizar MathJax: ' + err.message);
        });
    } else if (window.MathJax && MathJax.typeset) {
      setTimeout(() => {
        MathJax.typeset([renderedOutput]);
        console.log('MathJax renderizado (fallback com typeset).');
      }, 50);
    }

    lastMathContent = currentMathContent;
  }

  lastProcessedText = currentText;
  isProcessing = false;
}




  
    // DEBOUNCED INPUT HANDLER
    function handleInput() {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Debounce com 300ms de delay
      debounceTimeout = setTimeout(() => {
        updateOutput();
      }, 300);
    }
  
    
    inputText.addEventListener('input', handleInput);
	
	
	inputText.value = "<!-- To use just put LaTeX content inside $  $ or $$  $$\n     Press one of the buttons in the bottom right corner of the page to download all LaTeX as SVG or to generate and save the rendered page (can save hundreds of equations in just a click)\n     Hover the top bar to reveal more content, press to insert selected LaTeX inside the document\nThe last box on the right is used to create matrices.\n-->$\\textbf{Tutorial}$-> Here is some text with inline math: $a^2 + b^2 = c^2$.\nAnd display math: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\n<!--\n/c{ red|green|blue or rgb(0,0,0) }{contents with or whitout LaTeX}\n-->/c{red}{Large amounts of colored text and LaTeX\n $a^2 + b^2 = c^2$}\nAnd an image: ![Example Image](images/template.jpg)\n<!--\nDiferent font\n-->/c{rgb(255, 140, 0)}{$\\texttt{Font: Text Typewriter}$}\n<!--color in just a few caracters of LateX--><!-- pi is in green\n-->$\\textcolor{rgb(0, 204, 153)}{green\\ \\pi} \\;times\\; \\color{rgb(255, 0, 0)}{my\\ red\\ equation}$<!-- \nthis is a coment (don't put coments inside LaTeX [($  $) or ($$ $$)] it will break editor coloring\n\nIf you want an aligned equation divided in many lines to be saved in just a single SVG you need to put each line inside of a matrix, used in the next example: -->\nMaxwell's equations: $$\n\\begin{align}\n\\vec{\\nabla} \\cdot \\vec{E} & = \\frac{\\rho}{\\epsilon_0} &&\\text{Gauss's Law} \\\\\n\\vec{\\nabla} \\cdot \\vec{B} & = 0 &&\\text{Gauss's Law for Magnetism} \\\\\n\\vec{\\nabla} \\times \\vec{E} & = -\\frac{\\partial \\vec{B}}{\\partial t} &&\\text{Faraday's Law of Induction} \\\\\n\\vec{\\nabla} \\times \\vec{B} & = \\mu_0\\left( \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t} + \\vec{J} \\right) &&\\text{Ampere's Law}\n\\end{align}\n$$ <!--end of single SVG-->\n";
	setTimeout(() => {
	 inputText.value +="Quemistry:\n$$\\ce{K = \\frac{[\\ce{Hg^2+}][\\ce{Hg}]}{[\\ce{Hg2^2+}]}}$$\n$$\n\\ce{Zn^2+ <=>[+ 2OH-][+ 2H+] \\underset{\\text{amphoteres Hydroxid}}{\\ce{Zn(OH)2 v}} <=>[+ 2OH-][+ 2H+] \\underset{\\text{Hydroxozikat}}{\\ce{[Zn(OH)4]^2-}}}\n$$";
	 updateOutput();
	}, 500); 
    updateOutput();
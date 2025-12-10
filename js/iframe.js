async function abrirOverlay() {
  // Bloqueia scroll do body principal
  document.body.style.overflow = 'hidden';

  // Remove overlay antigo se existir
  const old = document.getElementById('overlayFrame');
  if (old) old.remove();

  // Cria overlay
  const iframe = document.createElement('iframe');
  iframe.id = 'overlayFrame';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.backdropFilter = 'blur(8px)';
  iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  iframe.style.pointerEvents = 'auto';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<style>' +
    'html, body{margin:0;height:100%;width:100%;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;font-family:sans-serif;}' +
    '.bar{width:333px;height:100vh;background:#6c8dada9;box-shadow:0 0 20px rgba(0,0,0,0.25);border-left:1px solid rgba(0,0,0,0.1);border-right:1px solid rgba(0,0,0,0.1);backdrop-filter:blur(12px);display:flex;flex-direction:column;align-items:center;padding:20px;overflow-y:auto;scroll-behavior:smooth;gap:10px;}' +
    '.button-row{width:100%;display:flex;justify-content:space-between;margin-top:10px;margin-bottom:10px;}' +
    'button{flex:1;margin:0 5px;background:#34495e;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;transition:background 0.2s ease;}' +
    'button:hover{background:#2c3e50;}' +
    '.svg-container{margin-bottom:10px;}' +
    'svg{max-width:320px;width:100%;height:auto;}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="bar" id="svgContainer">' +
    '<div class="button-row">' +
    '<button id="downloadBtn">Download SVG\'s</button>' +
    '<button id="closeBtn">Close</button>' +
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>'
  );
  doc.close();

  // Botão para fechar overlay
  doc.getElementById('closeBtn').addEventListener('click', () => {
    iframe.remove();
    document.body.style.overflow = ''; // desbloqueia scroll do body principal
  });

  // Botão para fazer download de todos os SVGs
  doc.getElementById('downloadBtn').addEventListener('click', async () => {
	  // Seleciona todos SVGs na tela
	  const svgElements = Array.from(doc.querySelectorAll('.svg-container svg'));

	  // Remove todos SVGs sem role="img" do DOM
	  svgElements.forEach(svg => {
		if (svg.getAttribute('role') !== 'img') {
		  svg.parentNode.removeChild(svg);
		}
	  });

	  // Após remover, seleciona novamente SO os SVGs válidos
	  const filteredSVGs = Array.from(doc.querySelectorAll('.svg-container svg'))
		.filter(svg => svg.getAttribute('role') === 'img');

	  if (filteredSVGs.length === 0) return alert('Nenhum SVG para baixar.');

	  if (!window.JSZip) {
		await new Promise((resolve, reject) => {
		  const script = document.createElement('script');
		  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
		  script.onload = resolve;
		  script.onerror = () => reject('Falha ao carregar JSZip');
		  document.head.appendChild(script);
		});
	  }

	  const zip = new JSZip();
	  filteredSVGs.forEach((svgEl, idx) => {
		const clone = svgEl.cloneNode(true);
		zip.file(`equation_${idx + 1}.svg`, new XMLSerializer().serializeToString(clone));
	  });

	  const blob = await zip.generateAsync({ type: 'blob' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = 'equations.zip';
	  document.body.appendChild(a);
	  a.click();
	  a.remove();
	  URL.revokeObjectURL(url);
   });


  // Função auxiliar — renderiza MathJax e retorna SVGs
  async function renderMathIsolatedToSVGs(inputText) {
    const tmpIframe = document.createElement('iframe');
    tmpIframe.style.position = 'absolute';
    tmpIframe.style.left = '-9999px';
    tmpIframe.style.top = '0';
    document.body.appendChild(tmpIframe);

    const tmpDoc = tmpIframe.contentDocument;
    tmpDoc.open();
    tmpDoc.write(
	  '<!DOCTYPE html>' +
	  '<html lang="en">' +
	  '<head>' +
	  '<meta charset="utf-8">' +
	  '<script>' +
	  'window.MathJax = {' +
	  'tex: { inlineMath: [[\'$\', \'$\']], displayMath: [[\'$$\', \'$$\']], packages: {\'[+]\': [\'mhchem\']} },' +
	  'options: { renderActions: { findScript: [10, function (doc) { doc.findMath(); }, \'\'] } },' +
	  'loader: { load: [\'[tex]/mhchem\'] }' +
	  '};' +
	  '</script>' +
	  '<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js"></script>' +
	  '</head>' +
	  '<body>' +
	  '<div id="container">' + inputText + '</div>' +
	  '</body>' +
	  '</html>'
	);
    tmpDoc.close();

    await new Promise(resolve => {
      const win = tmpIframe.contentWindow;
      const check = () => {
        if (win.MathJax?.startup?.promise) {
          win.MathJax.startup.promise.then(() => setTimeout(resolve, 100));
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });

    const svgElements = Array.from(tmpDoc.querySelectorAll('mjx-container[jax="SVG"] svg'))
      .filter(svg => !svg.closest('mjx-assistive-mml'));

    const svgStrings = svgElements.map(svgEl => {
      const clone = svgEl.cloneNode(true);
      const spanParent = svgEl.closest('span[style*="color"]');
      if (spanParent) {
        const computedColor = spanParent.style.color || getComputedStyle(spanParent).color;
        if (computedColor) clone.setAttribute('color', computedColor);
      }
      // Limita largura máxima a 320px
      const widthAttr = parseFloat(clone.getAttribute('width')) || 0;
      const heightAttr = parseFloat(clone.getAttribute('height')) || 0;
      if (widthAttr > 320) {
        const scale = 320 / widthAttr;
        clone.setAttribute('width', '320');
        clone.setAttribute('height', (heightAttr * scale).toString());
      }
      clone.style.maxWidth = '320px';
      clone.style.width = '100%';
      clone.style.height = 'auto';
      return clone.outerHTML;
    });

    tmpIframe.remove();
    return svgStrings;
  }

  // Pega input #inputText do documento principal
  const inputEl = document.getElementById('inputText');
  if (!inputEl) throw new Error("❌ Elemento #inputText não encontrado!");
  if (!inputEl.value.trim()) throw new Error("❌ O campo #inputText está vazio!");

  let text = inputEl.value.trim();
  if (!text.startsWith('$$1$$')) {
    text = `$$1$$${text}`;
    inputEl.value = text.replace(/^\$\$1\$\$/, '');
  }
  
	text = text.replace(/<!--[\s\S]*?-->/g, ''); // remove LateX dentro de comentarios <!-- -->
  const colorCommand = /\/c\{((?:red|green|blue)|#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))\}\{((?:[^{}]|\{[^}]*\})*)\}/g;
  const inlineMath = /\$([^\$]+?)\$/g;
  const displayMath = /\$\$([\s\S]+?)\$\$/g;
  const combinedRegex = new RegExp(`${colorCommand.source}|${displayMath.source}|${inlineMath.source}`, 'g');

  const filtered = [...text.matchAll(combinedRegex)].map(m => m[0]).join('\n');
  const filteredWithColors = filtered.replace(colorCommand, (_, cor, conteudo) => {
    if (!/\${1,2}[\s\S]*?\${1,2}/.test(conteudo)) return conteudo;
    return conteudo.replace(/\${1,2}([\s\S]*?)\${1,2}/g, m => `<span style="color:${cor}">${m}</span>`);
  });

  const textForMathJax = filteredWithColors.replace(/^\$\$1\$\$/, '');

  // Renderiza e insere SVGs no overlay na ordem correta
  const svgList = await renderMathIsolatedToSVGs(textForMathJax);
  const container = doc.getElementById('svgContainer');

  svgList.forEach(svg => {
	  // Cria um DOM Parser para pesquisar atributos
	  const parser = new DOMParser();
	  const docSVG = parser.parseFromString(svg, "image/svg+xml");
	  const svgEl = docSVG.querySelector("svg");
	  // Testa os critérios de aceitação
	  if (svgEl && svgEl.getAttribute("role") === "img") {
		const wrapper = doc.createElement('div');
		wrapper.className = 'svg-container';
		wrapper.innerHTML = svg;
		container.appendChild(wrapper);
	  }
	});
  
}
  document.getElementById('exportEquations').addEventListener('click', abrirOverlay);

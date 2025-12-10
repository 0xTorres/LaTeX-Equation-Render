function End_Tutorial() {
  var div = document.getElementById('botoesFundo2');
  if (div) {
    div.remove();
  }
  var textarea = document.getElementById('inputText');
  if (textarea) {
    textarea.value = '';  // Limpa o texto do textarea
  }
  syncOverlay();

  // Adiciona um atraso de 50ms antes de executar updateOutput()
  setTimeout(function() {
    updateOutput();
  }, 50); 
}

function inverterCorTexto(id) {
  const el = document.getElementById(id);
  if (!el) return;

  // obtém cor atual computada do texto (rgb)
  const corAtual = window.getComputedStyle(el).color;
  // extrai valores RGB 
  const rgb = corAtual.match(/\d+/g).map(Number);

  // inverte cada componente RGB
  const rInv = 255 - rgb[0];
  const gInv = 255 - rgb[1];
  const bInv = 255 - rgb[2];

  // aplica cor invertida como rgb
  el.style.color = `rgb(${rInv}, ${gInv}, ${bInv})`;
}


  function toggleModeText() {
    const btn = document.querySelector('.btns_dark_light');
    if (btn.textContent.includes('Dark Mode')) {
      btn.textContent = 'Light Mode ⚪️';
	  
	  document.body.style.backgroundColor = "#222";
	  document.body.style.color = "#fff";
	  inverterCorTexto('highlightedText');
	  inverterCorTexto('renderedOutput');
	  document.getElementById('inputText').style.caretColor = '#ffc9c9';

	  
    } else {
      btn.textContent = 'Dark Mode ⚫️';
	  
	  document.body.style.backgroundColor = "rgb(255, 255, 255)";
	  document.body.style.color = "rgb(34, 34, 34)";
	  inverterCorTexto('highlightedText');
	  inverterCorTexto('renderedOutput');
	  document.getElementById('inputText').style.caretColor = '#000000';
	  
    }
  }
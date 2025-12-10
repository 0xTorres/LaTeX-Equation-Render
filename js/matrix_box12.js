
    // para adicionar sem redeclarar:
    Object.assign(svgTextMap, {
      // mais símbolos novos
    });

    // Mapeamento SVG para tipos
    const svgFilenameToMatrixType = {
    "equacao_1__begin_matrix______________end_matrix_.svg": "matrix",
    "equacao_2__begin_bmatrix______________end_bmatrix_.svg": "bmatrix",
    "equacao_4__begin_pmatrix______________end_pmatrix_.svg": "pmatrix",
    "equacao_5__bigl__begin_smallmatrix______________end_smallmatrix__bigr_.svg": "smallmatrix",
    "equacao_6__begin_vmatrix______________end_vmatrix_.svg": "vmatrix",
    "equacao_7__begin_Bmatrix______________end_Bmatrix_.svg": "Bmatrix",
    "equacao_8__begin_Vmatrix______________end_Vmatrix_.svg": "Vmatrix",
    "equacao_9__begin_align_______________end_align__.svg": "align",
    "equacao_10__left__begin_matrix______________end_matrix__right_.svg": "matrixVbar",
    "equacao_11__left__begin_matrix______________end_matrix__right__.svg": "matrixBrace",
    "equacao_12__left__begin_matrix______________end_matrix__right___.svg": "matrixLeftBrace"
  };

    const matrixRelatedFiles = new Set(Object.keys(svgFilenameToMatrixType));

    let modalMatrizType = "matrix";

    // Gera LaTeX conforme tipo, linhas e colunas
  
      function gerarMatrixLatex(rows, cols, tipo) {
      const map = {
        'matrix': {pre: "\\begin{matrix}", post: "\\end{matrix}"},
        'bmatrix': {pre: "\\begin{bmatrix}", post: "\\end{bmatrix}"},
        'pmatrix': {pre: "\\begin{pmatrix}", post: "\\end{pmatrix}"},
        'smallmatrix': {pre: "\\bigl(\\begin{smallmatrix}", post: "\\end{smallmatrix}\\bigr)"},
        'vmatrix': {pre: "\\begin{vmatrix}", post: "\\end{vmatrix}"},
        'Bmatrix': {pre: "\\begin{Bmatrix}", post: "\\end{Bmatrix}"},
        'Vmatrix': {pre: "\\begin{Vmatrix}", post: "\\end{Vmatrix}"},
        'matrixVbar': {pre: "\\left.\\begin{matrix}", post: "\\end{matrix}\\right|"},
        'matrixBrace': {pre: "\\left.\\begin{matrix}", post: "\\end{matrix}\\right\\}"},
        'matrixLeftBrace': {pre: "\\left\\{\\begin{matrix}", post: "\\end{matrix}\\right."}
      };

      if (tipo === 'align') {
        let body = '';
        if (rows === 1 || rows === 2) {
          // para 1 ou 2 linhas, somente linhas vazias que terminam com \\
          for (let i = 0; i < rows; i++) {
            body += ' \\\\\n';
          }
        } else if (rows >= 3) {
          // para 3 ou mais linhas:
    // todas linhas vazias terminam com \\, exceto a penúltima
          for (let i = 0; i < rows - 2; i++) {
            body += ' \\\\\n';
          }
    // penúltima linha termina com \\ e vem \hline depois
          body += ' \\\\\n';
          body += '\\hline\n';
    // linha final vazia, sem \\
          body += ' \n';
        }
        return `\\begin{align*}\n${body}\\end{align*}`;
      }

      const {pre, post} = map[tipo] || map['matrix'];

      let tex = `${pre}\n`;
      for (let i = 0; i < rows; i++) {
        tex += Array(cols).fill(' ').join(' & ');
        if (i < rows - 1) tex += ' \\\\\n';
      }
      tex += `\n${post}`;
      return tex;
    }


    function showMatrixModal(tipo) {
      modalMatrizType = tipo;
      const caixa = document.getElementById("caixaSymb12");
      caixa.classList.add("hide");

      const modal = document.getElementById("matrixModal");
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add("show"), 40);

      const selection = document.getElementById('matrixSelection');
      // Para tipo align, aplica layout vertical
      if (tipo === 'align') {
        selection.classList.add('vertical-grid');
        document.getElementById('modal-columns').value = 1;
        document.getElementById('modal-columns').setAttribute('readonly', 'readonly');
        fillMatrixGrid(2, 1); // comece com 2 linhas, 1 coluna
      } else {
        selection.classList.remove('vertical-grid');
        document.getElementById('modal-columns').removeAttribute('readonly');
        fillMatrixGrid(2, 2);
      }
      document.getElementById('modal-rows').value = 2;
    }

    function hideMatrixModal() {
      const modal = document.getElementById("matrixModal");
      modal.classList.remove("show");
      setTimeout(() => modal.style.display = "none", 410);

      const caixa = document.getElementById("caixaSymb12");
      caixa.style.display = '';
      setTimeout(() => caixa.classList.remove("hide"), 50);
    }

    function fillMatrixGrid(rows = 2, cols = 2) {
      const max = 8;
      const matrixSelection = document.getElementById("matrixSelection");
      matrixSelection.innerHTML = "";
      let tipo = modalMatrizType;
      // Se for align, só 1 coluna
      let maxCols = (tipo === 'align') ? 1 : max;

      for (let i = 0; i < max; i++) for (let j = 0; j < maxCols; j++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.dataset.row = i + 1;
        cell.dataset.col = j + 1;
        cell.addEventListener('mouseenter', () => highlightGrid(i, j, false));
        cell.addEventListener('mouseleave', () => resetHighlightGrid());
        cell.addEventListener('click', () => {
          document.getElementById('modal-rows').value = i + 1;
          document.getElementById('modal-columns').value = j + 1;
          highlightGrid(i, j, true);
        });
        matrixSelection.appendChild(cell);
      }
      highlightGrid(rows - 1, cols - 1, true);
    }

    function highlightGrid(row, col, active) {
      document.querySelectorAll('.matrix-cell').forEach(c=>{
        const r=c.dataset.row-1, k=c.dataset.col-1;
        if(r<=row && k<=col) c.classList.add(active?'active':'hover');
        else c.classList.remove('active','hover');
      });
    }

    function resetHighlightGrid() {
      const r=document.getElementById('modal-rows').value-1;
      const c=document.getElementById('modal-columns').value-1;
      highlightGrid(r,c,true);
    }

    document.getElementById('modal-rows').addEventListener('input', function () {
      const rows = Number(this.value);
      const cols = (modalMatrizType === 'align') ? 1 : Number(document.getElementById('modal-columns').value);
      fillMatrixGrid(rows, cols);
    });

    document.getElementById('modal-columns').addEventListener('input', function () {
      if (modalMatrizType !== 'align') {
        fillMatrixGrid(Number(document.getElementById('modal-rows').value), Number(this.value));
      }
    });

    document.getElementById('voltarBtn').addEventListener('click', hideMatrixModal);

    document.getElementById('okBtn').addEventListener('click', () => {
      const rows = Number(document.getElementById('modal-rows').value);
      const cols = Number(document.getElementById('modal-columns').value);
      const latex = gerarMatrixLatex(rows, cols, modalMatrizType);

      // Usa a função unificada de inserção
      if (typeof insertTextIntoBox === 'function') {
          insertTextIntoBox(latex);
      } else {
          const textarea = document.getElementById("inputText");
          textarea.value += latex;
          textarea.focus();
          if (typeof syncOverlay === 'function') syncOverlay();
          if (typeof updateOutput === 'function') updateOutput();
      }

      hideMatrixModal();
    });

    document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.svg-btn12').forEach(svgImg => {
      const filename = svgImg.src.split('/').pop();
      svgImg.addEventListener('click', function () {
        if (matrixRelatedFiles.has(filename)) {
          showMatrixModal(svgFilenameToMatrixType[filename] || 'matrix');
        } else if (svgTextMap[filename]) {
          const textbox = document.getElementById("inputText");
          if (textbox) {
            textbox.value += svgTextMap[filename];
            textbox.focus();
          } else {
            alert('Texto para inserir: ' + svgTextMap[filename]);
          }
        }
      });
    });
  });
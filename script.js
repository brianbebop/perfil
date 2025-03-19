const perfisDiv = document.getElementById('perfis');
const adicionarPerfilButton = document.getElementById('adicionarPerfil');
const calcularButton = document.getElementById('calcular');
const resultadoDiv = document.getElementById('resultado');
const resumoBarrasTabela = document.getElementById('resumoBarras').getElementsByTagName('tbody')[0];
const nomeProjetoInput = document.getElementById('nomeProjeto');

let perfis = [];
let contadorPerfil = 0;

adicionarPerfilButton.addEventListener('click', () => {
    const perfilId = String.fromCharCode(65 + contadorPerfil);
    const perfilDiv = document.createElement('div');
    perfilDiv.classList.add('perfil');
    perfilDiv.innerHTML = `
        <label for="perfil-${perfilId}">Perfil ${perfilId} (mm):</label>
        <input type="number" id="perfil-${perfilId}" placeholder="Tamanho (mm)">
    `;
    perfisDiv.appendChild(perfilDiv);
    perfis.push({ id: perfilId, input: perfilDiv.querySelector('input') });
    contadorPerfil++;
});

calcularButton.addEventListener('click', () => {
    const tamanhoBarra = 6000; // 6000mm
    const perfisComTamanho = perfis.map(perfil => ({
        id: perfil.id,
        tamanho: parseInt(perfil.input.value)
    }));

    // Função para encontrar a melhor combinação de perfis para uma barra
    function encontrarMelhorCombinacao(perfisRestantes, espacoLivre) {
        let melhorCombinacao = { perfis: [], sobra: espacoLivre };

        function combinar(combinacaoAtual, sobraAtual, indiceAtual) {
            if (sobraAtual < melhorCombinacao.sobra) {
                melhorCombinacao = { perfis: combinacaoAtual, sobra: sobraAtual };
            }

            if (indiceAtual < perfisRestantes.length) {
                const perfilAtual = perfisRestantes[indiceAtual];
                if (sobraAtual >= perfilAtual.tamanho) {
                    combinar(
                        [...combinacaoAtual, perfilAtual],
                        sobraAtual - perfilAtual.tamanho,
                        indiceAtual + 1
                    );
                }
                combinar(combinacaoAtual, sobraAtual, indiceAtual + 1);
            }
        }

        combinar([], espacoLivre, 0);
        return melhorCombinacao;
    }

    // Algoritmo de otimização
    const barras = [];
    let perfisRestantes = [...perfisComTamanho];
    while (perfisRestantes.length > 0) {
        const melhorCombinacao = encontrarMelhorCombinacao(perfisRestantes, tamanhoBarra);
        barras.push({ perfis: melhorCombinacao.perfis, espacoLivre: melhorCombinacao.sobra });
        perfisRestantes = perfisRestantes.filter(
            perfil => !melhorCombinacao.perfis.includes(perfil)
        );
    }

    // Exibe o resultado na tabela
    resumoBarrasTabela.innerHTML = ''; // Limpa a tabela
    barras.forEach((barra, index) => {
        const novaLinha = resumoBarrasTabela.insertRow();
        const colunaBarra = novaLinha.insertCell(0);
        const colunaPerfis = novaLinha.insertCell(1);
        const colunaSobra = novaLinha.insertCell(2);

        colunaBarra.textContent = `Barra ${index + 1}`;
        colunaPerfis.textContent = barra.perfis.map(perfil => `${perfil.id} (${perfil.tamanho}mm)`).join(', ');
        colunaSobra.textContent = `${barra.espacoLivre} mm`;
    });

    // Exibe o nome do projeto
    const nomeProjeto = nomeProjetoInput.value;
    if (nomeProjeto) {
        document.querySelector('h1').textContent = `Otimização de Corte de Perfis (mm) - ${nomeProjeto}`;
    } else {
        document.querySelector('h1').textContent = `Otimização de Corte de Perfis (mm)`;
    }
});

// ... (código existente) ...

const exportarCSVButton = document.getElementById('exportarCSV');

exportarCSVButton.addEventListener('click', () => {
    const nomeProjeto = nomeProjetoInput.value || 'Otimizacao_Corte_Perfis';
    const nomeArquivo = `${nomeProjeto}.csv`;

    let csvContent = 'Barra,Perfis,Sobra (mm)\r\n'; // Cabeçalho CSV
    const linhasTabela = resumoBarrasTabela.rows;
    for (let i = 0; i < linhasTabela.length; i++) {
        const linha = linhasTabela[i];
        const colunas = linha.cells;
        const linhaCSV = `${colunas[0].textContent},"${colunas[1].textContent}",${colunas[2].textContent}\r\n`;
        csvContent += linhaCSV;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, nomeArquivo);
    } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', nomeArquivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
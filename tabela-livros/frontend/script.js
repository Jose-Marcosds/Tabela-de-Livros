document.addEventListener("DOMContentLoaded", () => {
    carregarLivros(); // Carrega os livros ao carregar a página

    document.getElementById("ordenarPor").addEventListener("change", carregarLivros); // Atualiza os livros ao mudar o criterio de ordenação

    document.getElementById("btnAdicionar").addEventListener("click", () => { // Abre o modal
        document.getElementById("modal").style.display = "flex"; // Mostra o modal
        document.getElementById("form-livro").reset(); // Limpa o formulário
        document.getElementById("form-livro").onsubmit = adicionarLivro; // Define a função de envio
    });//resumo de tudo a cima:Quando o botão "Adicionar Livro" for clicado:
    //O modal será exibido (display: flex).
    //O formulário será resetado (limpo).
    //A função adicionarLivro será chamada quando o usuário enviar o formulário.

    document.querySelector(".fechar").addEventListener("click", () => { // Fecha o modal
        document.getElementById("modal").style.display = "none"; // Esconde o modal
    });
});

function carregarLivros() { // Função para carregar os livros
    const criterioOrdenacao = document.getElementById("ordenarPor").value; // Obtem o criterio de ordenação

    fetch("http://localhost:3000/livros") //Faz uma requisição para obter a lista de livros do JSON Server.
        .then(response => response.json()) // Transforma a resposta em um objeto JSON
        .then(livros => { // Preenche a tabela com os livros
            if (criterioOrdenacao) { // Se houver um criterio de ordenação
                let ordemDecrescente = criterioOrdenacao.includes("-desc");// Verifica se a ordem é decrescente
                let chaveOrdenacao = criterioOrdenacao.replace("-desc", "");// Remove "-desc" se houver

                livros.sort((a, b) => { // Ordena os livros
                    if (chaveOrdenacao === "nota" || chaveOrdenacao === "paginas") { // Se a chave de ordenação for "nota" ou "paginas"
                        return ordemDecrescente // Verifica se a ordem é decrescente
                            ? Number(b[chaveOrdenacao]) - Number(a[chaveOrdenacao]) // Inverte a ordem
                            : Number(a[chaveOrdenacao]) - Number(b[chaveOrdenacao]);// Inverte a ordem
                    } else { // Se a chave de ordenação for outra
                        return ordemDecrescente // Verifica se a ordem é decrescente
                            ? b[chaveOrdenacao].localeCompare(a[chaveOrdenacao])// Inverte a ordem
                            : a[chaveOrdenacao].localeCompare(b[chaveOrdenacao]);// Inverte a ordem
                    }
                });
            }

            const listaLivros = document.getElementById("lista-livros"); // Seleciona a tabela
            listaLivros.innerHTML = "";// Limpa a tabela

            livros.forEach(livro => {// Para cada livro, cria uma linha na tabela
                const livroItem = document.createElement("tr");// Cria uma linha
                livroItem.innerHTML = `
                    <td>${livro.titulo}</td> 
                    <td>${livro.autor}</td>
                    <td>${livro.inicio}</td>
                    <td>${livro.fim}</td>
                    <td>${livro.paginas}</td>
                    <td>${livro.pais}</td>
                    <td>${livro.nota}</td>
                    <td>
                        <button onclick="editarLivro(${livro.id})">✏️ Editar</button>
                        <button onclick="removerLivro(${livro.id})">🗑️ Remover</button>
                    </td>
                `;
                listaLivros.appendChild(livroItem);// Adiciona a linha na tabela
            });
        })
        .catch(error => console.error("Erro ao carregar os livros:", error));// Se houver algum erro, imprime no console
}
formLivro.addEventListener("submit", async function(event) {// Função para adicionar um livro
    event.preventDefault();// Evita o comportamento padrão do formulário

    // Buscando a lista de livros para encontrar o próximo ID disponível
    let response = await fetch("http://localhost:3000/livros");// Faz uma requisição para obter a lista de livros
    let livros = await response.json();// Transforma a resposta em um objeto JSON
    
    // Gerando um novo ID único
    let novoId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;// Se houver livros, busca o maior ID e adiciona 1, caso contrário, inicia com 1

    const novoLivro = {// Objeto com os dados do novo livro
        id: novoId, // Adicionando ID único manualmente
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        inicio: document.getElementById("inicio").value,
        fim: document.getElementById("fim").value,
        paginas: document.getElementById("paginas").value,
        pais: document.getElementById("pais").value,
        nota: document.getElementById("nota").value
    };

    fetch("http://localhost:3000/livros", {// Faz uma requisição para adicionar o novo livro
        method: "POST",// Usando o método POST
        headers: {
            "Content-Type": "application/json"// Definindo o cabeçalho da requisição
        },
        body: JSON.stringify(novoLivro)// Transformando o objeto em uma string JSON
    })
    .then(response => response.json())// Transformando a resposta em um objeto JSON
    .then(() => {
        carregarLivros(); // Atualiza a lista na tela
        formLivro.reset(); // Limpa o formulário
        modal.style.display = "none";// Fecha o modal
    })
    .catch(error => console.error("Erro ao adicionar livro:", error));// Se houver algum erro, imprime no console
});


function removerLivro(id) { // Função para remover um livro
    fetch(`http://localhost:3000/livros/${id}`, { method: "DELETE" })// Faz uma requisição para remover o livro
        .then(response => { // Verifica se a requisição foi bem-sucedida
            if (!response.ok) throw new Error("Erro ao remover o livro");// Se não for bem-sucedida, lança um erro
            return response.json();// Se bem-sucedida, transforma a resposta em um objeto JSON
        })
        .then(() => carregarLivros())// Atualiza a lista na tela
        .catch(error => console.error("Erro ao remover o livro:", error));// Se houver algum erro, imprime no console
}

function editarLivro(id) {// Função para editar um livro
    fetch(`http://localhost:3000/livros/${id}`)// Faz uma requisição para buscar o livro
        .then(response => {// Verifica se a requisição foi bem-sucedida
            if (!response.ok) throw new Error("Erro ao buscar livro para edição");// Se não for bem-sucedida, lança um erro
            return response.json();// Se bem-sucedida, transforma a resposta em um objeto JSON
        })
        .then(livro => {// Preenche o formulário com os dados do livro
            document.getElementById("titulo").value = livro.titulo;
            document.getElementById("autor").value = livro.autor;
            document.getElementById("inicio").value = livro.inicio;
            document.getElementById("fim").value = livro.fim;
            document.getElementById("paginas").value = livro.paginas;
            document.getElementById("pais").value = livro.pais;
            document.getElementById("nota").value = livro.nota;

            document.getElementById("modal").style.display = "flex";// Mostra o modal

            document.getElementById("form-livro").onsubmit = function (event) {// Função para enviar o formulário
                event.preventDefault();// Evita o comportamento padrão do formulário

                const livroAtualizado = {// Objeto com os dados atualizados
                    titulo: document.getElementById("titulo").value,
                    autor: document.getElementById("autor").value,
                    inicio: document.getElementById("inicio").value,
                    fim: document.getElementById("fim").value,
                    paginas: document.getElementById("paginas").value,
                    pais: document.getElementById("pais").value,
                    nota: document.getElementById("nota").value
                };

                fetch(`http://localhost:3000/livros/${id}`, {// Faz uma requisição para editar o livro
                    method: "PUT",// Usando o método PUT
                    headers: { "Content-Type": "application/json" },// Definindo o cabeçalho da requisição
                    body: JSON.stringify(livroAtualizado)// Transformando o objeto em uma string JSON
                })
                .then(response => {// Verifica se a requisição foi bem-sucedida
                    if (!response.ok) throw new Error("Erro ao editar o livro");//  Se não for bem-sucedida, lança um erro
                    return response.json();// Se bem-sucedida, transforma a resposta em um objeto JSON
                })
                .then(() => {// Atualiza a lista na tela
                    carregarLivros();
                    document.getElementById("modal").style.display = "none";//  Fecha o modal
                    document.getElementById("form-livro").reset();// Limpa o formulário
                })
                .catch(error => console.error("Erro ao editar o livro:", error));// Se houver algum erro, imprime no console
            };
        })
        .catch(error => console.error("Erro ao buscar livro para edição:", error));// Se houver algum erro, imprime no console
}

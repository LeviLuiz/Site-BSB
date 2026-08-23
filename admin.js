const API_URL = "https://bsb-info-api.onrender.com";

const login = document.getElementById("login");
const formularioLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

formularioLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                senha,
            }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "E-mail ou senha incorretos");
        }

        // Guarda o token
        localStorage.setItem("token", dados.token);

        // Esconde o login
        login.style.display = "none";

        // Carrega os orçamentos
        carregarOrcamentos();
    } catch (erro) {
        console.error(erro);
        erroLogin.textContent = erro.message;
    }
});

const lista = document.getElementById("orcamentos");
const mensagem = document.getElementById("mensagem");

const total = document.getElementById("total");
const ultimo = document.getElementById("ultimo");

const atualizar = document.getElementById("atualizar");

const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fecharModal");

const modalNome = document.getElementById("modalNome");
const modalTelefone = document.getElementById("modalTelefone");
const modalEquipamento = document.getElementById("modalEquipamento");
const modalProblema = document.getElementById("modalProblema");
const modalData = document.getElementById("modalData");

const excluir = document.getElementById("excluir");
const editar = document.getElementById("editar");

let orcamentoSelecionado = null;

// ===============================
// FORMATAR DATA
// ===============================

function formatarData(data) {
    if (!data) {
        return "Data desconhecida";
    }

    let dataJS;

    if (data._seconds) {
        dataJS = new Date(data._seconds * 1000);
    } else {
        dataJS = new Date(data);
    }

    return dataJS.toLocaleString("pt-BR");
}

// ===============================
// CARREGAR ORÇAMENTOS
// ===============================

async function carregarOrcamentos() {
    mensagem.style.display = "block";
    mensagem.textContent = "Carregando orçamentos...";

    lista.innerHTML = "";

    try {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const resposta = await fetch(`${API_URL}/orcamentos`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!resposta.ok) {
            throw new Error("Erro na API");
        }

        const orcamentos = await resposta.json();

        total.textContent = orcamentos.length;

        if (orcamentos.length > 0) {
            ultimo.textContent = formatarData(orcamentos[0].data);
        } else {
            ultimo.textContent = "—";
        }

        mensagem.style.display = "none";

        if (orcamentos.length === 0) {
            mensagem.style.display = "block";
            mensagem.textContent = "Nenhum orçamento recebido.";

            return;
        }

        orcamentos.forEach((orcamento) => {
            const elemento = document.createElement("article");

            elemento.className = "orcamento";

            elemento.innerHTML = `
                <div>

                    <h3>${escaparHTML(orcamento.nome)}</h3>

                    <div class="orcamento-info">

                        <span class="tag">
                            ${escaparHTML(orcamento.telefone)}
                        </span>

                        <span class="tag">
                            ${escaparHTML(orcamento.equipamento)}
                        </span>

                    </div>

                    <p class="problema-resumo">
                        ${escaparHTML(orcamento.problema)}
                    </p>

                    <p class="data">
                        ${formatarData(orcamento.data)}
                    </p>

                </div>

                <div class="acoes">

                    <button
                        class="btn btn-ver"
                        onclick='abrirOrcamento(${JSON.stringify(orcamento)})'>
                        Ver
                    </button>

                    <button
                        class="btn btn-excluir"
                        onclick="excluirOrcamento('${orcamento.id}')">
                        Excluir
                    </button>

                </div>
            `;

            lista.appendChild(elemento);
        });
    } catch (erro) {
        console.error(erro);

        mensagem.style.display = "block";
        mensagem.textContent = "Não foi possível carregar os orçamentos.";
    }
}

// ===============================
// ABRIR ORÇAMENTO
// ===============================

function abrirOrcamento(orcamento) {
    orcamentoSelecionado = orcamento;

    modalNome.textContent = orcamento.nome;
    modalTelefone.textContent = orcamento.telefone;
    modalEquipamento.textContent = orcamento.equipamento;
    modalProblema.textContent = orcamento.problema;
    modalData.textContent = formatarData(orcamento.data);

    modal.classList.add("aberto");
}

// ===============================
// FECHAR MODAL
// ===============================

fecharModal.addEventListener("click", () => {
    modal.classList.remove("aberto");
});

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("aberto");
    }
});

// ===============================
// EXCLUIR
// ===============================

async function excluirOrcamento(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este orçamento?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/orcamentos/${id}`, {
            method: "DELETE",
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro);
        }

        modal.classList.remove("aberto");

        await carregarOrcamentos();
    } catch (erro) {
        console.error(erro);

        alert("Erro ao excluir orçamento.");
    }
}

// ===============================
// EDITAR
// ===============================

editar.addEventListener("click", async () => {
    if (!orcamentoSelecionado) {
        return;
    }

    const nome = prompt("Nome:", orcamentoSelecionado.nome);

    if (nome === null) {
        return;
    }

    const telefone = prompt("Telefone:", orcamentoSelecionado.telefone);

    if (telefone === null) {
        return;
    }

    const equipamento = prompt(
        "Equipamento:",
        orcamentoSelecionado.equipamento,
    );

    if (equipamento === null) {
        return;
    }

    const problema = prompt("Problema:", orcamentoSelecionado.problema);

    if (problema === null) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/orcamentos/${orcamentoSelecionado.id}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    nome,
                    telefone,
                    equipamento,
                    problema,
                }),
            },
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro);
        }

        modal.classList.remove("aberto");

        await carregarOrcamentos();
    } catch (erro) {
        console.error(erro);

        alert("Erro ao atualizar orçamento.");
    }
});

// ===============================
// ATUALIZAR
// ===============================

atualizar.addEventListener("click", carregarOrcamentos);

// ===============================
// SEGURANÇA BÁSICA
// ===============================

function escaparHTML(texto) {
    const div = document.createElement("div");

    div.textContent = texto ?? "";

    return div.innerHTML;
}

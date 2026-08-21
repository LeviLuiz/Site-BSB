const formulario = document.getElementById("form-orcamento");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const equipamento = document.getElementById("equipamento").value;
    const problema = document.getElementById("problema").value;

    try {
        const resposta = await fetch("http://localhost:3000/orcamentos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                nome,
                telefone,
                equipamento,
                problema
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao enviar orçamento");
        }

        alert("Orçamento enviado com sucesso!");

        formulario.reset();

        console.log("Orçamento criado:", dados);

    } catch (erro) {
        console.error(erro);

        alert("Não foi possível enviar o orçamento. Tente novamente.");
    }
});
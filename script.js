const formulario = document.getElementById("form-orcamento");
const telefoneInput = document.getElementById("telefone");

formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const botao = formulario.querySelector('button[type="submit"]');

    // Impede envio duplicado
    botao.disabled = true;
    botao.textContent = "Enviando...";

    const nome = document.getElementById("nome").value;
    const telefone = telefoneInput.value;
    const equipamento = document.getElementById("equipamento").value;
    const problema = document.getElementById("problema").value;

    try {

        const resposta = await fetch(
            "https://bsb-info-api.onrender.com/orcamentos",
            {
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
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Erro ao enviar orçamento"
            );
        }

        alert("Orçamento enviado com sucesso!");

        formulario.reset();

        console.log("Orçamento criado:", dados);

    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível enviar o orçamento. Tente novamente."
        );

    } finally {

        // Libera o botão novamente
        botao.disabled = false;
        botao.textContent = "Enviar solicitação";
    }
});

// Somente números no telefone

telefoneInput.addEventListener("input", () => {

    telefoneInput.value = telefoneInput.value.replace(/\D/g, "");

});
const express = require("express");
const cors = require("cors");

const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getFirestore
} = require("firebase-admin/firestore");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();


// ===============================
// EXPRESS
// ===============================

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// TESTE DA API
// ===============================

app.get("/", (req, res) => {
    res.json({
        mensagem: "API da BSB Info funcionando!"
    });
});


// ===============================
// CRIAR ORÇAMENTO
// POST /orcamentos
// ===============================

app.post("/orcamentos", async (req, res) => {
    try {

        const {
            nome,
            telefone,
            equipamento,
            problema
        } = req.body;

        if (!nome || !telefone || !equipamento || !problema) {
            return res.status(400).json({
                erro: "Nome, telefone, equipamento e problema são obrigatórios"
            });
        }

        const novoOrcamento = await db
            .collection("orcamentos")
            .add({
                nome,
                telefone,
                equipamento,
                problema,
                data: new Date()
            });

        res.status(201).json({
            mensagem: "Orçamento criado!",
            id: novoOrcamento.id
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao criar orçamento"
        });
    }
});


// ===============================
// LISTAR TODOS OS ORÇAMENTOS
// GET /orcamentos
// ===============================

// LISTAR ORÇAMENTOS
app.get("/orcamentos", async (req, res) => {
    try {
        const snapshot = await db
            .collection("orcamentos")
            .orderBy("data", "desc")
            .get();

        const orcamentos = [];

        snapshot.forEach((doc) => {
            orcamentos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(orcamentos);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar orçamentos"
        });
    }
});


// ===============================
// BUSCAR UM ORÇAMENTO
// GET /orcamentos/:id
// ===============================

app.get("/orcamentos/:id", async (req, res) => {
    try {

        const id = req.params.id;

        const doc = await db
            .collection("orcamentos")
            .doc(id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                erro: "Orçamento não encontrado"
            });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar orçamento"
        });
    }
});


// ===============================
// ATUALIZAR ORÇAMENTO
// PATCH /orcamentos/:id
// ===============================

app.patch("/orcamentos/:id", async (req, res) => {
    try {

        const id = req.params.id;

        const {
            nome,
            telefone,
            equipamento,
            problema
        } = req.body;

        const dadosAtualizados = {};

        if (nome !== undefined) {
            dadosAtualizados.nome = nome;
        }

        if (telefone !== undefined) {
            dadosAtualizados.telefone = telefone;
        }

        if (equipamento !== undefined) {
            dadosAtualizados.equipamento = equipamento;
        }

        if (problema !== undefined) {
            dadosAtualizados.problema = problema;
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({
                erro: "Nenhum dado para atualizar"
            });
        }

        const referencia = db
            .collection("orcamentos")
            .doc(id);

        const doc = await referencia.get();

        if (!doc.exists) {
            return res.status(404).json({
                erro: "Orçamento não encontrado"
            });
        }

        await referencia.update(dadosAtualizados);

        res.json({
            mensagem: "Orçamento atualizado!"
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao atualizar orçamento"
        });
    }
});


// ===============================
// APAGAR ORÇAMENTO
// DELETE /orcamentos/:id
// ===============================

app.delete("/orcamentos/:id", async (req, res) => {
    try {

        const id = req.params.id;

        const referencia = db
            .collection("orcamentos")
            .doc(id);

        const doc = await referencia.get();

        if (!doc.exists) {
            return res.status(404).json({
                erro: "Orçamento não encontrado"
            });
        }

        await referencia.delete();

        res.json({
            mensagem: "Orçamento apagado!"
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao apagar orçamento"
        });
    }
});


// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
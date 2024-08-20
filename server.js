const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cadastro-p',
  password: '123456789',
  port: 5432,
});

// Middleware para aumentar o limite de tamanho do corpo da requisição para 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware para servir arquivos estáticos (se necessário)
app.use(express.static('public'));

// Middleware CORS para permitir requisições de origens diferentes
app.use(cors());

// Rota raiz que retorna uma mensagem de sucesso
app.get('/', (_req, res) => {
    res.json({ message: 'Bem-vindo ao backend do meu portfólio!', status: 'success' });
});

// Rota para buscar todos os projetos
app.get('/projetos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.projetos ORDER BY id ASC');
        res.json({ message: 'Projetos carregados com sucesso!', status: 'success', data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        res.status(500).json({ message: 'Erro ao carregar projetos', status: 'error' });
    }
});

// Rota para buscar um projeto específico
app.get('/projetos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM public.projetos WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Projeto encontrado!', status: 'success', data: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Projeto não encontrado', status: 'error' });
        }
    } catch (error) {
        console.error('Erro ao buscar projeto:', error);
        res.status(500).json({ message: 'Erro ao buscar projeto', status: 'error' });
    }
});

// Rota para adicionar novos projetos
app.post('/projetos', async (req, res) => {
    const { title, language, type, description, imageUrl } = req.body;

    // Verificar se todos os campos necessários foram fornecidos
    if (!title || !description) {
        return res.status(400).json({ message: 'Título e descrição são obrigatórios.', status: 'error' });
    }

    try {
        const queryText = `
            INSERT INTO public.projetos (title, language, type, description, imageUrl)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await pool.query(queryText, [title, language, type, description, imageUrl]);
        res.json({ message: 'Projeto adicionado com sucesso!', status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao adicionar projeto:', error);
        res.status(500).json({ message: 'Erro ao adicionar projeto', status: 'error' });
    }
});

// Rota para atualizar um projeto específico
app.put('/projetos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, language, type, description, imageUrl } = req.body;

    try {
        const queryText = `
            UPDATE public.projetos
            SET title = $1, language = $2, type = $3, description = $4, imageUrl = $5
            WHERE id = $6
            RETURNING *`;
        const result = await pool.query(queryText, [title, language, type, description, imageUrl, id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Projeto atualizado com sucesso!', status: 'success', data: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Projeto não encontrado', status: 'error' });
        }
    } catch (error) {
        console.error('Erro ao atualizar projeto:', error);
        res.status(500).json({ message: 'Erro ao atualizar projeto', status: 'error' });
    }
});

// Rota para excluir um projeto específico
app.delete('/projetos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM public.projetos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Projeto excluído com sucesso!', status: 'success', data: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Projeto não encontrado', status: 'error' });
        }
    } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        res.status(500).json({ message: 'Erro ao excluir projeto', status: 'error' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

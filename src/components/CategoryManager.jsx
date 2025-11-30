import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../assets/css/dashboard.css';

const API_BASE = 'http://localhost/app-catalogo-livros-tsi/api';

const CategoryManager = ({ isOpen, onClose, usuarioLogado }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: null, nome: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Buscar categorias do usuário
    useEffect(() => {
        if (isOpen && usuarioLogado?.id) {
            fetchCategorias();
        }
    }, [isOpen, usuarioLogado?.id]);

    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/categorias?usuario_id=${usuarioLogado.id}`
            );

            if (!res.ok) {
                throw new Error('Erro ao buscar categorias');
            }

            const data = await res.json();
            setCategorias(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            toast.error('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            toast.error('O nome da categoria é obrigatório');
            return;
        }

        const isEdit = !!formData.id;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit
            ? `${API_BASE}/categorias/${formData.id}`
            : `${API_BASE}/categorias`;

        const payload = isEdit
            ? { nome: formData.nome.trim() }
            : { nome: formData.nome.trim(), usuario_id: usuarioLogado.id };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erro ao salvar categoria');
            }

            const savedCategoria = await res.json();

            if (isEdit) {
                setCategorias((prev) =>
                    prev.map((cat) => (cat.id === savedCategoria.id ? savedCategoria : cat))
                );
                toast.success('Categoria atualizada!');
            } else {
                setCategorias((prev) => [...prev, savedCategoria]);
                toast.success('Categoria criada!');
            }

            setFormData({ id: null, nome: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            toast.error(error.message || 'Erro ao salvar categoria');
        }
    };

    const handleEdit = (categoria) => {
        setFormData({ id: categoria.id, nome: categoria.nome });
        setIsEditing(true);
    };

    const handleDelete = async (categoriaId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/categorias/${categoriaId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.message || 'Erro ao excluir categoria'
                );
            }

            setCategorias((prev) => prev.filter((cat) => cat.id !== categoriaId));
            toast.success('Categoria excluída!');
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            toast.error(error.message || 'Erro ao excluir categoria');
        }
    };

    const handleCancel = () => {
        setFormData({ id: null, nome: '' });
        setIsEditing(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay open"
            onClick={(e) => {
                if (e.target.className.includes('modal-overlay')) {
                    onClose();
                }
            }}
        >
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Gerenciar Categorias</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                    {/* Formulário */}
                    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nome: e.target.value })
                                    }
                                    placeholder="Nome da categoria"
                                    style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Atualizar' : 'Adicionar'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Lista de Categorias */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                            Minhas Categorias ({categorias.length})
                        </h3>

                        {loading ? (
                            <p style={{ textAlign: 'center', opacity: 0.7 }}>
                                Carregando...
                            </p>
                        ) : categorias.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.7 }}>
                                Nenhuma categoria cadastrada
                            </p>
                        ) : (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {categorias.map((categoria) => (
                                    <div
                                        key={categoria.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            marginBottom: '0.5rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--card-bg)',
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{categoria.nome}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="action-btn"
                                                onClick={() => handleEdit(categoria)}
                                                title="Editar"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(categoria.id)}
                                                title="Excluir"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;

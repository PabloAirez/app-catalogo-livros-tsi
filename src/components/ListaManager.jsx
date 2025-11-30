import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../assets/css/dashboard.css';

const API_BASE = 'http://localhost/app-catalogo-livros-tsi/api';

const ListaManager = ({ isOpen, onClose, usuarioLogado }) => {
    const [listas, setListas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: null, nome: '', descricao: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Buscar listas do usuário
    useEffect(() => {
        if (isOpen && usuarioLogado?.id) {
            fetchListas();
        }
    }, [isOpen, usuarioLogado?.id]);

    const fetchListas = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/listas?usuario_id=${usuarioLogado.id}`
            );

            if (!res.ok) {
                throw new Error('Erro ao buscar listas');
            }

            const data = await res.json();
            setListas(data);
        } catch (error) {
            console.error('Erro ao buscar listas:', error);
            toast.error('Erro ao carregar listas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            toast.error('O nome da lista é obrigatório');
            return;
        }

        const isEdit = !!formData.id;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit
            ? `${API_BASE}/listas/${formData.id}`
            : `${API_BASE}/listas`;

        const payload = isEdit
            ? { 
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim() || null
              }
            : { 
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim() || null,
                usuario_id: usuarioLogado.id 
              };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erro ao salvar lista');
            }

            const savedLista = await res.json();

            if (isEdit) {
                setListas((prev) =>
                    prev.map((lst) => (lst.id === savedLista.id ? savedLista : lst))
                );
                toast.success('Lista atualizada!');
            } else {
                setListas((prev) => [...prev, savedLista]);
                toast.success('Lista criada!');
            }

            setFormData({ id: null, nome: '', descricao: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar lista:', error);
            toast.error(error.message || 'Erro ao salvar lista');
        }
    };

    const handleEdit = (lista) => {
        setFormData({ id: lista.id, nome: lista.nome, descricao: lista.descricao || '' });
        setIsEditing(true);
    };

    const handleDelete = async (listaId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta lista?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/listas/${listaId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.message || 'Erro ao excluir lista'
                );
            }

            setListas((prev) => prev.filter((lst) => lst.id !== listaId));
            toast.success('Lista excluída!');
        } catch (error) {
            console.error('Erro ao excluir lista:', error);
            toast.error(error.message || 'Erro ao excluir lista');
        }
    };

    const handleCancel = () => {
        setFormData({ id: null, nome: '', descricao: '' });
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
                    <h2>Gerenciar Listas</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                    {/* Formulário */}
                    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label>{isEditing ? 'Editar Lista' : 'Nova Lista'}</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nome: e.target.value })
                                    }
                                    placeholder="Nome da lista"
                                />
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) =>
                                        setFormData({ ...formData, descricao: e.target.value })
                                    }
                                    placeholder="Descrição (opcional)"
                                    rows="2"
                                    style={{ marginTop: '0.5rem' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                        {isEditing ? 'Atualizar' : 'Adicionar'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={handleCancel}
                                            style={{ flex: 1 }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Lista de Listas */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                            Minhas Listas ({listas.length})
                        </h3>

                        {loading ? (
                            <p style={{ textAlign: 'center', opacity: 0.7 }}>
                                Carregando...
                            </p>
                        ) : listas.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.7 }}>
                                Nenhuma lista cadastrada
                            </p>
                        ) : (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {listas.map((lista) => (
                                    <div
                                        key={lista.id}
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
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 500 }}>{lista.nome}</span>
                                            {lista.descricao && (
                                                <p style={{ 
                                                    fontSize: '0.85rem', 
                                                    opacity: 0.7, 
                                                    margin: '0.25rem 0 0 0',
                                                    maxHeight: '2rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {lista.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                                            <button
                                                className="action-btn"
                                                onClick={() => handleEdit(lista)}
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
                                                onClick={() => handleDelete(lista.id)}
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

export default ListaManager;

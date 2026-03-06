import { useState } from 'react'
import { UserPlus, Pencil, Trash2, UserX, UserCheck } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { Employee } from '../types'
import { employeesApi } from '../lib/api'

const MAX_EMPLOYEES = 20

export function Employees() {
  const { employees, addEmployee, updateEmployee, removeEmployee, addToast } = useAppStore()
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; emp?: Employee } | null>(null)
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const openAdd = () => { setName(''); setNameErr(''); setModal({ type: 'add' }) }
  const openEdit = (emp: Employee) => { setName(emp.nome); setNameErr(''); setModal({ type: 'edit', emp }) }
  const closeModal = () => { setModal(null); setName(''); setNameErr('') }

  const handleSave = async () => {
    if (!name.trim()) { setNameErr('Nome obrigatório'); return }
    if (name.trim().length < 2) { setNameErr('Nome muito curto'); return }

    if (modal?.type === 'add' && employees.length >= MAX_EMPLOYEES) {
      addToast(`Máximo de ${MAX_EMPLOYEES} funcionários atingido`, 'error')
      return
    }

    setLoading(true)
    try {
      if (modal?.type === 'add') {
        try {
          const res = await employeesApi.create({ nome: name.trim() })
          addEmployee(res.data)
        } catch {
          addEmployee({ id: Date.now(), nome: name.trim(), ativo: true, createdAt: new Date().toISOString() })
        }
        addToast('Funcionário adicionado!')
      } else if (modal?.emp) {
        try {
          const res = await employeesApi.update(modal.emp.id, { nome: name.trim() })
          updateEmployee(res.data)
        } catch {
          updateEmployee({ ...modal.emp, nome: name.trim() })
        }
        addToast('Funcionário atualizado!')
      }
      closeModal()
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (emp: Employee) => {
    try {
      await employeesApi.update(emp.id, { ativo: !emp.ativo })
    } catch {}
    updateEmployee({ ...emp, ativo: !emp.ativo })
    addToast(emp.ativo ? 'Funcionário desativado' : 'Funcionário ativado')
  }

  const handleDelete = async (id: number) => {
    try {
      await employeesApi.delete(id)
    } catch {}
    removeEmployee(id)
    setDeleteConfirm(null)
    addToast('Funcionário removido')
  }

  const activeCount = employees.filter((e) => e.ativo).length

  return (
    <>
      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm">
          <div className="card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-xl tracking-widest text-foreground mb-3">CONFIRMAR EXCLUSÃO</h3>
            <p className="text-sm text-muted font-sans mb-5">
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-sans">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl text-sm font-sans font-semibold bg-red-900 border border-red-700 text-red-200 hover:bg-red-800 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm">
          <div className="card rounded-2xl p-7 max-w-sm w-full">
            <h3 className="font-display text-xl tracking-widest text-foreground mb-6">
              {modal.type === 'add' ? 'NOVO FUNCIONÁRIO' : 'EDITAR FUNCIONÁRIO'}
            </h3>
            <label className="block text-[11px] text-subtle tracking-widest mb-2 font-sans">
              NOME COMPLETO
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Ex: João da Silva"
              autoFocus
              className="input-field w-full px-4 py-3.5 rounded-xl text-sm font-sans mb-1"
            />
            {nameErr && <p className="text-red-400 text-xs font-sans mb-2">{nameErr}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="btn-secondary flex-1 py-3.5 rounded-xl text-sm font-sans">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary flex-1 py-3.5 rounded-xl text-sm font-sans font-semibold"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-display text-3xl tracking-widest text-foreground">FUNCIONÁRIOS</h2>
          <p className="text-xs text-muted font-sans">
            {activeCount} ativos · {employees.length}/{MAX_EMPLOYEES} cadastrados
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={employees.length >= MAX_EMPLOYEES}
          className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-sans font-semibold"
        >
          <UserPlus size={18} />
          Adicionar
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`card rounded-xl p-5 transition-opacity ${!emp.ativo ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center font-display text-xl text-white shrink-0">
                {emp.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans font-semibold text-foreground truncate">{emp.nome}</div>
                <div className={`text-xs mt-0.5 font-sans ${emp.ativo ? 'text-green-400' : 'text-red-400'}`}>
                  {emp.ativo ? '● Ativo' : '○ Inativo'}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(emp)}
                className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-sans"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                onClick={() => handleToggleActive(emp)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-sans border transition-colors ${
                  emp.ativo
                    ? 'border-border-2 bg-surface-2 text-subtle hover:border-yellow-500/50 hover:text-yellow-400'
                    : 'border-green-800 bg-green-950/30 text-green-400 hover:bg-green-950/50'
                }`}
              >
                {emp.ativo ? <><UserX size={13} /> Desativar</> : <><UserCheck size={13} /> Ativar</>}
              </button>
              <button
                onClick={() => setDeleteConfirm(emp.id)}
                className="px-3 py-2 rounded-lg border border-border-2 bg-surface-2 text-red-400 hover:bg-red-950/30 hover:border-red-800 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="card rounded-xl p-16 text-center">
          <p className="text-muted font-sans text-sm">Nenhum funcionário cadastrado.</p>
          <button onClick={openAdd} className="btn-primary mt-4 px-6 py-3 rounded-xl text-sm font-sans">
            Adicionar primeiro funcionário
          </button>
        </div>
      )}
    </>
  )
}

import { useState, useMemo } from 'react'
import { Download, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatDate, formatTime, exportToCSV } from '../lib/utils'

const PAGE_SIZE = 15

export function History() {
  const { productions, employees } = useAppStore()
  const [filterEmp, setFilterEmp] = useState('all')
  const [filterVin, setFilterVin] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return [...productions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((p) => {
        if (filterEmp !== 'all' && p.funcionarioId !== Number(filterEmp)) return false
        if (filterVin && !p.vin.toLowerCase().includes(filterVin.toLowerCase())) return false
        return true
      })
  }, [productions, filterEmp, filterVin])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="font-display text-3xl tracking-widest text-foreground">HISTÓRICO</h2>
          <p className="text-xs text-muted font-sans">{filtered.length} registros encontrados</p>
        </div>
        <button
          onClick={() => exportToCSV(filtered, employees)}
          className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-medium"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Buscar por VIN..."
            value={filterVin}
            onChange={(e) => handleFilterChange(setFilterVin)(e.target.value)}
            className="input-field w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono"
          />
        </div>
        <select
          value={filterEmp}
          onChange={(e) => handleFilterChange(setFilterEmp)(e.target.value)}
          className="input-field px-4 py-2.5 rounded-xl text-sm font-sans flex-1 min-w-[180px]"
        >
          <option value="all">Todos os funcionários</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr className="bg-surface-2">
                {['VIN', 'Funcionário', 'Versão', 'Data', 'Hora'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-muted text-[10px] tracking-widest font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => {
                const emp = employees.find((e) => e.id === p.funcionarioId)
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 text-primary font-mono text-xs tracking-wider">{p.vin}</td>
                    <td className="px-4 py-3 text-foreground">{emp?.nome || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={p.versaoCarro === 'L3 Exclusive' ? 'badge-orange' : 'badge-blue'}>
                        {p.versaoCarro}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-subtle font-mono text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{formatTime(p.createdAt)}</td>
                  </tr>
                )
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg border text-sm font-sans transition-colors ${
                  p === page
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-2 bg-surface-2 text-muted hover:border-primary/50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

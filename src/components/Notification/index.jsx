export default function NotificacoesModal({ isOpen, onClose, notificacoes }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Notificações</h2>
        <button className="close-btn" onClick={onClose}>X</button>
        <ul>
          {notificacoes.length > 0 ? notificacoes.map((n,i) => (
            <li key={i}>{n}</li>
          )) : <li>Nenhuma notificação</li>}
        </ul>
      </div>
    </div>
  )
}

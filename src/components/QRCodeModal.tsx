import { QRCodeSVG } from 'qrcode.react'
import Modal from './Modal'
import type { Item } from '../types'

export default function QRCodeModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const url = `${window.location.origin}/itens/${item.id}`

  function imprimir() {
    window.print()
  }

  return (
    <Modal title={`QR Code - ${item.patrimonio}`} onClose={onClose} size="sm">
      <div id="print-qrcode" className="flex flex-col items-center gap-4">
        <QRCodeSVG value={url} size={200} />
        <div className="text-center">
          <p className="font-semibold">{item.nome}</p>
          <p className="text-sm text-gray-500">Patrimônio: {item.patrimonio}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button className="btn-primary" onClick={imprimir}>
          Imprimir
        </button>
      </div>
    </Modal>
  )
}

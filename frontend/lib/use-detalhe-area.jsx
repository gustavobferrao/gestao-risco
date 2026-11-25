'use client'

import { useCallback, useState } from 'react'
import { AreaDetailModal } from '@/components/area-detail-modal'

/**
 * Estado do modal de detalhe da área, para os apps do morador e do agente.
 * Uso: const { verArea, modalArea } = useDetalheArea()
 *      verArea({ id, nome })  -> abre;  {modalArea} -> renderiza o modal quando aberto
 */
export function useDetalheArea() {
  const [area, setArea] = useState(null)
  const verArea = useCallback((a) => setArea({ id: a.id, nome: a.nome }), [])
  const fechar = useCallback(() => setArea(null), []) // estável: o Modal depende dele

  const modalArea = area ? <AreaDetailModal key={area.id} areaId={area.id} nomeInicial={area.nome} onFechar={fechar} /> : null

  return { verArea, modalArea }
}

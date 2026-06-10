import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TreeNode {
  id: number
  name: string
  code?: string
  is_active?: boolean
  children?: TreeNode[]
}

interface TreeViewProps {
  data: TreeNode[]
  onSelect?: (node: TreeNode) => void
  selectedId?: number
  actions?: (node: TreeNode) => React.ReactNode
}

function TreeNodeItem({
  node,
  level,
  onSelect,
  selectedId,
  actions,
}: {
  node: TreeNode
  level: number
  onSelect?: (node: TreeNode) => void
  selectedId?: number
  actions?: (node: TreeNode) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50',
          selectedId === node.id && 'bg-primary-50 text-primary-700'
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect?.(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="flex-1 text-sm font-medium">
          {node.name}
          {node.code && <span className="ml-2 text-xs text-gray-400">({node.code})</span>}
        </span>
        {node.is_active === false && (
          <span className="text-xs text-red-500">Nonaktif</span>
        )}
        {actions && <div onClick={(e) => e.stopPropagation()}>{actions(node)}</div>}
      </div>
      {expanded &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNodeItem
            key={child.id}
            node={child}
            level={level + 1}
            onSelect={onSelect}
            selectedId={selectedId}
            actions={actions}
          />
        ))}
    </div>
  )
}

export function TreeView({ data, onSelect, selectedId, actions }: TreeViewProps) {
  if (!data.length) {
    return <p className="text-sm text-gray-500 p-4">Tidak ada data</p>
  }

  return (
    <div className="border rounded-lg divide-y">
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
          actions={actions}
        />
      ))}
    </div>
  )
}

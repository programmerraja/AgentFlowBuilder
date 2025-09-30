import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export interface CustomNodeData {
  label: string
  name: string
}

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[200px]">
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.label}</div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-teal-500"
      />
    </div>
  )
}

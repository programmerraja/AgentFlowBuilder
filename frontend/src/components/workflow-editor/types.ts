export type Param = {
  id: string
  type: string
  required?: boolean
}

export type Tool = {
  name: string
  description?: string
  parameters?: Param[]
}

export type NodeAffects = {
  name: string
  description?: string
}

export type StateKey = {
  id: string
  required?: boolean
  description?: string
  nodeAffects?: NodeAffects
}

export type Edge = {
  to: string // target node name
  condition?: string
  stateKeys?: StateKey[]
}

export type WFNode = {
  name: string
  label?: string
  isFirstNode?: boolean
  preAction?: string[]
  postAction?: string[]
  tools?: Tool[]
  prompt?: string
  stateKeys?: StateKey[]
  edges?: Edge[]
  // UI-only
  position?: { x: number; y: number }
}

export type Workflow = {
  name: string
  description?: string
  requiredWorkflow?: { must?: string[]; desc?: string }
  nodes: Record<string, WFNode>
  nodeOrder?: string[] // Explicit order of node names
  states?: Record<string, any>
  summary?: Record<string, any>
}

export type RootConfig = {
  workflows: Record<string, Workflow>
  states?: Record<string, any>
}

export type EditorState = {
  data: RootConfig
  selectedWorkflow?: string
  selectedNode?: string
  activeTab: "workflows" | "nodes"
}

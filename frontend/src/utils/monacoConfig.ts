import * as monaco from 'monaco-editor';

export const configureMonaco = () => {
  // Configure Monaco Editor for JSON editing
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [
      {
        uri: 'http://myserver/workflow-schema.json',
        fileMatch: ['*.json'],
        schema: {
          type: 'object',
          properties: {
            workflows: {
              type: 'object',
              description: 'Workflow definitions',
            },
            states: {
              type: 'object',
              description: 'Global state configuration',
            },
          },
          required: ['workflows'],
        },
      },
    ],
  });

  // Set up JSON language features
  monaco.languages.json.jsonDefaults.setModeConfiguration({
    documentFormattingEdits: true,
    documentRangeFormattingEdits: true,
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
  });

  // Configure editor theme
  monaco.editor.defineTheme('workflow-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
    },
  });
};

export const getMonacoEditorOptions =
  (): monaco.editor.IStandaloneEditorConstructionOptions => ({
    theme: 'workflow-theme',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    folding: true,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
  });

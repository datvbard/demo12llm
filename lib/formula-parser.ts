interface ParsedToken {
  type: 'number' | 'operator' | 'variable' | 'paren'
  value: string
}

export function parseFormula(formula: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const regex = /(\d+\.?\d*|[\+\-\*\/\(\)]|[a-z_][a-z0-9_]*)/gi
  let match

  while ((match = regex.exec(formula)) !== null) {
    const value = match[1]
    let type: ParsedToken['type']

    if (/^\d+\.?\d*$/.test(value)) type = 'number'
    else if (/^[\+\-\*\/]$/.test(value)) type = 'operator'
    else if (/^[\(\)]$/.test(value)) type = 'paren'
    else type = 'variable'

    tokens.push({ type, value })
  }

  return tokens
}

export function validateFormulaVariables(
  formula: string,
  availableKeys: Set<string>
): { valid: boolean; error?: string } {
  const tokens = parseFormula(formula)
  const variables = tokens.filter(t => t.type === 'variable')

  for (const v of variables) {
    if (!availableKeys.has(v.value)) {
      return { valid: false, error: `Unknown field: ${v.value}` }
    }
  }

  return { valid: true }
}

export function evaluateFormula(
  formula: string,
  values: Record<string, number>
): number {
  const tokens = parseFormula(formula)

  const resolved = tokens.map(t => {
    if (t.type === 'variable') {
      return { type: 'number' as const, value: String(values[t.value] ?? 0) }
    }
    return t
  })

  const output: ParsedToken[] = []
  const ops: ParsedToken[] = []

  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

  for (const token of resolved) {
    if (token.type === 'number') {
      output.push(token)
    } else if (token.type === 'operator') {
      while (
        ops.length &&
        ops[ops.length - 1].type === 'operator' &&
        precedence[ops[ops.length - 1].value] >= precedence[token.value]
      ) {
        output.push(ops.pop()!)
      }
      ops.push(token)
    } else if (token.value === '(') {
      ops.push(token)
    } else if (token.value === ')') {
      while (ops.length && ops[ops.length - 1].value !== '(') {
        output.push(ops.pop()!)
      }
      if (ops.length) ops.pop()
    }
  }

  while (ops.length) output.push(ops.pop()!)

  const stack: number[] = []
  for (const token of output) {
    if (token.type === 'number') {
      stack.push(parseFloat(token.value))
    } else {
      const b = stack.pop()!
      const a = stack.pop()!
      switch (token.value) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(b !== 0 ? a / b : 0); break
      }
    }
  }

  return stack[0] ?? 0
}

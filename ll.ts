#!/usr/bin/env node

enum AtomType {Identifier, Literal}
type AtomValue = number | string

interface IAtom {
  type: AtomType
  value: AtomValue
}

interface IList {
  [index: number]: IAtom | IList
  concat(list: IAtom | IList): IList
  pop(): IList
  push(list: IAtom | IList): void
}

function tokenise(s: string): string[] {
  return s
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .split(" ")
    .filter((token: string): boolean => !!token)
}

function categorise(token: string): IAtom {
  if (typeof token === "number") {
    return {type: AtomType.Literal, value: Number(token)}
  } else if (token[0] === "\"" && token.slice(-1) === "\"") {
    return {type: AtomType.Literal, value: token.slice(1, -1)}
  } else {
    return {type: AtomType.Identifier, value: token}
  }
}

function parenthesise(tokens: string[], list: IList = []): IList {
  const token: string = tokens.shift()
  if (token === undefined) {
    return list.pop()
  }
  switch (token) {
    case "(":
      list.push(parenthesise(tokens))
      return parenthesise(tokens, list)
    case ")":
      return list
    default:
      return parenthesise(tokens, list.concat(categorise(token)))
  }
}

interface IScope {
  [index: string]: AtomValue
}

interface IContext {
  scope: IScope,
  parent: IContext,
  get(identifier: string): AtomValue
}

class Context implements IContext {
  public scope: IScope
  public parent: IContext

  constructor(scope: IScope, parent: IContext) {
    this.scope = scope
    this.parent = parent
  }

  public get(identifier: string): AtomValue {
    if (identifier in this.scope) {
      return this.scope[identifier]
    } else if (this.parent !== undefined) {
      return this.parent.get(identifier)
    }
  }
}

// Tests...

const ss: string[] = [
  `()`,
  `(+ 1 2)`,
  // `(+ 1 2 (+ 3 4))`,
  // `(+ 1 2 (+ 3 4) 5)`,
  // `(+ 1 (+ 2 (+ 3 (+ 4) 5) 6) 7)`,
  `((lambda (x) x) "hello")`
]
let tokens: string[]
for (const s of ss) {
  console.info("=====")
  console.info(s)
  tokens = tokenise(s);
  console.info(tokens)
  console.info(JSON.stringify(parenthesise(tokens)))
}

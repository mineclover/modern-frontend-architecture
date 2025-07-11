#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 의존성 방향 규칙 정의 (routes로 변경됨)
const DEPENDENCY_RULES = {
  'common': [],
  'global': ['common'],
  'services': ['common', 'global'],
  'shared': ['common', 'global', 'services'],
  'domain': ['common', 'global', 'services', 'shared'],
  'feature': ['common', 'global', 'services', 'shared', 'domain'],
  'routes': ['common', 'global', 'services', 'shared', 'domain', 'feature']
}

// 금지된 의존성 검사
function checkDependencyViolations() {
  const violations = []
  const srcPath = path.join(process.cwd(), 'src')
  
  if (!fs.existsSync(srcPath)) {
    console.log('⚠️ src 폴더가 존재하지 않습니다.')
    return []
  }

  // 모든 TypeScript/JavaScript 파일 찾기 (glob 없이 재귀적으로 찾기)
  const files = findFiles(srcPath, /\.(ts|tsx|js|jsx)$/)

  files.forEach(file => {
    const filePath = path.join(srcPath, file)
    const content = fs.readFileSync(filePath, 'utf8')
    
    // 현재 파일이 속한 레이어 확인
    const currentLayer = getCurrentLayer(file)
    if (!currentLayer) return
    
    // import 문 추출
    const imports = extractImports(content)
    
    imports.forEach(importPath => {
      const targetLayer = getLayerFromImport(importPath)
      if (!targetLayer) return
      
      // 의존성 규칙 검사
      const allowedDeps = DEPENDENCY_RULES[currentLayer] || []
      
      if (!allowedDeps.includes(targetLayer)) {
        violations.push({
          file,
          currentLayer,
          targetLayer,
          importPath,
          line: getLineNumber(content, importPath)
        })
      }
    })
  })
  
  return violations
}

// 순환 의존성 검사
function checkCircularDependencies() {
  const graph = buildDependencyGraph()
  const cycles = findCycles(graph)
  
  return cycles.map(cycle => ({
    type: 'circular',
    cycle: cycle.join(' → '),
    files: cycle
  }))
}

// 도메인 간 직접 의존성 검사  
function checkDomainCrossReferences() {
  const violations = []
  const srcPath = path.join(process.cwd(), 'src')
  
  if (!fs.existsSync(srcPath)) return []
  
  const domainFiles = findFiles(path.join(srcPath, 'domain'), /\.(ts|tsx)$/)
  
  domainFiles.forEach(file => {
    const filePath = path.join(srcPath, file)
    if (!fs.existsSync(filePath)) return
    
    const content = fs.readFileSync(filePath, 'utf8')
    
    const currentDomain = getCurrentDomain(file)
    const imports = extractImports(content)
    
    imports.forEach(importPath => {
      const targetDomain = getDomainFromImport(importPath)
      
      if (targetDomain && targetDomain !== currentDomain) {
        // 도메인 간 직접 참조 발견
        violations.push({
          file,
          currentDomain,
          targetDomain,
          importPath,
          line: getLineNumber(content, importPath)
        })
      }
    })
  })
  
  return violations
}

// Public API 위반 검사
function checkPublicApiViolations() {
  const violations = []
  const srcPath = path.join(process.cwd(), 'src')
  
  if (!fs.existsSync(srcPath)) return []
  
  const files = findFiles(srcPath, /\.(ts|tsx)$/)
  
  files.forEach(file => {
    const filePath = path.join(srcPath, file)
    if (!fs.existsSync(filePath)) return
    
    const content = fs.readFileSync(filePath, 'utf8')
    
    const imports = extractImports(content)
    
    imports.forEach(importPath => {
      // 내부 구현에 직접 접근하는지 검사
      if (isInternalImport(importPath)) {
        violations.push({
          file,
          importPath,
          violation: 'direct-internal-access',
          suggestion: getSuggestion(importPath)
        })
      }
    })
  })
  
  return violations
}

// 유틸리티 함수들
function getCurrentLayer(file) {
  const parts = file.split('/')
  return parts[0]
}

function getCurrentDomain(file) {
  const parts = file.split('/')
  if (parts[0] === 'domain' && parts[1]) {
    return parts[1]
  }
  return null
}

function getLayerFromImport(importPath) {
  const match = importPath.match(/@\/([^\/]+)/)
  return match ? match[1] : null
}

function getDomainFromImport(importPath) {
  const match = importPath.match(/@\/domain\/([^\/]+)/)
  return match ? match[1] : null
}

function extractImports(content) {
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g
  const imports = []
  let match
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  
  return imports
}

function isInternalImport(importPath) {
  // Public API가 아닌 내부 구현에 접근하는지 검사
  const internalPatterns = [
    /@\/domain\/[^\/]+\/(?!index$)/, // domain 내부 파일 직접 접근
    /@\/shared\/[^\/]+\/(?!index$)/, // shared 내부 파일 직접 접근
    /@\/services\/[^\/]+\/(?!index$)/ // services 내부 파일 직접 접근
  ]
  
  return internalPatterns.some(pattern => pattern.test(importPath))
}

function getSuggestion(importPath) {
  const match = importPath.match(/@\/([^\/]+)\/([^\/]+)\//)
  if (match) {
    return `Use '@/${match[1]}/${match[2]}' instead`
  }
  return 'Use public API instead'
}

function getLineNumber(content, searchString) {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1
    }
  }
  return 1
}

function buildDependencyGraph() {
  // 의존성 그래프 구축 로직
  const graph = new Map()
  const srcPath = path.join(process.cwd(), 'src')
  
  if (!fs.existsSync(srcPath)) return graph
  
  const files = findFiles(srcPath, /\.(ts|tsx)$/)
  
  files.forEach(file => {
    const filePath = path.join(srcPath, file)
    if (!fs.existsSync(filePath)) return
    
    const content = fs.readFileSync(filePath, 'utf8')
    const imports = extractImports(content)
    
    graph.set(file, imports.filter(imp => imp.startsWith('@/')))
  })
  
  return graph
}

function findCycles(graph) {
  const visited = new Set()
  const recursionStack = new Set()
  const cycles = []
  
  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node)
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart).concat(node))
      }
      return
    }
    
    if (visited.has(node)) return
    
    visited.add(node)
    recursionStack.add(node)
    path.push(node)
    
    const dependencies = graph.get(node) || []
    dependencies.forEach(dep => {
      dfs(dep, [...path])
    })
    
    recursionStack.delete(node)
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node)
    }
  }
  
  return cycles
}

// 리포트 생성
function generateReport() {
  console.log('🔍 아키텍처 검증 시작...\n')
  
  const dependencyViolations = checkDependencyViolations()
  const circularDependencies = checkCircularDependencies()
  const domainViolations = checkDomainCrossReferences()
  const publicApiViolations = checkPublicApiViolations()
  
  let hasErrors = false
  
  // 의존성 방향 위반
  if (dependencyViolations.length > 0) {
    hasErrors = true
    console.log('❌ 의존성 방향 위반:')
    dependencyViolations.forEach(violation => {
      console.log(`  ${violation.file}:${violation.line}`)
      console.log(`    ${violation.currentLayer} → ${violation.targetLayer}`)
      console.log(`    Import: ${violation.importPath}\n`)
    })
  }
  
  // 순환 의존성
  if (circularDependencies.length > 0) {
    hasErrors = true
    console.log('❌ 순환 의존성 발견:')
    circularDependencies.forEach(cycle => {
      console.log(`  ${cycle.cycle}\n`)
    })
  }
  
  // 도메인 간 직접 의존성
  if (domainViolations.length > 0) {
    hasErrors = true
    console.log('❌ 도메인 간 직접 의존성:')
    domainViolations.forEach(violation => {
      console.log(`  ${violation.file}:${violation.line}`)
      console.log(`    ${violation.currentDomain} → ${violation.targetDomain}`)
      console.log(`    Import: ${violation.importPath}\n`)
    })
  }
  
  // Public API 위반
  if (publicApiViolations.length > 0) {
    hasErrors = true
    console.log('❌ Public API 위반:')
    publicApiViolations.forEach(violation => {
      console.log(`  ${violation.file}`)
      console.log(`    Import: ${violation.importPath}`)
      console.log(`    Suggestion: ${violation.suggestion}\n`)
    })
  }
  
  if (!hasErrors) {
    console.log('✅ 모든 아키텍처 규칙을 준수하고 있습니다!')
  } else {
    console.log(`\n❌ 총 ${dependencyViolations.length + circularDependencies.length + domainViolations.length + publicApiViolations.length}개의 위반사항이 발견되었습니다.`)
    process.exit(1)
  }
}

// 유틸리티 함수: 파일 재귀 검색
function findFiles(dir, pattern) {
  const results = []
  
  function searchDir(currentDir, basePath = '') {
    if (!fs.existsSync(currentDir)) return
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      const relativePath = path.join(basePath, entry.name)
      
      if (entry.isDirectory()) {
        // 테스트 파일 및 숨김 폴더 제외
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          searchDir(fullPath, relativePath)
        }
      } else if (entry.isFile()) {
        // 패턴에 맞는 파일만 포함하고 테스트 파일 제외
        if (pattern.test(entry.name) && 
            !entry.name.includes('.test.') && 
            !entry.name.includes('.spec.') &&
            !entry.name.endsWith('.d.ts') &&
            entry.name !== '.gitkeep') {
          results.push(relativePath.replace(/\\/g, '/'))
        }
      }
    }
  }
  
  searchDir(dir)
  return results
}

// 실행
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.argv[1] === __filename) {
  generateReport()
}

export {
  checkDependencyViolations,
  checkCircularDependencies,
  checkDomainCrossReferences,
  checkPublicApiViolations
}
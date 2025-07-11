#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

function validateDomainStructure() {
  const domainsPath = path.join(process.cwd(), 'src', 'domain')
  
  if (!fs.existsSync(domainsPath)) {
    console.log('⚠️ domain 폴더가 존재하지 않습니다.')
    return
  }

  const domains = fs.readdirSync(domainsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  let allValid = true

  console.log('🔍 도메인 구조 검증 중...\n')

  domains.forEach(domain => {
    console.log(`📦 ${domain} 도메인 검증:`)
    
    const domainPath = path.join(domainsPath, domain)
    const isValid = validateSingleDomain(domainPath, domain)
    
    if (isValid) {
      console.log(`  ✅ ${domain} 도메인 구조가 올바릅니다.\n`)
    } else {
      console.log(`  ❌ ${domain} 도메인 구조에 문제가 있습니다.\n`)
      allValid = false
    }
  })

  if (allValid) {
    console.log('🎉 모든 도메인 구조가 올바릅니다!')
  } else {
    console.log('⚠️ 일부 도메인 구조를 수정해주세요.')
    process.exit(1)
  }
}

function validateSingleDomain(domainPath, domainName) {
  const requiredFolders = ['api', 'components', 'hooks', 'store', 'types', 'utils', 'constants']
  const requiredFiles = ['index.ts', 'README.md']
  
  let isValid = true

  // 필수 폴더 검증
  requiredFolders.forEach(folder => {
    const folderPath = path.join(domainPath, folder)
    if (!fs.existsSync(folderPath)) {
      console.log(`    ❌ 필수 폴더 누락: ${folder}`)
      isValid = false
    } else {
      // 각 폴더에 index.ts 파일 확인
      const indexPath = path.join(folderPath, 'index.ts')
      if (!fs.existsSync(indexPath)) {
        console.log(`    ⚠️ ${folder}/index.ts 파일 누락`)
      }
    }
  })

  // 필수 파일 검증
  requiredFiles.forEach(file => {
    const filePath = path.join(domainPath, file)
    if (!fs.existsSync(filePath)) {
      console.log(`    ❌ 필수 파일 누락: ${file}`)
      isValid = false
    }
  })

  // Public API 검증
  const indexPath = path.join(domainPath, 'index.ts')
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8')
    
    // export 문 검증
    const hasComponentExport = content.includes("export * from './components'")
    const hasHookExport = content.includes("export * from './hooks'")
    const hasApiExport = content.includes("export * from './api'")
    const hasTypeExport = content.includes("export type * from './types'")
    
    if (!hasComponentExport) {
      console.log(`    ⚠️ components export 누락`)
    }
    if (!hasHookExport) {
      console.log(`    ⚠️ hooks export 누락`)
    }
    if (!hasApiExport) {
      console.log(`    ⚠️ api export 누락`)
    }
    if (!hasTypeExport) {
      console.log(`    ⚠️ types export 누락`)
    }

    // 금지된 export 검증
    const forbiddenExports = ['store', 'utils', 'constants']
    forbiddenExports.forEach(forbidden => {
      if (content.includes(`export * from './${forbidden}'`)) {
        console.log(`    ❌ 금지된 export 발견: ${forbidden} (내부 구현은 노출하지 않음)`)
        isValid = false
      }
    })
  }

  return isValid
}

function validatePublicApiConsistency() {
  console.log('\n🔍 Public API 일관성 검증 중...\n')
  
  const domainsPath = path.join(process.cwd(), 'src', 'domain')
  if (!fs.existsSync(domainsPath)) return

  const domains = fs.readdirSync(domainsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  domains.forEach(domain => {
    const domainPath = path.join(domainsPath, domain)
    const mainIndexPath = path.join(domainPath, 'index.ts')
    
    if (!fs.existsSync(mainIndexPath)) return

    console.log(`📋 ${domain} 도메인 Public API:`)
    
    const content = fs.readFileSync(mainIndexPath, 'utf8')
    const exports = extractExports(content)
    
    exports.forEach(exp => {
      console.log(`    ✅ ${exp}`)
    })
    
    console.log('')
  })
}

function extractExports(content) {
  const exports = []
  const lines = content.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('export ') && !trimmed.startsWith('//')) {
      exports.push(trimmed)
    }
  })
  
  return exports
}

// 실행
const __filename = fileURLToPath(import.meta.url)

if (process.argv[1] === __filename) {
  validateDomainStructure()
  validatePublicApiConsistency()
}

export {
  validateDomainStructure,
  validateSingleDomain,
  validatePublicApiConsistency
}
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { checkDependencyViolations, checkCircularDependencies, checkDomainCrossReferences, checkPublicApiViolations } = require('./check-dependencies')
const { validateDomainStructure } = require('./validate-domains')

function generateArchitectureReport() {
  console.log('📊 아키텍처 리포트 생성 중...\n')

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      dependencyViolations: 0,
      circularDependencies: 0,
      domainViolations: 0,
      publicApiViolations: 0,
      totalIssues: 0
    },
    details: {
      dependencyViolations: [],
      circularDependencies: [],
      domainViolations: [],
      publicApiViolations: []
    },
    recommendations: []
  }

  try {
    // 의존성 검증
    report.details.dependencyViolations = checkDependencyViolations()
    report.summary.dependencyViolations = report.details.dependencyViolations.length

    // 순환 의존성 검증
    report.details.circularDependencies = checkCircularDependencies()
    report.summary.circularDependencies = report.details.circularDependencies.length

    // 도메인 교차 참조 검증
    report.details.domainViolations = checkDomainCrossReferences()
    report.summary.domainViolations = report.details.domainViolations.length

    // Public API 검증
    report.details.publicApiViolations = checkPublicApiViolations()
    report.summary.publicApiViolations = report.details.publicApiViolations.length

    // 총 이슈 수
    report.summary.totalIssues = 
      report.summary.dependencyViolations +
      report.summary.circularDependencies +
      report.summary.domainViolations +
      report.summary.publicApiViolations

    // 권장사항 생성
    generateRecommendations(report)

    // 마크다운 리포트 생성
    const markdownReport = generateMarkdownReport(report)
    fs.writeFileSync('architecture-report.md', markdownReport)

    // JSON 리포트 생성
    fs.writeFileSync('architecture-report.json', JSON.stringify(report, null, 2))

    console.log('📄 리포트 생성 완료:')
    console.log('  - architecture-report.md')
    console.log('  - architecture-report.json')

    // 콘솔 요약 출력
    printSummary(report)

  } catch (error) {
    console.error('❌ 리포트 생성 중 오류 발생:', error.message)
    process.exit(1)
  }
}

function generateRecommendations(report) {
  const recommendations = []

  if (report.summary.dependencyViolations > 0) {
    recommendations.push({
      priority: 'high',
      category: 'dependency',
      title: '의존성 방향 위반 수정',
      description: `${report.summary.dependencyViolations}개의 의존성 방향 위반을 수정해주세요. ESLint 규칙을 확인하고 import 경로를 수정하세요.`
    })
  }

  if (report.summary.circularDependencies > 0) {
    recommendations.push({
      priority: 'high',
      category: 'circular',
      title: '순환 의존성 제거',
      description: `${report.summary.circularDependencies}개의 순환 의존성을 제거해주세요. 공통 모듈로 분리하거나 의존성 구조를 재설계하세요.`
    })
  }

  if (report.summary.domainViolations > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'domain',
      title: '도메인 간 직접 의존성 제거',
      description: `${report.summary.domainViolations}개의 도메인 간 직접 의존성을 제거해주세요. shared 폴더로 공통 로직을 분리하세요.`
    })
  }

  if (report.summary.publicApiViolations > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'api',
      title: 'Public API 패턴 적용',
      description: `${report.summary.publicApiViolations}개의 Public API 위반을 수정해주세요. index.ts를 통해서만 모듈에 접근하세요.`
    })
  }

  if (report.summary.totalIssues === 0) {
    recommendations.push({
      priority: 'low',
      category: 'optimization',
      title: '성능 최적화',
      description: '아키텍처가 우수합니다! 번들 크기 최적화와 코드 스플리팅을 검토해보세요.'
    })
  }

  report.recommendations = recommendations
}

function generateMarkdownReport(report) {
  const date = new Date(report.timestamp).toLocaleString('ko-KR')
  
  let markdown = `# 🏗️ 아키텍처 분석 리포트

**생성일**: ${date}

## 📊 요약

| 항목 | 개수 | 상태 |
|------|------|------|
| 의존성 방향 위반 | ${report.summary.dependencyViolations} | ${report.summary.dependencyViolations === 0 ? '✅' : '❌'} |
| 순환 의존성 | ${report.summary.circularDependencies} | ${report.summary.circularDependencies === 0 ? '✅' : '❌'} |
| 도메인 간 직접 의존성 | ${report.summary.domainViolations} | ${report.summary.domainViolations === 0 ? '✅' : '❌'} |
| Public API 위반 | ${report.summary.publicApiViolations} | ${report.summary.publicApiViolations === 0 ? '✅' : '❌'} |
| **총 이슈** | **${report.summary.totalIssues}** | ${report.summary.totalIssues === 0 ? '🎉' : '⚠️'} |

`

  if (report.summary.totalIssues === 0) {
    markdown += `## 🎉 축하합니다!

모든 아키텍처 규칙을 준수하고 있습니다. 훌륭한 코드 품질을 유지하고 계십니다!

`
  }

  // 상세 이슈 목록
  if (report.details.dependencyViolations.length > 0) {
    markdown += `## ❌ 의존성 방향 위반 (${report.details.dependencyViolations.length}개)

`
    report.details.dependencyViolations.forEach(violation => {
      markdown += `### ${violation.file}:${violation.line}
- **문제**: \`${violation.currentLayer}\` → \`${violation.targetLayer}\`
- **Import**: \`${violation.importPath}\`

`
    })
  }

  if (report.details.circularDependencies.length > 0) {
    markdown += `## 🔄 순환 의존성 (${report.details.circularDependencies.length}개)

`
    report.details.circularDependencies.forEach(cycle => {
      markdown += `- ${cycle.cycle}
`
    })
    markdown += '\n'
  }

  if (report.details.domainViolations.length > 0) {
    markdown += `## 🏢 도메인 간 직접 의존성 (${report.details.domainViolations.length}개)

`
    report.details.domainViolations.forEach(violation => {
      markdown += `### ${violation.file}:${violation.line}
- **문제**: \`${violation.currentDomain}\` → \`${violation.targetDomain}\`
- **Import**: \`${violation.importPath}\`

`
    })
  }

  if (report.details.publicApiViolations.length > 0) {
    markdown += `## 🔒 Public API 위반 (${report.details.publicApiViolations.length}개)

`
    report.details.publicApiViolations.forEach(violation => {
      markdown += `### ${violation.file}
- **Import**: \`${violation.importPath}\`
- **권장**: ${violation.suggestion}

`
    })
  }

  // 권장사항
  markdown += `## 💡 권장사항

`
  report.recommendations.forEach(rec => {
    const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
    markdown += `### ${priorityEmoji} ${rec.title}
${rec.description}

`
  })

  return markdown
}

function printSummary(report) {
  console.log('\n📋 아키텍처 분석 요약:')
  console.log(`  의존성 방향 위반: ${report.summary.dependencyViolations}개`)
  console.log(`  순환 의존성: ${report.summary.circularDependencies}개`)
  console.log(`  도메인 간 직접 의존성: ${report.summary.domainViolations}개`)
  console.log(`  Public API 위반: ${report.summary.publicApiViolations}개`)
  console.log(`  총 이슈: ${report.summary.totalIssues}개`)

  if (report.summary.totalIssues === 0) {
    console.log('\n🎉 모든 아키텍처 규칙을 준수하고 있습니다!')
  } else {
    console.log(`\n⚠️ ${report.summary.totalIssues}개의 이슈를 해결해주세요.`)
  }
}

// 실행
if (require.main === module) {
  generateArchitectureReport()
}

module.exports = {
  generateArchitectureReport
}
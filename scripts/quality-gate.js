#!/usr/bin/env node

// 품질 게이트 체커 - CI/CD에서 사용하기 위한 간단한 스크립트
const QualityMetricsCollector = require('./quality-metrics-collector')

async function runQualityGate() {
  console.log('🚦 Running Quality Gate Check...\n')
  
  try {
    const collector = new QualityMetricsCollector()
    await collector.collectAllMetrics()
    
    // quality-gate-decision.json 파일에서 결과 읽기
    const fs = require('fs')
    const decision = JSON.parse(fs.readFileSync('quality-gate-decision.json', 'utf8'))
    
    console.log('\n' + '='.repeat(60))
    console.log(`🎯 QUALITY GATE RESULT: ${decision.status}`)
    console.log(`📊 Overall Score: ${decision.score}/100`)
    console.log('='.repeat(60))
    
    if (decision.blockers && decision.blockers.length > 0) {
      console.log('\n🚨 BLOCKERS:')
      decision.blockers.forEach(blocker => {
        console.log(`   ❌ ${blocker}`)
      })
    }
    
    if (decision.recommendations && decision.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      decision.recommendations.forEach(rec => {
        console.log(`   🔸 ${rec}`)
      })
    }
    
    console.log('\n📄 Detailed reports:')
    console.log('   - quality-metrics.json')
    console.log('   - quality-report.md')
    console.log('   - quality-gate-decision.json')
    
    // CI 환경에서 실패 시 exit code 1
    if (decision.status === 'FAILED') {
      console.log('\n💥 Quality gate FAILED - build should not proceed')
      process.exit(1)
    } else if (decision.status === 'CONDITIONAL') {
      console.log('\n⚠️ Quality gate CONDITIONAL - review required')
      process.exit(0) // 조건부 통과는 성공으로 처리
    } else {
      console.log('\n✅ Quality gate PASSED - build can proceed')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('💥 Quality gate check failed:', error.message)
    process.exit(1)
  }
}

// 직접 실행될 때만 실행
if (require.main === module) {
  runQualityGate()
}

module.exports = runQualityGate
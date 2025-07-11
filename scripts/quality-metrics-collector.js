#!/usr/bin/env node

// 메인 품질 메트릭 수집기 - 모듈화된 버전
const ArchitectureCollector = require('./quality-metrics/architecture')
const CodeQualityCollector = require('./quality-metrics/code-quality')
const PerformanceCollector = require('./quality-metrics/performance')
const SecurityCollector = require('./quality-metrics/security')
const MaintainabilityCollector = require('./quality-metrics/maintainability')
const ReportGenerator = require('./quality-metrics/report-generator')

class QualityMetricsCollector {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      architecture: {},
      code: {},
      performance: {},
      security: {},
      maintainability: {}
    }
    
    this.collectors = {
      architecture: new ArchitectureCollector(),
      code: new CodeQualityCollector(), 
      performance: new PerformanceCollector(),
      security: new SecurityCollector(),
      maintainability: new MaintainabilityCollector()
    }
  }

  async collectAllMetrics() {
    console.log('📊 Starting comprehensive quality metrics collection...\n')
    
    try {
      // 병렬로 메트릭 수집 (성능 collector는 빌드가 필요하므로 순차 실행)
      const architecturePromise = this.collectSafely('architecture')
      const codePromise = this.collectSafely('code')
      const securityPromise = this.collectSafely('security')
      const maintainabilityPromise = this.collectSafely('maintainability')
      
      // 병렬 실행
      const [architecture, code, security, maintainability] = await Promise.all([
        architecturePromise,
        codePromise, 
        securityPromise,
        maintainabilityPromise
      ])
      
      // 성능 메트릭은 빌드가 필요하므로 별도 실행
      const performance = await this.collectSafely('performance')
      
      // 결과 저장
      this.metrics.architecture = architecture
      this.metrics.code = code
      this.metrics.performance = performance
      this.metrics.security = security
      this.metrics.maintainability = maintainability
      
      // 요약 출력
      this.printSummary()
      
      // 리포트 생성
      await this.generateReports()
      
      console.log('\n✅ Quality metrics collection completed successfully!')
      
    } catch (error) {
      console.error('❌ Quality metrics collection failed:', error.message)
      process.exit(1)
    }
  }

  async collectSafely(collectorName) {
    try {
      console.log(`🔄 Collecting ${collectorName} metrics...`)
      const result = await this.collectors[collectorName].collect()
      console.log(`✅ ${collectorName} metrics collected`)
      return result
    } catch (error) {
      console.error(`❌ ${collectorName} metrics collection failed:`, error.message)
      return { error: error.message }
    }
  }

  async generateReports() {
    console.log('\n📄 Generating reports...')
    
    try {
      const reportGenerator = new ReportGenerator(this.metrics)
      const decision = reportGenerator.generateAll()
      
      // 품질 게이트 결과에 따른 종료 코드 설정
      if (decision.status === 'FAILED' && process.env.CI) {
        console.log('💥 Quality gate failed in CI environment')
        process.exit(1)
      }
      
      return decision
    } catch (error) {
      console.error('❌ Report generation failed:', error.message)
      throw error
    }
  }

  // 개별 메트릭 수집 메서드들 (디버깅용)
  async collectArchitectureOnly() {
    console.log('🏗️ Collecting architecture metrics only...')
    this.metrics.architecture = await this.collectSafely('architecture')
    return this.metrics.architecture
  }

  async collectCodeQualityOnly() {
    console.log('💻 Collecting code quality metrics only...')
    this.metrics.code = await this.collectSafely('code')
    return this.metrics.code
  }

  async collectPerformanceOnly() {
    console.log('⚡ Collecting performance metrics only...')
    this.metrics.performance = await this.collectSafely('performance')
    return this.metrics.performance
  }

  async collectSecurityOnly() {
    console.log('🔒 Collecting security metrics only...')
    this.metrics.security = await this.collectSafely('security')
    return this.metrics.security
  }

  async collectMaintainabilityOnly() {
    console.log('🔧 Collecting maintainability metrics only...')
    this.metrics.maintainability = await this.collectSafely('maintainability')
    return this.metrics.maintainability
  }

  // 간단한 요약 출력
  printSummary() {
    const { architecture, code, performance, security, maintainability } = this.metrics
    
    console.log('\n📋 Quality Metrics Summary:')
    console.log('─'.repeat(50))
    
    if (architecture && !architecture.error) {
      console.log(`🏗️  Architecture:`)
      console.log(`   └ Dependency violations: ${architecture.dependencyViolations || 0}`)
      console.log(`   └ Domain structure: ${architecture.domainStructureScore || 0}%`)
      console.log(`   └ Circular dependencies: ${architecture.circularDependencies || 0}`)
    }
    
    if (code && !code.error) {
      console.log(`💻 Code Quality:`)
      console.log(`   └ Test coverage: ${code.coverage?.lines || 0}%`)
      console.log(`   └ Complexity: ${code.complexity?.average || 0}`)
      console.log(`   └ Linting errors: ${code.linting?.errors || 0}`)
    }
    
    if (performance && !performance.error) {
      console.log(`⚡ Performance:`)
      console.log(`   └ Bundle size: ${this.formatBytes(performance.bundleSize?.total || 0)}`)
      console.log(`   └ Build time: ${performance.buildTime || 0}ms`)
    }
    
    if (security && !security.error) {
      console.log(`🔒 Security:`)
      console.log(`   └ Critical vulnerabilities: ${security.vulnerabilities?.critical || 0}`)
      console.log(`   └ Total vulnerabilities: ${security.vulnerabilities?.total || 0}`)
      console.log(`   └ Outdated dependencies: ${security.dependencies?.outdated || 0}`)
    }
    
    if (maintainability && !maintainability.error) {
      console.log(`🔧 Maintainability:`)
      console.log(`   └ Technical debt: ${maintainability.technicalDebt?.totalHours || 0}h`)
      console.log(`   └ Documentation: ${maintainability.documentation?.score || 0}%`)
      console.log(`   └ Test ratio: ${maintainability.testability?.testRatio || 0}%`)
    }
    
    console.log('─'.repeat(50))
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// CLI 인터페이스
async function main() {
  const args = process.argv.slice(2)
  const collector = new QualityMetricsCollector()
  
  try {
    switch (args[0]) {
      case '--architecture':
      case '-a':
        await collector.collectArchitectureOnly()
        break
        
      case '--code':
      case '-c':
        await collector.collectCodeQualityOnly()
        break
        
      case '--performance':
      case '-p':
        await collector.collectPerformanceOnly()
        break
        
      case '--security':
      case '-s':
        await collector.collectSecurityOnly()
        break
        
      case '--maintainability':
      case '-m':
        await collector.collectMaintainabilityOnly()
        break
        
      case '--help':
      case '-h':
        showHelp()
        break
        
      default:
        await collector.collectAllMetrics()
        break
    }
  } catch (error) {
    console.error('💥 Error:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🔍 Quality Metrics Collector

Usage: node quality-metrics-collector.js [options]

Options:
  -a, --architecture    Collect architecture metrics only
  -c, --code           Collect code quality metrics only  
  -p, --performance    Collect performance metrics only
  -s, --security       Collect security metrics only
  -m, --maintainability Collect maintainability metrics only
  -h, --help           Show this help message

Examples:
  node quality-metrics-collector.js              # Collect all metrics
  node quality-metrics-collector.js --code       # Code quality only
  node quality-metrics-collector.js -a           # Architecture only

Output:
  - quality-metrics.json       JSON report
  - quality-report.md         Markdown report  
  - quality-gate-decision.json Quality gate decision
`)
}

// 모듈로 사용할 때와 직접 실행할 때 구분
if (require.main === module) {
  main().catch(console.error)
}

module.exports = QualityMetricsCollector
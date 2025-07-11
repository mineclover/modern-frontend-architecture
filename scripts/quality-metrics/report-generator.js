// 리포트 생성기
import MetricsUtils from './utils.js'

class ReportGenerator {
  constructor(metrics) {
    this.metrics = metrics
  }

  generateAll() {
    const jsonPath = 'quality-metrics.json'
    const markdownPath = 'quality-report.md'
    const decisionPath = 'quality-gate-decision.json'

    // JSON 리포트 생성
    MetricsUtils.writeJsonFile(jsonPath, this.metrics)
    console.log(`📄 JSON report generated: ${jsonPath}`)

    // 마크다운 리포트 생성
    const markdown = this.generateMarkdownReport()
    MetricsUtils.writeJsonFile(markdownPath, markdown)
    console.log(`📄 Markdown report generated: ${markdownPath}`)

    // 품질 게이트 결정
    const decision = this.makeQualityGateDecision()
    MetricsUtils.writeJsonFile(decisionPath, decision)
    console.log(`🚦 Quality gate decision: ${decisionPath}`)

    return decision
  }

  generateMarkdownReport() {
    const { architecture, code, performance, security, maintainability } = this.metrics
    
    return `# 📊 Quality Metrics Report

**Generated**: ${this.metrics.timestamp}

## 🏗️ Architecture Quality

| Metric | Value | Status |
|--------|-------|--------|
| Dependency Violations | ${architecture?.dependencyViolations || 0} | ${this.getArchitectureStatus('dependencyViolations', architecture?.dependencyViolations)} |
| Domain Structure Score | ${architecture?.domainStructureScore || 0}% | ${this.getArchitectureStatus('domainStructureScore', architecture?.domainStructureScore)} |
| Circular Dependencies | ${architecture?.circularDependencies || 0} | ${this.getArchitectureStatus('circularDependencies', architecture?.circularDependencies)} |
| Public API Compliance | ${architecture?.publicApiCompliance || 0} violations | ${this.getArchitectureStatus('publicApiCompliance', architecture?.publicApiCompliance)} |
| Layer Compliance | ${architecture?.layerCompliance || 0}% | ${this.getArchitectureStatus('layerCompliance', architecture?.layerCompliance)} |

## 💻 Code Quality

| Metric | Value | Status |
|--------|-------|--------|
| Test Coverage | ${code?.coverage?.lines || 0}% | ${this.getCodeQualityStatus('coverage', code?.coverage?.lines)} |
| Code Complexity | ${code?.complexity?.average || 0} avg | ${this.getCodeQualityStatus('complexity', code?.complexity?.average)} |
| Code Duplication | ${code?.duplication?.percentage || 0}% | ${this.getCodeQualityStatus('duplication', code?.duplication?.percentage)} |
| Linting Errors | ${code?.linting?.errors || 0} | ${this.getCodeQualityStatus('linting', code?.linting?.errors)} |
| Type Errors | ${code?.typeCheck?.errors || 0} | ${this.getCodeQualityStatus('typeCheck', code?.typeCheck?.errors)} |

## ⚡ Performance

| Metric | Value | Status |
|--------|-------|--------|
| Bundle Size | ${MetricsUtils.formatBytes(performance?.bundleSize?.total || 0)} | ${this.getPerformanceStatus('bundleSize', performance?.bundleSize?.total)} |
| Build Time | ${performance?.buildTime || 0}ms | ${this.getPerformanceStatus('buildTime', performance?.buildTime)} |
| Chunks | ${performance?.bundleSize?.chunks || 0} | ℹ️ |

## 🔒 Security

| Metric | Value | Status |
|--------|-------|--------|
| Critical Vulnerabilities | ${security?.vulnerabilities?.critical || 0} | ${this.getSecurityStatus('critical', security?.vulnerabilities?.critical)} |
| High Vulnerabilities | ${security?.vulnerabilities?.high || 0} | ${this.getSecurityStatus('high', security?.vulnerabilities?.high)} |
| Total Vulnerabilities | ${security?.vulnerabilities?.total || 0} | ${this.getSecurityStatus('total', security?.vulnerabilities?.total)} |
| Outdated Dependencies | ${security?.dependencies?.outdated || 0} | ${this.getSecurityStatus('outdated', security?.dependencies?.outdated)} |
| License Issues | ${security?.licenses?.issues?.length || 0} | ${this.getSecurityStatus('licenses', security?.licenses?.issues?.length)} |

## 🔧 Maintainability

| Metric | Value | Status |
|--------|-------|--------|
| Technical Debt | ${maintainability?.technicalDebt?.totalHours || 0}h | ${this.getMaintainabilityStatus('debt', maintainability?.technicalDebt?.totalHours)} |
| Documentation Score | ${maintainability?.documentation?.score || 0}% | ${this.getMaintainabilityStatus('documentation', maintainability?.documentation?.score)} |
| Test Ratio | ${maintainability?.testability?.testRatio || 0}% | ${this.getMaintainabilityStatus('testability', maintainability?.testability?.testRatio)} |
| Code Smells | ${maintainability?.codeSmells?.totalSmells || 0} | ${this.getMaintainabilityStatus('codeSmells', maintainability?.codeSmells?.totalSmells)} |

## 🎯 Overall Score

**${this.calculateOverallScore()}** / 100

${this.getQualityGateStatus()}

## 📋 Recommendations

${this.generateRecommendations().map(rec => `- ${rec}`).join('\n')}

## 🚨 Blockers

${this.identifyBlockers().map(blocker => `- ❌ ${blocker}`).join('\n') || '✅ No blockers found!'}
`
  }

  getArchitectureStatus(metric, value) {
    const thresholds = {
      dependencyViolations: { good: 0, warning: 2 },
      domainStructureScore: { good: 90, warning: 70 },
      circularDependencies: { good: 0, warning: 2 },
      publicApiCompliance: { good: 0, warning: 2 },
      layerCompliance: { good: 90, warning: 70 }
    }

    if (['dependencyViolations', 'circularDependencies', 'publicApiCompliance'].includes(metric)) {
      return MetricsUtils.getStatusIcon(value || 0, thresholds[metric])
    } else {
      return MetricsUtils.getInverseStatusIcon(value || 0, thresholds[metric])
    }
  }

  getCodeQualityStatus(metric, value) {
    const thresholds = {
      coverage: { good: 80, warning: 60 },
      complexity: { good: 5, warning: 10 },
      duplication: { good: 3, warning: 5 },
      linting: { good: 0, warning: 5 },
      typeCheck: { good: 0, warning: 2 }
    }

    if (['complexity', 'duplication', 'linting', 'typeCheck'].includes(metric)) {
      return MetricsUtils.getStatusIcon(value || 0, thresholds[metric])
    } else {
      return MetricsUtils.getInverseStatusIcon(value || 0, thresholds[metric])
    }
  }

  getPerformanceStatus(metric, value) {
    const thresholds = {
      bundleSize: { good: 500000, warning: 1000000 }, // 500KB, 1MB
      buildTime: { good: 30000, warning: 60000 } // 30s, 60s
    }

    return MetricsUtils.getStatusIcon(value || 0, thresholds[metric])
  }

  getSecurityStatus(metric, value) {
    const thresholds = {
      critical: { good: 0, warning: 0 },
      high: { good: 0, warning: 2 },
      total: { good: 5, warning: 15 },
      outdated: { good: 5, warning: 15 },
      licenses: { good: 0, warning: 2 }
    }

    return MetricsUtils.getStatusIcon(value || 0, thresholds[metric])
  }

  getMaintainabilityStatus(metric, value) {
    const thresholds = {
      debt: { good: 8, warning: 24 },
      documentation: { good: 80, warning: 60 },
      testability: { good: 40, warning: 25 },
      codeSmells: { good: 10, warning: 25 }
    }

    if (['debt', 'codeSmells'].includes(metric)) {
      return MetricsUtils.getStatusIcon(value || 0, thresholds[metric])
    } else {
      return MetricsUtils.getInverseStatusIcon(value || 0, thresholds[metric])
    }
  }

  calculateOverallScore() {
    const { architecture, code, performance, security, maintainability } = this.metrics
    
    let score = 0
    
    // Architecture (25% weight)
    let archScore = 0
    archScore += (architecture?.dependencyViolations === 0) ? 25 : 0
    archScore += (architecture?.domainStructureScore || 0) * 0.25
    archScore += (architecture?.circularDependencies === 0) ? 25 : 0
    archScore += (architecture?.publicApiCompliance === 0) ? 25 : 0
    score += archScore * 0.25
    
    // Code Quality (25% weight)
    let codeScore = 0
    codeScore += Math.min(100, (code?.coverage?.lines || 0))
    codeScore += (code?.complexity?.average <= 5) ? 25 : (code?.complexity?.average <= 10) ? 15 : 0
    codeScore += (code?.duplication?.percentage <= 3) ? 25 : (code?.duplication?.percentage <= 5) ? 15 : 0
    codeScore += (code?.linting?.errors === 0) ? 25 : 0
    score += (codeScore / 4) * 0.25
    
    // Performance (20% weight)
    let perfScore = 0
    perfScore += (performance?.bundleSize?.total <= 500000) ? 50 : (performance?.bundleSize?.total <= 1000000) ? 25 : 0
    perfScore += (performance?.buildTime <= 30000) ? 50 : (performance?.buildTime <= 60000) ? 25 : 0
    score += (perfScore / 2) * 0.20
    
    // Security (15% weight)
    let secScore = 0
    secScore += (security?.vulnerabilities?.critical === 0) ? 40 : 0
    secScore += (security?.vulnerabilities?.high === 0) ? 30 : (security?.vulnerabilities?.high <= 2) ? 15 : 0
    secScore += (security?.dependencies?.outdated <= 5) ? 30 : (security?.dependencies?.outdated <= 15) ? 15 : 0
    score += (secScore / 100) * 100 * 0.15
    
    // Maintainability (15% weight)
    let maintScore = 0
    maintScore += (maintainability?.technicalDebt?.totalHours <= 8) ? 25 : (maintainability?.technicalDebt?.totalHours <= 24) ? 15 : 0
    maintScore += (maintainability?.documentation?.score || 0) * 0.25
    maintScore += (maintainability?.testability?.testRatio || 0) * 0.25
    maintScore += (maintainability?.codeSmells?.totalSmells <= 10) ? 25 : (maintainability?.codeSmells?.totalSmells <= 25) ? 15 : 0
    score += (maintScore / 4) * 0.15
    
    return Math.round(score)
  }

  getQualityGateStatus() {
    const score = this.calculateOverallScore()
    
    if (score >= 90) {
      return '🎉 **PASSED** - Excellent quality! Ready for production.'
    } else if (score >= 75) {
      return '✅ **PASSED** - Good quality with minor improvements needed.'
    } else if (score >= 60) {
      return '⚠️ **CONDITIONAL** - Requires improvements before merge.'
    } else {
      return '❌ **FAILED** - Significant quality issues must be addressed.'
    }
  }

  makeQualityGateDecision() {
    const score = this.calculateOverallScore()
    const status = score >= 75 ? 'PASSED' : score >= 60 ? 'CONDITIONAL' : 'FAILED'
    
    const decision = {
      score,
      status,
      timestamp: this.metrics.timestamp,
      blockers: this.identifyBlockers(),
      recommendations: this.generateRecommendations()
    }
    
    console.log(`🚦 Quality Gate: ${status} (Score: ${score}/100)`)
    
    if (status === 'FAILED' && process.env.CI) {
      console.log('💥 Quality gate failed - exiting with code 1')
    }
    
    return decision
  }

  identifyBlockers() {
    const blockers = []
    const { architecture, code, security } = this.metrics
    
    if ((architecture?.dependencyViolations || 0) > 0) {
      blockers.push('Dependency violations must be fixed')
    }
    
    if ((architecture?.circularDependencies || 0) > 0) {
      blockers.push('Circular dependencies must be resolved')
    }
    
    if ((code?.linting?.errors || 0) > 0) {
      blockers.push('Linting errors must be fixed')
    }
    
    if ((code?.typeCheck?.errors || 0) > 0) {
      blockers.push('TypeScript errors must be fixed')
    }
    
    if ((security?.vulnerabilities?.critical || 0) > 0) {
      blockers.push('Critical security vulnerabilities must be patched')
    }
    
    if ((code?.coverage?.lines || 0) < 50) {
      blockers.push('Test coverage must be at least 50%')
    }
    
    return blockers
  }

  generateRecommendations() {
    const recommendations = []
    const { architecture, code, performance, security, maintainability } = this.metrics
    
    if ((architecture?.domainStructureScore || 0) < 90) {
      recommendations.push('🏗️ Improve domain structure compliance')
    }
    
    if ((code?.coverage?.lines || 0) < 80) {
      recommendations.push('🧪 Increase test coverage to 80%')
    }
    
    if ((code?.complexity?.average || 0) > 5) {
      recommendations.push('🔧 Reduce code complexity')
    }
    
    if ((code?.duplication?.percentage || 0) > 3) {
      recommendations.push('♻️ Eliminate code duplication')
    }
    
    if ((performance?.bundleSize?.total || 0) > 500000) {
      recommendations.push('📦 Optimize bundle size')
    }
    
    if ((security?.dependencies?.outdated || 0) > 5) {
      recommendations.push('🔄 Update outdated dependencies')
    }
    
    if ((maintainability?.documentation?.score || 0) < 80) {
      recommendations.push('📝 Improve documentation coverage')
    }
    
    if ((maintainability?.technicalDebt?.totalHours || 0) > 8) {
      recommendations.push('⚡ Address technical debt (TODO, FIXME comments)')
    }
    
    return recommendations
  }
}

export default ReportGenerator
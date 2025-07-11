// 코드 품질 메트릭 수집기
import MetricsUtils from './utils.js'

class CodeQualityCollector {
  async collect() {
    console.log('💻 Collecting code quality metrics...')
    
    try {
      return {
        coverage: this.collectCoverage(),
        complexity: this.analyzeComplexity(),
        duplication: this.analyzeDuplication(),
        linting: this.runLinting(),
        typeCheck: this.runTypeCheck()
      }
    } catch (error) {
      console.error('Code quality metrics collection failed:', error.message)
      return { error: error.message }
    }
  }

  collectCoverage() {
    try {
      const result = MetricsUtils.safeExec('npm run test:coverage -- --reporter=json')
      if (!result) return { lines: 0, functions: 0, branches: 0, statements: 0 }
      
      const coverage = MetricsUtils.safeJsonParse(result)
      if (!coverage?.total) return { lines: 0, functions: 0, branches: 0, statements: 0 }
      
      return {
        lines: coverage.total.lines.pct || 0,
        functions: coverage.total.functions.pct || 0,
        branches: coverage.total.branches.pct || 0,
        statements: coverage.total.statements.pct || 0
      }
    } catch {
      return { lines: 0, functions: 0, branches: 0, statements: 0 }
    }
  }

  analyzeComplexity() {
    try {
      const result = MetricsUtils.safeExec('npx ts-complex --output json src/')
      if (!result) return { average: 0, max: 0, highComplexityFiles: 0 }
      
      const data = MetricsUtils.safeJsonParse(result)
      if (!data) return { average: 0, max: 0, highComplexityFiles: 0 }
      
      return {
        average: Math.round(data.averageComplexity || 0),
        max: data.maxComplexity || 0,
        highComplexityFiles: (data.files || []).filter(f => f.complexity > 10).length
      }
    } catch {
      return { average: 0, max: 0, highComplexityFiles: 0 }
    }
  }

  analyzeDuplication() {
    try {
      const result = MetricsUtils.safeExec('npx jscpd src/ --format json')
      if (!result) return { percentage: 0, duplicatedLines: 0, files: 0 }
      
      const data = MetricsUtils.safeJsonParse(result)
      if (!data?.statistics?.total) return { percentage: 0, duplicatedLines: 0, files: 0 }
      
      return {
        percentage: Math.round(data.statistics.total.percentage || 0),
        duplicatedLines: data.statistics.total.duplicatedLines || 0,
        files: (data.duplicates || []).length
      }
    } catch {
      return { percentage: 0, duplicatedLines: 0, files: 0 }
    }
  }

  runLinting() {
    try {
      // 임시 파일에 결과 저장
      MetricsUtils.safeExec('npm run lint -- --format json > lint-results.json 2>/dev/null || true')
      
      const results = MetricsUtils.readJsonFile('lint-results.json')
      if (!results) return { errors: 0, warnings: 0 }
      
      const totalErrors = results.reduce((sum, file) => sum + (file.errorCount || 0), 0)
      const totalWarnings = results.reduce((sum, file) => sum + (file.warningCount || 0), 0)
      
      // 임시 파일 정리
      MetricsUtils.safeExec('rm -f lint-results.json')
      
      return { errors: totalErrors, warnings: totalWarnings }
    } catch {
      return { errors: 0, warnings: 0 }
    }
  }

  runTypeCheck() {
    try {
      const result = MetricsUtils.safeExec('npm run type-check 2>&1')
      if (!result) return { errors: 0 }
      
      // TypeScript 에러 카운트
      const errors = (result.match(/error TS\d+:/g) || []).length
      return { errors }
    } catch {
      return { errors: 0 }
    }
  }
}

export default CodeQualityCollector
// 유지보수성 메트릭 수집기
import MetricsUtils from './utils.js'

class MaintainabilityCollector {
  async collect() {
    console.log('🔧 Collecting maintainability metrics...')
    
    try {
      return {
        technicalDebt: this.calculateTechnicalDebt(),
        documentation: this.analyzeDocumentation(),
        testability: this.analyzeTestability(),
        codeSmells: this.detectCodeSmells()
      }
    } catch (error) {
      console.error('Maintainability metrics collection failed:', error.message)
      return { error: error.message }
    }
  }

  calculateTechnicalDebt() {
    try {
      const todoComments = MetricsUtils.countPatternInFiles('TODO')
      const fixmeComments = MetricsUtils.countPatternInFiles('FIXME')
      const deprecatedUsage = MetricsUtils.countPatternInFiles('@deprecated')
      const hackComments = MetricsUtils.countPatternInFiles('HACK|XXX')
      
      // 각 항목당 평균 해결 시간 추정 (시간)
      const todoHours = todoComments * 0.5
      const fixmeHours = fixmeComments * 1.0
      const deprecatedHours = deprecatedUsage * 2.0
      const hackHours = hackComments * 1.5
      
      const totalHours = todoHours + fixmeHours + deprecatedHours + hackHours
      
      return {
        todoComments,
        fixmeComments,
        deprecatedUsage,
        hackComments,
        totalHours: Math.round(totalHours * 10) / 10
      }
    } catch {
      return { 
        todoComments: 0, 
        fixmeComments: 0, 
        deprecatedUsage: 0, 
        hackComments: 0,
        totalHours: 0 
      }
    }
  }

  analyzeDocumentation() {
    try {
      const hasReadme = MetricsUtils.fileExists('README.md')
      const hasDocsFolder = MetricsUtils.fileExists('docs/')
      const domainDocs = MetricsUtils.findFiles('README.md', 'src/domain')
      const hasChangelog = MetricsUtils.fileExists('CHANGELOG.md')
      const hasContributing = MetricsUtils.fileExists('CONTRIBUTING.md')
      
      // JSDoc 주석 수
      const jsdocComments = MetricsUtils.countPatternInFiles('/\\*\\*')
      
      // 인라인 주석 수  
      const inlineComments = MetricsUtils.countPatternInFiles('//')
      
      let score = 0
      if (hasReadme) score += 20
      if (hasDocsFolder) score += 20
      if (hasChangelog) score += 10
      if (hasContributing) score += 10
      if (domainDocs > 0) score += Math.min(20, domainDocs * 5)
      if (jsdocComments > 50) score += 10
      if (inlineComments > 100) score += 10
      
      return {
        hasReadme,
        hasDocsFolder,
        hasChangelog,
        hasContributing,
        domainDocumentation: domainDocs,
        jsdocComments,
        inlineComments,
        score: Math.min(100, score)
      }
    } catch {
      return {
        hasReadme: false,
        hasDocsFolder: false,
        hasChangelog: false,
        hasContributing: false,
        domainDocumentation: 0,
        jsdocComments: 0,
        inlineComments: 0,
        score: 0
      }
    }
  }

  analyzeTestability() {
    try {
      const testFiles = MetricsUtils.findFiles('*.test.*') + MetricsUtils.findFiles('*.spec.*')
      const sourceFiles = MetricsUtils.findFiles('*.ts') + MetricsUtils.findFiles('*.tsx')
      
      const testRatio = sourceFiles > 0 ? (testFiles / sourceFiles) * 100 : 0
      
      // 테스트 유틸리티 파일 존재 여부
      const hasTestUtils = MetricsUtils.fileExists('src/test') || MetricsUtils.fileExists('src/__tests__')
      
      // 모킹 사용 여부
      const mockUsage = MetricsUtils.countPatternInFiles('jest\\.mock|vi\\.mock')
      
      let score = Math.min(80, testRatio * 2) // 40% 테스트 비율 = 80점
      if (hasTestUtils) score += 10
      if (mockUsage > 0) score += 10
      
      return {
        testFiles,
        sourceFiles,
        testRatio: Math.round(testRatio * 10) / 10,
        hasTestUtils,
        mockUsage,
        score: Math.min(100, Math.round(score))
      }
    } catch {
      return { 
        testFiles: 0, 
        sourceFiles: 0, 
        testRatio: 0, 
        hasTestUtils: false,
        mockUsage: 0,
        score: 0 
      }
    }
  }

  detectCodeSmells() {
    try {
      // 긴 파일 감지 (200줄 이상)
      const longFiles = this.countLongFiles()
      
      // 큰 함수 감지 (30줄 이상)
      const longFunctions = MetricsUtils.countPatternInFiles('function.*{[\\s\\S]{30,}')
      
      // 매직 넘버 감지
      const magicNumbers = MetricsUtils.countPatternInFiles('[^a-zA-Z]\\d{2,}[^a-zA-Z]')
      
      // console.log 사용 (프로덕션에서 제거되어야 함)
      const consoleLogs = MetricsUtils.countPatternInFiles('console\\.log')
      
      // any 타입 사용
      const anyTypeUsage = MetricsUtils.countPatternInFiles(': any|<any>')
      
      return {
        longFiles,
        longFunctions,
        magicNumbers,
        consoleLogs,
        anyTypeUsage,
        totalSmells: longFiles + longFunctions + magicNumbers + consoleLogs + anyTypeUsage
      }
    } catch {
      return {
        longFiles: 0,
        longFunctions: 0,
        magicNumbers: 0,
        consoleLogs: 0,
        anyTypeUsage: 0,
        totalSmells: 0
      }
    }
  }

  countLongFiles() {
    try {
      const result = MetricsUtils.safeExec(`find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 200 {count++} END {print count+0}'`)
      return result ? parseInt(result.trim()) : 0
    } catch {
      return 0
    }
  }
}

export default MaintainabilityCollector
// 아키텍처 메트릭 수집기
import MetricsUtils from './utils.js'

class ArchitectureCollector {
  async collect() {
    console.log('🏗️ Collecting architecture metrics...')
    
    try {
      return {
        dependencyViolations: this.checkDependencyViolations(),
        domainStructureScore: this.checkDomainStructure(),
        circularDependencies: this.checkCircularDependencies(),
        publicApiCompliance: this.checkPublicApiCompliance(),
        layerCompliance: this.checkLayerCompliance()
      }
    } catch (error) {
      console.error('Architecture metrics collection failed:', error.message)
      return { error: error.message }
    }
  }

  checkDependencyViolations() {
    try {
      const result = MetricsUtils.safeExec('node scripts/check-dependencies.js')
      if (!result) return 0
      
      // 의존성 위반 파싱
      const violations = result.match(/❌.*위반/g) || []
      return violations.length
    } catch {
      return 0
    }
  }

  checkDomainStructure() {
    try {
      const result = MetricsUtils.safeExec('node scripts/validate-domains.js')
      if (!result) return 0
      
      // 성공/실패 카운트로 점수 계산
      const successCount = (result.match(/✅/g) || []).length
      const errorCount = (result.match(/❌/g) || []).length
      const total = successCount + errorCount
      
      return total > 0 ? Math.round((successCount / total) * 100) : 0
    } catch {
      return 0
    }
  }

  checkCircularDependencies() {
    try {
      const result = MetricsUtils.safeExec('npx madge --circular --extensions ts,tsx src/')
      if (!result) return 0
      
      return result.trim().split('\n').filter(line => line.includes('→')).length
    } catch {
      return 0
    }
  }

  checkPublicApiCompliance() {
    // Public API 규칙 준수 여부 체크
    try {
      const result = MetricsUtils.safeExec('npm run lint:architecture 2>&1')
      if (!result) return 0
      
      // ESLint 에러에서 Public API 위반 카운트
      const violations = result.match(/import\/no-internal-modules/g) || []
      return violations.length
    } catch {
      return 0
    }
  }

  checkLayerCompliance() {
    // 레이어 규칙 준수도 체크
    const layers = ['common', 'global', 'services', 'shared', 'domain', 'feature', 'routes']
    let compliantLayers = 0
    
    layers.forEach(layer => {
      const layerPath = `src/${layer}`
      if (MetricsUtils.fileExists(layerPath)) {
        compliantLayers++
      }
    })
    
    return Math.round((compliantLayers / layers.length) * 100)
  }
}

export default ArchitectureCollector
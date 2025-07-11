// 보안 메트릭 수집기
import MetricsUtils from './utils.js'

class SecurityCollector {
  async collect() {
    console.log('🔒 Collecting security metrics...')
    
    try {
      return {
        vulnerabilities: this.scanVulnerabilities(),
        dependencies: this.analyzeDependencies(),
        secrets: this.scanForSecrets(),
        licenses: this.checkLicenses()
      }
    } catch (error) {
      console.error('Security metrics collection failed:', error.message)
      return { error: error.message }
    }
  }

  scanVulnerabilities() {
    try {
      const result = MetricsUtils.safeExec('npm audit --json')
      if (!result) return { critical: 0, high: 0, moderate: 0, low: 0, total: 0 }
      
      const audit = MetricsUtils.safeJsonParse(result)
      if (!audit?.metadata?.vulnerabilities) {
        return { critical: 0, high: 0, moderate: 0, low: 0, total: 0 }
      }
      
      const vuln = audit.metadata.vulnerabilities
      return {
        critical: vuln.critical || 0,
        high: vuln.high || 0,
        moderate: vuln.moderate || 0,
        low: vuln.low || 0,
        total: vuln.total || 0
      }
    } catch {
      return { critical: 0, high: 0, moderate: 0, low: 0, total: 0 }
    }
  }

  analyzeDependencies() {
    try {
      const packageLock = MetricsUtils.readJsonFile('package-lock.json')
      const packageJson = MetricsUtils.readJsonFile('package.json')
      
      if (!packageJson) return { total: 0, outdated: 0, direct: 0 }
      
      const directDeps = Object.keys({
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      }).length
      
      const totalDeps = packageLock?.packages ? Object.keys(packageLock.packages).length - 1 : directDeps
      
      return {
        total: totalDeps,
        direct: directDeps,
        outdated: this.checkOutdatedDependencies()
      }
    } catch {
      return { total: 0, outdated: 0, direct: 0 }
    }
  }

  checkOutdatedDependencies() {
    try {
      const result = MetricsUtils.safeExec('npm outdated --json')
      if (!result) return 0
      
      const outdated = MetricsUtils.safeJsonParse(result)
      return outdated ? Object.keys(outdated).length : 0
    } catch {
      return 0
    }
  }

  scanForSecrets() {
    try {
      // 간단한 시크릿 패턴 검사
      const patterns = [
        'password\\s*=',
        'api[_-]?key\\s*=',
        'secret\\s*=',
        'token\\s*=',
        'AWS_ACCESS_KEY',
        'private[_-]?key'
      ]
      
      let totalFindings = 0
      const foundTypes = []
      
      patterns.forEach(pattern => {
        const count = MetricsUtils.countPatternInFiles(pattern, 'src')
        if (count > 0) {
          totalFindings += count
          foundTypes.push(pattern)
        }
      })
      
      return {
        found: totalFindings,
        types: foundTypes
      }
    } catch {
      return { found: 0, types: [] }
    }
  }

  checkLicenses() {
    try {
      const result = MetricsUtils.safeExec('npx license-checker --json')
      if (!result) return { compatible: 0, total: 0, issues: [] }
      
      const licenses = MetricsUtils.safeJsonParse(result)
      if (!licenses) return { compatible: 0, total: 0, issues: [] }
      
      const total = Object.keys(licenses).length
      const problematicLicenses = ['GPL', 'AGPL', 'LGPL']
      let issues = []
      
      Object.entries(licenses).forEach(([pkg, info]) => {
        const license = info.licenses || ''
        if (problematicLicenses.some(prob => license.includes(prob))) {
          issues.push({ package: pkg, license })
        }
      })
      
      return {
        total,
        compatible: total - issues.length,
        issues: issues.slice(0, 10) // 최대 10개만 리포트
      }
    } catch {
      return { compatible: 0, total: 0, issues: [] }
    }
  }
}

export default SecurityCollector
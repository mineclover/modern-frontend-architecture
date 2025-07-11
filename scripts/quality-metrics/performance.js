// 성능 메트릭 수집기
const MetricsUtils = require('./utils')

class PerformanceCollector {
  async collect() {
    console.log('⚡ Collecting performance metrics...')
    
    try {
      return {
        bundleSize: this.analyzeBundleSize(),
        buildTime: this.measureBuildTime(),
        runtime: this.collectRuntimeMetrics()
      }
    } catch (error) {
      console.error('Performance metrics collection failed:', error.message)
      return { error: error.message }
    }
  }

  analyzeBundleSize() {
    try {
      // Vite 빌드 통계 확인
      if (MetricsUtils.fileExists('dist/stats.json')) {
        const stats = MetricsUtils.readJsonFile('dist/stats.json')
        if (stats?.assets) {
          return this.parseViteStats(stats)
        }
      }

      // 대체: dist 폴더 직접 분석
      return this.analyzeDist()
    } catch {
      return { total: 0, gzipped: 0, chunks: 0, assets: 0 }
    }
  }

  parseViteStats(stats) {
    const assets = stats.assets || []
    const total = assets.reduce((sum, asset) => sum + (asset.size || 0), 0)
    const jsAssets = assets.filter(asset => asset.name.endsWith('.js'))
    const chunks = jsAssets.length
    
    return {
      total,
      gzipped: Math.round(total * 0.3), // 추정값
      chunks,
      assets: assets.length
    }
  }

  analyzeDist() {
    try {
      const result = MetricsUtils.safeExec('find dist -type f -name "*.js" -exec wc -c {} + | tail -1')
      const total = result ? parseInt(result.trim().split(' ')[0]) : 0
      
      const jsFiles = MetricsUtils.safeExec('find dist -name "*.js" | wc -l')
      const chunks = jsFiles ? parseInt(jsFiles.trim()) : 0
      
      const allFiles = MetricsUtils.safeExec('find dist -type f | wc -l')
      const assets = allFiles ? parseInt(allFiles.trim()) : 0
      
      return {
        total,
        gzipped: Math.round(total * 0.3), // 추정값
        chunks,
        assets
      }
    } catch {
      return { total: 0, gzipped: 0, chunks: 0, assets: 0 }
    }
  }

  measureBuildTime() {
    try {
      console.log('📦 Measuring build time...')
      const startTime = Date.now()
      
      MetricsUtils.safeExec('npm run build', { stdio: 'ignore' })
      
      const buildTime = Date.now() - startTime
      console.log(`⏱️ Build completed in ${buildTime}ms`)
      
      return buildTime
    } catch (error) {
      console.warn('Build failed, cannot measure build time')
      return -1
    }
  }

  collectRuntimeMetrics() {
    // CI 환경에서는 런타임 메트릭 수집이 제한적
    return {
      note: 'Runtime metrics are collected in production monitoring',
      lighthouse: this.runLighthouseAudit()
    }
  }

  runLighthouseAudit() {
    try {
      // Lighthouse 결과가 있는지 확인
      if (MetricsUtils.fileExists('lighthouse-report.json')) {
        const report = MetricsUtils.readJsonFile('lighthouse-report.json')
        if (report?.categories) {
          return {
            performance: Math.round(report.categories.performance?.score * 100) || 0,
            accessibility: Math.round(report.categories.accessibility?.score * 100) || 0,
            bestPractices: Math.round(report.categories['best-practices']?.score * 100) || 0,
            seo: Math.round(report.categories.seo?.score * 100) || 0
          }
        }
      }
      
      return null
    } catch {
      return null
    }
  }
}

module.exports = PerformanceCollector
// 품질 메트릭 수집 유틸리티
import fs from 'fs'
import { execSync } from 'child_process'

class MetricsUtils {
  static safeExec(command, options = {}) {
    try {
      return execSync(command, { encoding: 'utf8', ...options })
    } catch (error) {
      console.warn(`Command failed: ${command}`)
      return null
    }
  }

  static safeJsonParse(str) {
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  }

  static fileExists(path) {
    try {
      return fs.existsSync(path)
    } catch {
      return false
    }
  }

  static readJsonFile(path) {
    try {
      const content = fs.readFileSync(path, 'utf8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  static writeJsonFile(path, data) {
    try {
      fs.writeFileSync(path, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error.message)
      return false
    }
  }

  static countPatternInFiles(pattern, directory = 'src') {
    try {
      const result = this.safeExec(`grep -r "${pattern}" ${directory} | wc -l`)
      return result ? parseInt(result.trim()) : 0
    } catch {
      return 0
    }
  }

  static findFiles(pattern, directory = 'src') {
    try {
      const result = this.safeExec(`find ${directory} -name "${pattern}" | wc -l`)
      return result ? parseInt(result.trim()) : 0
    } catch {
      return 0
    }
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getStatusIcon(value, thresholds) {
    if (value <= thresholds.good) return '✅'
    if (value <= thresholds.warning) return '⚠️'
    return '❌'
  }

  static getInverseStatusIcon(value, thresholds) {
    if (value >= thresholds.good) return '✅'
    if (value >= thresholds.warning) return '⚠️'
    return '❌'
  }
}

export default MetricsUtils
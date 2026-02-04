'use client'

import { useState } from 'react'
import { parseExcel } from '@/lib/utils/excel'
import { bulkCreateProfiles } from '@/app/(dashboard)/admin/members/upload/actions'
import { BulkMemberInput } from '@/lib/validations/member'
import { sanitizePhoneNumber } from '@/lib/utils/phone'

export function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<BulkMemberInput[]>([])
  const [commonSessionTime, setCommonSessionTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsLoading(true)
    setMessage(null)

    try {
      const parsedData = await parseExcel<BulkMemberInput>(selectedFile)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedData = parsedData.map((row: any) => {
        // Helper to normalize date
        const normalizeDate = (val: any): string | null => {
          if (!val) return null
          
          // Case 1: Excel Serial Date (Number or Numeric String)
          const numVal = typeof val === 'number' ? val : Number(val)
          if (!isNaN(numVal) && numVal > 10000) { // Simple heuristic to identify serial dates
            // Excel base date is usually Dec 30 1899
            const date = new Date((numVal - 25569) * 86400 * 1000)
            return date.toISOString().split('T')[0]
          }

          // Case 2: String Date Formats
          if (typeof val === 'string') {
            const trimmed = val.trim()
            // YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
            // YYYY.MM.DD
            if (/^\d{4}\.\d{2}\.\d{2}$/.test(trimmed)) return trimmed.replace(/\./g, '-')
            // YYYY/MM/DD
            if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) return trimmed.replace(/\//g, '-')
            // YYYYMMDD
            if (/^\d{8}$/.test(trimmed)) {
              return `${trimmed.substring(0, 4)}-${trimmed.substring(4, 6)}-${trimmed.substring(6, 8)}`
            }
          }

          return null
        }

        // Helper to normalize phone
        const normalizePhone = (val: any): string => {
           if (!val) return ''
           return sanitizePhoneNumber(String(val).trim())
        }

        return {
          name: row['이름'] || row['name'] || row['Name'],
          birthdate: normalizeDate(row['생년월일'] || row['birthdate'] || row['BirthDate']),
          guardian_phone: normalizePhone(row['보호자연락처'] || row['guardian_phone'] || row['GuardianPhone']),
          phone: normalizePhone(row['연락처'] || row['phone'] || row['Phone']),
          default_session_time: row['수련시간'] || row['session_time'] || row['DefaultSessionTime'],
        }
      }) as BulkMemberInput[]

      // Filter out invalid rows (missing name, birthdate, or guardian_phone)
      const validData = mappedData.filter(d => {
        const hasName = !!d.name
        const hasBirth = !!d.birthdate // normalizedDate returns null if invalid
        const hasGuardian = !!d.guardian_phone
        return hasName && hasBirth && hasGuardian
      })

      if (validData.length === 0) {
        // If we have rows but they were filtered out, it means parsing failed
        if (mappedData.length > 0) {
           setMessage({ type: 'error', text: '데이터 유효성 검사 실패. 날짜 형식(YYYY-MM-DD)을 확인해주세요.' })
        } else {
           setMessage({ type: 'error', text: '유효한 데이터가 없습니다. 엑셀 컬럼명을 확인해주세요 (이름, 생년월일, 보호자연락처).' })
        }
        setData([])
      } else {
        setData(validData)
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: '엑셀 파일을 분석하는데 실패했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!data.length) return

    setIsLoading(true)
    setMessage(null)

    try {
      const uploadData = data.map(member => ({
        ...member,
        default_session_time: member.default_session_time || commonSessionTime || undefined
      }))
      const result = await bulkCreateProfiles(uploadData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `총 ${result.count}명의 관원이 생성되었습니다.` })
        setData([])
        setFile(null)
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: '예기치 않은 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">엑셀 파일 선택</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        <p className="text-xs text-gray-500">
          필수 컬럼: <strong>이름, 생년월일 (YYYY-MM-DD), 보호자연락처</strong>. (선택: 연락처, 수련시간)
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">일괄 수련 시간 설정 (선택)</label>
        <input
          type="text"
          value={commonSessionTime}
          onChange={(e) => setCommonSessionTime(e.target.value)}
          placeholder="예: 17:00, 1부 등"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        />
        <p className="text-xs text-gray-500">
          엑셀에 수련시간이 없는 경우 이 값이 기본으로 적용됩니다.
        </p>
      </div>

      {data.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">미리보기 ({data.length} 명)</h3>
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생년월일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보호자 연락처</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수련시간</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(row.birthdate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.guardian_phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.default_session_time || commonSessionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
          >
            {isLoading ? '업로드 중...' : '관원 프로필 업로드'}
          </button>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

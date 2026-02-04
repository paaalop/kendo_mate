import { BulkUploadForm } from '@/components/admin/bulk-upload-form'

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관원 일괄 등록</h1>
        <p className="mt-2 text-gray-600">
          엑셀 파일을 업로드하여 여러 관원을 한 번에 등록합니다. 
          등록된 관원은 학부모가 앱을 통해 연결할 수 있습니다.
        </p>
      </div>
      
      <BulkUploadForm />
    </div>
  )
}

// Customer Report TypeScript Types
// Matches Prisma schema models for Customer Report Excel Upload feature

export type ResponseFieldType = 'DROPDOWN' | 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX'

export type CustomerReportStatus = 'OPEN' | 'LOCKED'

export interface ReportResponseFieldOption {
  label: string
  value: string | number | boolean
}

export interface ReportColumnDefinition {
  key: string
  label: string
  type?: 'string' | 'number' | 'date'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string | null
  fields: ReportResponseField[]
  reports: CustomerReport[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ReportResponseField {
  id: string
  templateId: string
  label: string
  key: string
  type: ResponseFieldType
  options: ReportResponseFieldOption[] | null
  required: boolean
  order: number
  isActive: boolean
  createdAt: Date
}

export interface CustomerReport {
  id: string
  name: string
  templateId: string
  template?: ReportTemplate
  status: CustomerReportStatus
  branchColumn: string
  columns: ReportColumnDefinition[]
  uploadedBy: string
  createdAt: Date
  rows: CustomerRow[]
}

export interface CustomerRow {
  id: string
  reportId: string
  report?: CustomerReport
  branchId: string | null
  branch?: { id: string; name: string }
  rowIndex: number
  customerData: Record<string, unknown>
  responses: CustomerRowResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface CustomerRowResponse {
  id: string
  rowId: string
  row?: CustomerRow
  fieldKey: string
  value: unknown
  updatedBy: string
  updatedAt: Date
}

// Form input types
export interface CreateReportTemplateInput {
  name: string
  description?: string
  fields: CreateReportResponseFieldInput[]
}

export interface CreateReportResponseFieldInput {
  label: string
  key: string
  type: ResponseFieldType
  options?: ReportResponseFieldOption[]
  required?: boolean
  order: number
}

export interface UpdateCustomerRowResponseInput {
  rowId: string
  fieldKey: string
  value: unknown
}

export interface CreateCustomerReportInput {
  name: string
  templateId: string
  branchColumn: string
  columns: ReportColumnDefinition[]
}

// Excel parsing types
export interface ExcelRowData {
  rowIndex: number
  data: Record<string, string | number | boolean | null>
  branchName?: string
}

export interface ParsedExcelResult {
  headers: string[]
  rows: ExcelRowData[]
  totalRows: number
}

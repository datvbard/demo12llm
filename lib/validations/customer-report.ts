import { z } from 'zod'

// ResponseFieldType enum from Prisma
export const ResponseFieldTypeEnum = z.enum([
  'DROPDOWN',
  'TEXT',
  'NUMBER',
  'DATE',
  'CHECKBOX',
])

// CustomerReportStatus enum from Prisma
export const CustomerReportStatusEnum = z.enum(['OPEN', 'LOCKED'])

// Report Response Field option type
export const ReportResponseFieldOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

// Report Column Definition
export const ReportColumnDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['string', 'number', 'date']).optional(),
})

// Create Report Template
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
})

export const updateTemplateSchema = createTemplateSchema.partial()

// Create Report Response Field
export const createFieldSchema = z.object({
  label: z.string().min(1, 'Label is required').max(200, 'Label too long'),
  key: z.string()
    .min(1, 'Key is required')
    .max(50, 'Key too long')
    .regex(/^[a-z][a-z0-9_]*$/, 'Key must start with lowercase letter and contain only lowercase letters, numbers, and underscores'),
  type: ResponseFieldTypeEnum,
  options: z.array(z.string()).optional(),
  required: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional(),
})

export const updateFieldSchema = createFieldSchema.partial()

// Reorder Fields
export const reorderFieldsSchema = z.object({
  fieldIds: z.array(z.string()).min(1, 'At least one field ID required'),
})

// Create Customer Report
export const createCustomerReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  templateId: z.string().min(1, 'Template ID is required'),
  branchColumn: z.string().min(1, 'Branch column is required'),
  columns: z.array(ReportColumnDefinitionSchema).min(1, 'At least one column required'),
})

// Update Customer Report
export const updateCustomerReportSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: CustomerReportStatusEnum.optional(),
})

// Update Branch Response
export const updateResponseSchema = z.object({
  responses: z.record(z.string(), z.any()),
})

// Query params for list endpoints
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: CustomerReportStatusEnum.optional(),
  templateId: z.string().optional(),
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type CreateFieldInput = z.infer<typeof createFieldSchema>
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>
export type ReorderFieldsInput = z.infer<typeof reorderFieldsSchema>
export type CreateCustomerReportInput = z.infer<typeof createCustomerReportSchema>
export type UpdateCustomerReportInput = z.infer<typeof updateCustomerReportSchema>
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>
export type ListQueryInput = z.infer<typeof listQuerySchema>

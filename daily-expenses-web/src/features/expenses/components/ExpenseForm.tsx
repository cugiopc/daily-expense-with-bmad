// ExpenseForm component with auto-focus and keyboard navigation
// Implements AC: 5-7 second expense entry goal
// Supports both create and edit modes (Story 2.8)

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box } from '@mui/material';
import { useCreateExpense } from '../hooks/useCreateExpense';
import { useUpdateExpense } from '../hooks/useUpdateExpense';

// Validation schema following Story 2.2 backend validation
const expenseSchema = z.object({
  amount: z
    .number({ required_error: 'Số tiền phải là số', invalid_type_error: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0')
    .min(0.01, 'Số tiền phải lớn hơn 0'),
  note: z
    .string()
    .max(500, 'Ghi chú không được quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  date: z.string(), // ISO 8601 date string (YYYY-MM-DD)
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess?: () => void; // Callback to close dialog after successful submission
  initialValues?: {
    amount: number;
    note?: string;
    date: string;
  };
  expenseId?: string; // If provided, form is in edit mode
  submitButtonText?: string; // Custom button text ("Thêm chi tiêu" or "Lưu thay đổi")
}

/**
 * ExpenseForm component
 * 
 * Key Features (from Acceptance Criteria):
 * - Amount field auto-focuses on mount (critical for 5-7 second entry goal)
 * - Number keyboard appears automatically on mobile
 * - Only 2 visible fields: Amount (required) and Note (optional)
 * - Date defaults to today (hidden unless user expands)
 * - Tab key moves focus: Amount → Note
 * - Enter key in Note field submits form
 * - Validates amount > 0 before submission
 * - Optimistic UI update (instant visual feedback)
 * - Supports edit mode with initial values (Story 2.8)
 * 
 * Performance: <500ms perceived time (optimistic update = instant)
 */
export function ExpenseForm({ 
  onSuccess, 
  initialValues, 
  expenseId,
  submitButtonText = 'Thêm chi tiêu'
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!expenseId && !!initialValues;
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    mode: 'onBlur', // Validate on blur to show errors immediately
    defaultValues: initialValues || {
      amount: undefined,
      note: '',
      date: (() => {
        // Get today's date in local timezone (YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
    },
  });

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const onSubmit = (data: ExpenseFormData) => {
    // Prevent double submission
    if (isSubmitting || createExpense.isPending || updateExpense.isPending) {
      return;
    }
    
    setIsSubmitting(true);
    
    if (isEditMode && expenseId) {
      // Edit mode: update existing expense
      updateExpense.mutate(
        { id: expenseId, data },
        {
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
      
      // Close dialog after submission
      onSuccess?.();
    } else {
      // Create mode: add new expense
      createExpense.mutate(data, {
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
      
      // Reset form immediately for instant next entry (AC: <500ms perceived time)
      // This happens BEFORE API completes - optimistic UI pattern
      reset();
      
      // Close dialog after successful submission (if callback provided)
      onSuccess?.();
    }
  };

  // Handle Enter key in Note field to submit form (AC requirement)
  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      // Trigger validation and submit
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 1, // Small top margin for better spacing in dialog
      }}
    >
      {/* Amount Field - Auto-focused for fastest entry */}
      <Controller
        name="amount"
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <TextField
            {...field}
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? undefined : parseFloat(val));
            }}
            label="Số tiền"
            type="number"
            autoFocus // 🎯 CRITICAL: Auto-focus for 5-7 second entry goal
            inputProps={{
              min: 0.01,
              step: 0.01,
              inputMode: 'decimal', // Mobile keyboard optimization (numeric with decimal)
            }}
            error={!!errors.amount}
            helperText={errors.amount?.message}
            fullWidth
            required
            placeholder="vd: 50000"
          />
        )}
      />

      {/* Note Field - Optional, Enter key submits */}
      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Ghi chú"
            placeholder="vd: cafe, ăn trưa, xăng xe"
            error={!!errors.note}
            helperText={errors.note?.message || `${(field.value || '').length}/500 ký tự`}
            fullWidth
            onKeyDown={handleNoteKeyDown} // AC: Enter key submits form
            inputProps={{
              onKeyDown: handleNoteKeyDown, // Ensure it binds to the actual input element
            }}
          />
        )}
      />

      {/* Date field hidden by default (defaults to today) */}
      {/* Can be expanded later with Accordion if user wants to change date */}

      {/* Submit Button - Large touch target for mobile */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting || createExpense.isPending || updateExpense.isPending}
        sx={{
          minHeight: 44, // 44pt touch target (accessibility requirement)
          fontWeight: 'bold',
        }}
      >
        {(isSubmitting || createExpense.isPending || updateExpense.isPending) 
          ? 'Đang lưu...' 
          : submitButtonText}
      </Button>
    </Box>
  );
}

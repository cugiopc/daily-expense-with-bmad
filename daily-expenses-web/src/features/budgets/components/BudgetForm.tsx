// BudgetForm component for setting monthly budget
// Story 3.2: Set Monthly Budget API and UI
// Implements React Hook Form + Zod + Material-UI pattern

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box } from '@mui/material';
import { useCreateBudget } from '../hooks/useCreateBudget';

// Validation schema following Story 3.2 backend validation
const budgetSchema = z.object({
  amount: z
    .number({ required_error: 'Số tiền phải là số', invalid_type_error: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0')
    .min(0.01, 'Số tiền phải lớn hơn 0'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSuccess?: () => void; // Callback to close dialog after successful submission
  initialAmount?: number; // Pre-fill with current budget amount
}

/**
 * BudgetForm component
 *
 * Key Features (from Story 3.2 Acceptance Criteria):
 * - Amount field auto-focuses on mount
 * - Number keyboard appears automatically on mobile
 * - Validates amount > 0 before submission
 * - Month defaults to current month (first day) - not editable in form
 * - UPSERT pattern: creates new budget or updates existing
 * - Shows success toast "Ngân sách đã được lưu!" on save
 * - Shows error toast on failure
 *
 * Performance: <500ms perceived time (optimistic update)
 */
export function BudgetForm({
  onSuccess,
  initialAmount,
}: BudgetFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    mode: 'onBlur', // Validate on blur (not onChange - too aggressive)
    defaultValues: {
      amount: initialAmount,
    },
  });

  // Reset form when initialAmount changes (for edit mode)
  useEffect(() => {
    if (initialAmount !== undefined) {
      reset({ amount: initialAmount });
    }
  }, [initialAmount, reset]);

  const createBudget = useCreateBudget();

  const onSubmit = (data: BudgetFormData) => {
    // Prevent double submission
    if (createBudget.isPending) {
      return;
    }

    // Calculate first day of current month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Format as ISO 8601 date string (YYYY-MM-DD)
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const day = '01'; // Always first day of month
    const monthString = `${year}-${month}-${day}`;

    // Submit budget data
    createBudget.mutate(
      {
        month: monthString,
        amount: data.amount,
      },
      {
        onSuccess: () => {
          // Close dialog/form after successful submission
          onSuccess?.();
        },
      }
    );
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
      {/* Amount Field - Auto-focused */}
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
            label="Ngân sách (VND)"
            type="number"
            autoFocus // 🎯 CRITICAL: Auto-focus for better UX
            inputProps={{
              min: 0.01,
              step: 0.01,
              inputMode: 'decimal', // Mobile keyboard optimization (numeric with decimal)
            }}
            error={!!errors.amount}
            helperText={errors.amount?.message}
            fullWidth
            required
            placeholder="vd: 15000000"
          />
        )}
      />

      {/* Submit Button - Large touch target for mobile */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={createBudget.isPending}
        sx={{
          minHeight: 44, // 44pt touch target (accessibility requirement from UX spec)
          fontWeight: 'bold',
        }}
      >
        {createBudget.isPending ? 'Đang lưu...' : 'Lưu ngân sách'}
      </Button>
    </Box>
  );
}

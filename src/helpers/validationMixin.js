import { required, email, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators'
import { toRaw } from 'vue'

export function validationRules(props, fields) {
    const valids = {}
    const fv = toRaw(props.field.validations)
    const maxValueOverride = props.maxValueOverride ? parseInt(props.maxValueOverride.replace(/,/g, ''), 10) : 0

    if (fv && fv.required) valids['required'] = required
    if (fv && fv.email) valids['email'] = email
    if (fv && fv.minLength) valids['minLength'] = minLength(fv.minLength)
    if (fv && fv.maxLength) valids['maxLength'] = maxLength(fv.maxLength)
    if (fv && fv.minValue) {
        valids['minValue'] = minValue(props.field.type === 'date' ? new Date(fv.minValue) : fv.minValue)
    }
    if (fv && fv.maxValue) {
        if (props.field.type === 'date') {
            valids['maxValue'] = maxValue(new Date(fv.maxValue))
        } else if (maxValueOverride !== 0) {
            valids['maxValue'] = maxValue(maxValueOverride)
        } else {
            valids['maxValue'] = maxValue(fv.maxValue)
        }
    }

    if (props.field.type === 'date' && props.field.adult)
        valids['maxValue'] = maxValue(props.dateopts.maxDate)
    if (props.field.amountField) {
        valids['lookLoanAmount'] = () => {
            // console.log(12, toRaw(fields))
            return !(
                toRaw(fields['Loan_Amount'].value) >= 100000 &&
                toRaw(fields['Loan_Amount'].value) <= 4000000
            )
        }
    }
    if (props.field.type === 'address') {
        valids['address'] = () => {
            return props.rawValue !== 'novalid'
        }
    }
    return { fieldValue: valids }
}

export function validationMessage(props, v$) {
    const fv = toRaw(props.field.validations);
    const fValue = v$.fieldValue;
    const hasErrors = v$?.$errors?.length;

    if (!fv || !hasErrors) return '';
    if (fValue.minValue?.$invalid) {
        return `Minimum is ${fv.minValue}`
    }
    if (fValue.maxValue?.$invalid) {
        return `Maximum is ${props.maxValueOverride !== null ? props.maxValueOverride : fv.maxValue}`
    }
    if (fValue.required?.$invalid) {
        return 'This field is required'
    }
    return fv && fv.email && v$.value.$errors && v$.value.$errors.length && !v$.value.email
      ? 'Must be a valid email'
      : fv && fv.minLength && v$.value.$errors && v$.value.$errors.length && !v$.value.minLength
        ? `Must have at least ${fv.minLength} characters`
        : fv && fv.maxLength && v$.value.$errors && v$.value.$errors.length && !v$.value.maxLength
          ? `Must be no longer than ${fv.maxLength} characters`
          : fv && fv.minValue && v$?.value?.$errors?.length && !v$.value.minValue
            ? `Minimum iws ${fv.minValue}`
            : fv && fv.maxValue && v$?.value?.$errors?.length && !v$.value.maxValue
              ? `Maximum is ${maxValueOverride !== null ? maxValueOverride : fv.maxValue}`
              : fv &&
                fv.includes && v$.value.$errors &&
                v$.value.$errors.length &&
                !v$.value.custom &&
                props.field.customValidationText
                ? props.field.customValidationText
                : props.field.type === 'date' && props.field.adult && v$.value.$errors && v$.value.$errors.length && !v$.value.maxValue
                  ? 'Should be 18 years old'
                  : props.field.type === 'address' && v$.value.$errors.length
                    ? 'We can’t find this address – please check the spelling.'
                    : props.field.type === 'address' && v$.value.$errors &&
                      v$.value.$errors.length &&
                      !v$.value.full_address &&
                      v$.value.required
                      ? 'Please select full address'
                      : fv &&
                        fv.required && 
                        v$?.value?.$errors?.length &&
                        !v$.value.required &&
                        props.field.type === 'textarea'
                        ? 'Please complete this field'
                        : fv && fv.required && v$?.value?.$errors?.length && !v$.value.required
                          ? 'This field is required'
                          : ''
  }


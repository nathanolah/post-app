import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';
import { 
    FormControl, 
    FormErrorMessage, 
    FormLabel, 
    Input, 
    Textarea
} from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    size: _, // destructured size off of props, its incompatible with Input
    ...props
}) => {

    let InputOrTextarea = Input;
    if (textarea) {
        InputOrTextarea = Textarea as any;
    }

    const [field, { error }] = useField(props); 

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
}
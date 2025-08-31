import type { CustomInputProps } from '@/type';
import cn from 'clsx';
import { FC, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const CustomInput: FC<CustomInputProps> = ({
    placeholder = 'Enter text',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = 'default'
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className='w-full'>
            <Text className='label'>{label}</Text>
            <TextInput
                autoCapitalize='none'
                autoCorrect={false}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor='#888'
                className={cn('input', isFocused ? 'border-primary' : 'border-gray-300')}
            />
        </View>
    )
}

export default CustomInput
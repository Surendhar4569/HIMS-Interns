import { extendTheme } from '@chakra-ui/react';
import { MultiSelectTheme } from "chakra-multiselect";

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    medical: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    }
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'medical',
      },
      variants: {
        solid: {
          bg: 'medical.600',
          color: 'white',
          _hover: {
            bg: 'medical.700',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          transition: 'all 0.2s',
        },
        outline: {
          borderColor: 'medical.600',
          color: 'medical.600',
          _hover: {
            bg: 'medical.50',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          transition: 'all 0.2s',
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'lg',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'xl',
          }
        }
      }
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'gray.50',
            border: '2px solid',
            borderColor: 'transparent',
            _hover: {
              bg: 'gray.100',
              borderColor: 'medical.300',
            },
            _focus: {
              bg: 'white',
              borderColor: 'medical.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-medical-500)',
            }
          }
        }
      },
      defaultProps: {
        variant: 'filled',
      }
    },
    MultiSelect: MultiSelectTheme
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      }
    }
  }
});

export default theme;
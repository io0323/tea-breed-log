// CSS-in-JS with styled-components approach
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :root {
    font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;
  }

  body {
    @apply bg-tea-light text-tea-dark;
  }

  /* カスタムスクロールバー */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full hover:bg-gray-400;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  @apply bg-tea-light;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 1rem;
`;

export const Header = styled.header`
  @apply bg-white shadow-md;
`;

export const Footer = styled.footer`
  @apply bg-gray-100 text-center py-4;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  @apply px-4 py-2 rounded transition-colors;
  ${props => props.variant === 'primary' 
    ? '@apply bg-tea-primary text-white hover:bg-tea-primary-dark' 
    : '@apply bg-gray-200 text-gray-800 hover:bg-gray-300'
  };
`;

export const Card = styled.div`
  @apply bg-white rounded-lg shadow-md p-4;
`;

export const Input = styled.input`
  @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tea-primary;
`;

export const Select = styled.select`
  @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tea-primary;
`;

export const Textarea = styled.textarea`
  @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tea-primary;
`;

export const Form = styled.form`
  @apply space-y-4;
`;

export const FormGroup = styled.div`
  @apply space-y-2;
`;

export const Label = styled.label`
  @apply block text-sm font-medium text-gray-700;
`;

export const ErrorMessage = styled.span`
  @apply text-red-500 text-sm;
`;

export const SuccessMessage = styled.span`
  @apply text-green-500 text-sm;
`;

export const LoadingSpinner = styled.div`
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-tea-primary;
`;

export const Modal = styled.div<{ isOpen: boolean }>`
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  display: ${props => props.isOpen ? 'flex' : 'none'};
`;

export const ModalContent = styled.div`
  @apply bg-white rounded-lg p-6 max-w-md w-full mx-4;
`;

export const ModalHeader = styled.div`
  @apply flex justify-between items-center mb-4;
`;

export const ModalTitle = styled.h2`
  @apply text-xl font-semibold;
`;

export const ModalBody = styled.div`
  @apply mb-4;
`;

export const ModalFooter = styled.div`
  @apply flex justify-end space-x-2;
`;

export const Table = styled.table`
  @apply w-full border-collapse;
`;

export const TableHeader = styled.thead`
  @apply bg-gray-100;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  @apply border-b hover:bg-gray-50;
`;

export const TableCell = styled.td`
  @apply px-4 py-2;
`;

export const TableHeaderCell = styled.th`
  @apply px-4 py-2 text-left font-medium;
`;

export const Badge = styled.span<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  @apply px-2 py-1 rounded-full text-xs font-medium;
  ${props => {
    switch (props.variant) {
      case 'success':
        return '@apply bg-green-100 text-green-800';
      case 'warning':
        return '@apply bg-yellow-100 text-yellow-800';
      case 'error':
        return '@apply bg-red-100 text-red-800';
      case 'info':
        return '@apply bg-blue-100 text-blue-800';
      default:
        return '@apply bg-gray-100 text-gray-800';
    }
  }};
`;

export const Alert = styled.div<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  @apply p-4 rounded-lg mb-4;
  ${props => {
    switch (props.variant) {
      case 'success':
        return '@apply bg-green-100 border border-green-400 text-green-700';
      case 'warning':
        return '@apply bg-yellow-100 border border-yellow-400 text-yellow-700';
      case 'error':
        return '@apply bg-red-100 border border-red-400 text-red-700';
      case 'info':
        return '@apply bg-blue-100 border border-blue-400 text-blue-700';
      default:
        return '@apply bg-gray-100 border border-gray-400 text-gray-700';
    }
  }};
`;

export const Navigation = styled.nav`
  @apply bg-white shadow-md;
`;

export const NavigationList = styled.ul`
  @apply flex space-x-4;
`;

export const NavigationItem = styled.li`
  @apply list-none;
`;

export const NavigationLink = styled.a<{ isActive?: boolean }>`
  @apply px-3 py-2 rounded transition-colors;
  ${props => props.isActive 
    ? '@apply bg-tea-primary text-white' 
    : '@apply text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  };
`;

export const Sidebar = styled.aside<{ isOpen?: boolean }>`
  @apply bg-white shadow-lg transition-all duration-300;
  width: ${props => props.isOpen ? '250px' : '0'};
  overflow: hidden;
`;

export const Content = styled.div<{ sidebarWidth?: number }>`
  margin-left: ${props => props.sidebarWidth || 0}px;
  transition: margin-left 0.3s ease;
`;

export const Grid = styled.div<{ columns?: number }>`
  @apply grid gap-4;
  grid-template-columns: ${props => props.columns ? `repeat(${props.columns}, 1fr)` : 'repeat(auto-fit, minmax(250px, 1fr))'};
`;

export const Flex = styled.div<{ direction?: 'row' | 'column'; justify?: 'start' | 'center' | 'end' | 'between'; align?: 'start' | 'center' | 'end' }>`
  @apply flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'start'};
  align-items: ${props => props.align || 'start'};
`;

export const Spacer = styled.div<{ size?: number }>`
  height: ${props => props.size || 1}rem;
`;

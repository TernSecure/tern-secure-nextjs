import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignIn } from '@/components/signIn';
import { TernSecureAuth } from '@/auth';
import { setIDToken } from '@/actions/auth-server';
// Mock the auth module
jest.mock('@/auth', () => ({
    TernSecureAuth: {
        signIn: jest.fn()
    }
}));
// Mock the server action
jest.mock('@/actions/auth-server', () => ({
    setIDToken: jest.fn()
}));
describe('SignIn Component', () => {
    const mockUser = { email: 'test@example.com' };
    const mockIdToken = 'mock-id-token';
    // Store original window.location
    const originalLocation = window.location;
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.location
        delete window.location;
        window.location = Object.assign(Object.assign({}, originalLocation), { href: '' });
    });
    afterEach(() => {
        // Restore window.location
        window.location = originalLocation;
    });
    test('renders sign in form', () => {
        render(<SignIn />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveTextContent('Sign In');
    });
    test('handles successful sign in with redirect', async () => {
        const onSuccess = jest.fn();
        const redirectUrl = '/dashboard';
        // Mock successful sign in
        TernSecureAuth.signIn.mockResolvedValueOnce({
            user: mockUser,
            idToken: mockIdToken
        });
        render(<SignIn onSuccess={onSuccess} redirectUrl={redirectUrl}/>);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        // Submit form
        fireEvent.click(screen.getByTestId('submit-button'));
        await waitFor(() => {
            expect(TernSecureAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(setIDToken).toHaveBeenCalledWith(mockIdToken);
            expect(onSuccess).toHaveBeenCalledWith(mockUser);
            expect(window.location.href).toBe(redirectUrl);
        });
    });
    test('handles sign in error', async () => {
        const onError = jest.fn();
        const errorMessage = 'Invalid credentials';
        // Mock failed sign in
        TernSecureAuth.signIn.mockRejectedValueOnce(new Error(errorMessage));
        render(<SignIn onError={onError}/>);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'wrong-password' }
        });
        // Submit form
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
            expect(setIDToken).not.toHaveBeenCalled();
        });
    });
    test('applies custom styles', () => {
        const customStyles = {
            form: 'custom-form',
            input: 'custom-input',
            button: 'custom-button',
            errorText: 'custom-error'
        };
        render(<SignIn customStyles={customStyles}/>);
        const form = screen.getByRole('form');
        const emailInput = screen.getByPlaceholderText('Email');
        const submitButton = screen.getByTestId('submit-button');
        expect(form.className).toContain('custom-form');
        expect(emailInput.className).toContain('custom-input');
        expect(submitButton.className).toContain('custom-button');
    });
    test('shows loading state during submission', async () => {
        // Mock slow sign in
        TernSecureAuth.signIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<SignIn />);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        // Submit form
        fireEvent.click(screen.getByTestId('submit-button'));
        // Check loading state immediately after submission
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Signing in...');
        expect(screen.getByTestId('submit-button')).toBeDisabled();
        expect(screen.getByPlaceholderText('Email')).toBeDisabled();
        expect(screen.getByPlaceholderText('Password')).toBeDisabled();
    });
});

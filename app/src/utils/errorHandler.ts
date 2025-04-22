interface ErrorObject {
    message?: string;
    errors?: { message?: string }[];
    data?: { status?: string };
    status?: number;
}

export function handleError(error: unknown): void {
    const errorMessage = getErrorMessage(error);
    console.log(errorMessage);
}

export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object') {
        const errObj = error as ErrorObject;
        if (errObj.message) {
            return errObj.message;
        }

        if (errObj.errors && Array.isArray(errObj.errors) && errObj.errors.length > 0) {
            return errObj.errors[0].message || 'An error occurred.';
        }

        if (errObj.data && errObj.data.status === 'Error') {
            return 'An error occurred during the process.';
        }
    }

    return fallbackMessage || 'Something went wrong.';
}

export const ERROR_MESSAGES = {
    NETWORK:
        'Unable to connect to the server. Please check your internet connection.',
    UNAUTHORIZED: 'Your session has expired. Please sign in again.',
    FORBIDDEN: "You don't have permission to perform this action.",
    NOT_FOUND: 'The requested resource was not found.',
    SERVER: 'An unexpected error occurred. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    DEFAULT: 'Something went wrong. Please try again.',
};

export function getScenarioBasedErrorMessage(error: unknown): string {
    const errorObj = (error || {}) as ErrorObject;

    switch (errorObj.status) {
        case 401:
            return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
            return ERROR_MESSAGES.FORBIDDEN;
        case 404:
            return ERROR_MESSAGES.NOT_FOUND;
        case 422:
            return ERROR_MESSAGES.VALIDATION;
        case 500:
            return ERROR_MESSAGES.SERVER;
        default:
            if (!window.navigator.onLine) {
                return ERROR_MESSAGES.NETWORK;
            }
            return ERROR_MESSAGES.DEFAULT;
    }
}
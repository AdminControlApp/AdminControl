import onetime from 'onetime';
import ora from 'ora';

export const getCallSpinner = onetime(() => ora());

import StepNDA from './StepNDA';
import StepPayment from './StepPayment';
import StepIdentity from './StepIdentity';
import StepTrustName from './StepTrustName';
import StepOrdination from './StepOrdination';
import StepGmailSetup from './StepGmailSetup';
import StepVerificationTools from './StepVerificationTools';
import StepDocumentGeneration from './StepDocumentGeneration';

export const moduleRegistry: Record<string, React.ComponentType<any>> = {
  StepNDA,
  StepPayment,
  StepIdentity,
  StepTrustName,
  StepOrdination,
  StepGmailSetup,
  StepVerificationTools,
  StepDocumentGeneration
};